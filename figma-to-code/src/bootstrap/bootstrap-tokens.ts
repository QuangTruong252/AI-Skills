import fs from 'node:fs';
import path from 'node:path';
import { loadConfig, resolveFromPackage, resolveTokenPaths } from '../config/load-config.js';
import type { FigmaVariablesSnapshot, TokenMap, TokenMapEntry } from '../contracts/types.js';
import { pathExists, readJsonFile } from '../shared/fs-utils.js';
import { validateAgainstSchema, schemaDir } from '../shared/validate.js';
import { stableStringify } from '../shared/serialize.js';

export type BootstrapOptions = {
  packageRoot: string;
  write?: boolean;
};

export function runBootstrap(options: BootstrapOptions): { ok: boolean; message: string } {
  const { config, diagnostics } = loadConfig({ packageRoot: options.packageRoot });
  if (diagnostics.some((d) => d.severity === 'error')) {
    return {
      ok: false,
      message: `Invalid configuration: ${diagnostics.map((d) => d.message).join('; ')}`,
    };
  }

  if (!config.bootstrap || !config.bootstrap.rules) {
    return {
      ok: false,
      message: 'No bootstrap rules configured in figma-to-code.config.json',
    };
  }

  const snapshotPath = resolveFromPackage(options.packageRoot, config.figma.snapshotPath);
  if (!pathExists(snapshotPath)) {
    return {
      ok: false,
      message: `Figma snapshot file not found: ${snapshotPath}`,
    };
  }

  const snapshot = readJsonFile<FigmaVariablesSnapshot>(snapshotPath);
  const snapshotSchema = path.join(schemaDir(options.packageRoot), 'figma-variables.snapshot.schema.json');
  
  if (pathExists(snapshotSchema)) {
    const val = validateAgainstSchema(snapshot, snapshotSchema);
    if (!val.ok) {
      return {
        ok: false,
        message: `Figma snapshot validation failed: ${val.diagnostics.map((d) => d.message).join('; ')}`,
      };
    }
  }

  // 1. Build mappings of Figma Variable ID & Name to translated SCSS name
  const idToScssName = new Map<string, string>();
  const nameToScssName = new Map<string, string>();
  const figmaNameMap = new Map<string, string>(); // variableId -> name

  for (const col of snapshot.collections) {
    for (const v of col.variables) {
      figmaNameMap.set(v.id, v.name);
      
      // Find matching bootstrap rule
      let matchedRule = null;
      for (const rule of config.bootstrap.rules) {
        if (rule.figmaCollection === col.name) {
          const re = new RegExp(rule.namePattern);
          if (re.test(v.name)) {
            matchedRule = rule;
            break;
          }
        }
      }

      if (matchedRule) {
        const re = new RegExp(matchedRule.namePattern);
        let scssName = v.name.replace(re, matchedRule.systemNameTemplate);
        scssName = scssName.replace(/[^a-zA-Z0-9_-]/g, '-');
        idToScssName.set(v.id, scssName);
        nameToScssName.set(v.name, scssName);
      }
    }
  }

  // 2. Helper to resolve literal value for recursive fallback
  function resolveLiteralValue(varId: string): string | number | boolean | null {
    for (const col of snapshot.collections) {
      for (const v of col.variables) {
        if (v.id === varId) {
          const modes = Object.values(v.valuesByMode);
          if (modes.length === 0) return null;
          const val = modes[0];
          if (val.kind === 'literal') {
            return val.value;
          } else if (val.kind === 'alias') {
            return resolveLiteralValue(val.variableId);
          }
        }
      }
    }
    return null;
  }

  // 3. Process variables and group into SCSS files and contexts
  // Structure: fileRelativePath -> atRuleContext -> selectorContext -> Array<{ name, value }>
  const fileGroups: Record<string, Record<string, Record<string, Array<{ name: string; value: string }>>>> = {};
  const tokenMapUpdates: TokenMapEntry[] = [];

  for (const col of snapshot.collections) {
    const modeIdToName: Record<string, string> = {};
    for (const m of col.modes) {
      modeIdToName[m.id] = m.name;
    }

    for (const v of col.variables) {
      const scssName = idToScssName.get(v.id);
      if (!scssName) {
        // Unmapped variable
        continue;
      }

      // Record in token-map
      tokenMapUpdates.push({
        figmaToken: v.name,
        systemToken: scssName,
        status: 'approved',
      });

      // Find matching rule again to get output routing & modes mapping
      let rule = null;
      for (const r of config.bootstrap.rules) {
        if (r.figmaCollection === col.name && new RegExp(r.namePattern).test(v.name)) {
          rule = r;
          break;
        }
      }

      if (!rule) continue;

      const file = rule.outputFile;
      if (!fileGroups[file]) {
        fileGroups[file] = {};
      }

      for (const [modeId, modeVal] of Object.entries(v.valuesByMode)) {
        const modeName = modeIdToName[modeId] || modeId;
        const selector = rule.modeSelectorMap?.[modeName] || rule.modeSelectorMap?.[modeId] || ':root';
        const atRule = rule.modeAtRuleMap?.[modeName] || rule.modeAtRuleMap?.[modeId] || '';

        let rawValue = '';
        if (modeVal.kind === 'alias') {
          const targetScss = idToScssName.get(modeVal.variableId);
          if (targetScss) {
            rawValue = `var(${targetScss})`;
          } else {
            // Fallback to literal
            const lit = resolveLiteralValue(modeVal.variableId);
            if (lit !== null) {
              rawValue = String(lit);
            } else {
              rawValue = 'null';
            }
          }
        } else if (modeVal.kind === 'literal') {
          if (v.resolvedType === 'FLOAT') {
            const num = Number(modeVal.value);
            if (
              scssName.includes('column') ||
              scssName.includes('columns') ||
              v.name.toLowerCase().includes('column')
            ) {
              rawValue = String(num);
            } else {
              rawValue = `${num}px`;
            }
          } else if (v.resolvedType === 'STRING') {
            const str = String(modeVal.value);
            rawValue = /^[a-zA-Z0-9_-]+$/.test(str) ? str : `'${str}'`;
          } else {
            rawValue = String(modeVal.value);
          }
        }

        if (!fileGroups[file][atRule]) {
          fileGroups[file][atRule] = {};
        }
        if (!fileGroups[file][atRule][selector]) {
          fileGroups[file][atRule][selector] = [];
        }

        // Avoid exact duplicate additions (same name in same selector/at-rule)
        const existing = fileGroups[file][atRule][selector].find((d) => d.name === scssName);
        if (existing) {
          existing.value = rawValue;
        } else {
          fileGroups[file][atRule][selector].push({ name: scssName, value: rawValue });
        }
      }
    }
  }

  // 4. Write generated SCSS files
  const tokenPaths = resolveTokenPaths(options.packageRoot, config.scss.tokenPaths);
  const destDir = tokenPaths[0] || path.join(options.packageRoot, '../styles/tokens');

  if (options.write) {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const generatedFiles: string[] = [];

    for (const [file, atRules] of Object.entries(fileGroups)) {
      let content = `/* AUTO-GENERATED from Figma snapshot via bootstrap rules */\n`;
      
      for (const [atRule, selectors] of Object.entries(atRules)) {
        const indentAt = atRule ? '  ' : '';
        if (atRule) {
          content += `${atRule} {\n`;
        }

        for (const [selector, decls] of Object.entries(selectors)) {
          content += `${indentAt}${selector} {\n`;
          for (const d of decls) {
            content += `${indentAt}  ${d.name}: ${d.value};\n`;
          }
          content += `${indentAt}}\n`;
        }

        if (atRule) {
          content += `}\n`;
        }
      }

      fs.writeFileSync(path.join(destDir, file), content, 'utf8');
      generatedFiles.push(file);
    }

    // Write _index.scss forwarding all files
    const indexFileName = '_index.scss';
    let indexContent = `/* AUTO-GENERATED token index */\n`;
    for (const f of generatedFiles.sort()) {
      if (f === indexFileName) continue;
      const base = path.basename(f, path.extname(f)).replace(/^_/, '');
      indexContent += `@forward '${base}';\n`;
    }
    fs.writeFileSync(path.join(destDir, indexFileName), indexContent, 'utf8');

    // 5. Update token-map.json
    const mapPath = resolveFromPackage(options.packageRoot, config.mapping.tokenMapPath);
    let tokenMap: TokenMap = {
      schemaVersion: '1.0.0',
      mappings: [],
    };

    if (pathExists(mapPath)) {
      try {
        tokenMap = readJsonFile<TokenMap>(mapPath);
      } catch (e) {
        // Ignore parsing errors and overwrite
      }
    }

    // Build a set of all variables in the current snapshot
    const snapshotFigmaTokens = new Set<string>();
    for (const col of snapshot.collections) {
      for (const v of col.variables) {
        snapshotFigmaTokens.add(v.name);
      }
    }

    // Filter existing mappings to keep only those present in the current snapshot
    tokenMap.mappings = tokenMap.mappings.filter((m) => snapshotFigmaTokens.has(m.figmaToken));

    // Merge mappings, avoiding duplicates
    for (const update of tokenMapUpdates) {
      const idx = tokenMap.mappings.findIndex((m) => m.figmaToken === update.figmaToken);
      if (idx >= 0) {
        tokenMap.mappings[idx] = update;
      } else {
        tokenMap.mappings.push(update);
      }
    }

    // Filter usedFigmaTokens to keep only valid snapshot tokens
    if (tokenMap.usedFigmaTokens) {
      tokenMap.usedFigmaTokens = tokenMap.usedFigmaTokens.filter((t) => snapshotFigmaTokens.has(t));
    }

    // Sort mappings for determinism
    tokenMap.mappings.sort((a, b) => a.figmaToken.localeCompare(b.figmaToken));

    fs.writeFileSync(mapPath, stableStringify(tokenMap), 'utf8');
  }

  return {
    ok: true,
    message: `Bootstrapped ${Object.keys(fileGroups).length} files in ${destDir} and updated mapping.`,
  };
}
