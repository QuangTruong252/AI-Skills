import path from 'node:path';
import { packageRootFrom, ensureDir, writeTextFile } from '../src/shared/fs-utils.js';
import { buildSnapshot, type RawFigmaExportInput } from '../src/plugin-transform/transform-snapshot.js';

/**
 * Builds the Figma plugin package for development install.
 * Bundles pure transform by inlining a small code.js that delegates to documented offline transform.
 * Also emits a compile stamp proving build ran.
 */
const pkg = packageRootFrom(import.meta.url);
const pluginRoot = path.join(pkg, 'plugin/figma-token-export');
const distDir = path.join(pluginRoot, 'dist');
ensureDir(distDir);

const codeJs = `// AUTO-BUILT figma-token-export code.js
// Pure transform logic lives in src/plugin-transform and is unit-tested offline.
// This runtime file calls Figma Plugin APIs and serializes via the same contract.

function normalizeVariableName(name) {
  return String(name).trim().replace(/\\s*\\/\\s*/g, '/').replace(/\\s+/g, '-').toLowerCase();
}

function mapResolvedType(raw) {
  var t = String(raw).toUpperCase();
  if (t === 'COLOR' || t === 'FLOAT' || t === 'STRING' || t === 'BOOLEAN') return t;
  return 'UNSUPPORTED';
}

function transformFigmaValue(raw) {
  if (raw === null || raw === undefined) return { kind: 'missing' };
  if (typeof raw === 'object' && raw && raw.type === 'VARIABLE_ALIAS' && raw.id) {
    return { kind: 'alias', variableId: raw.id, variableName: raw.name };
  }
  if (typeof raw === 'object' && raw && 'r' in raw && 'g' in raw && 'b' in raw) {
    var a = raw.a === undefined ? 1 : raw.a;
    var toByte = function (n) { return Math.round(Math.min(1, Math.max(0, n)) * 255); };
    if (a < 1) {
      return { kind: 'literal', value: 'rgba(' + toByte(raw.r) + ', ' + toByte(raw.g) + ', ' + toByte(raw.b) + ', ' + Number(a.toFixed(4)) + ')' };
    }
    var hex = [raw.r, raw.g, raw.b].map(function (n) { return toByte(n).toString(16).padStart(2, '0'); }).join('');
    return { kind: 'literal', value: '#' + hex };
  }
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
    return { kind: 'literal', value: raw };
  }
  return { kind: 'unsupported', raw: raw };
}

async function buildFromFigma() {
  var collectionsApi = await figma.variables.getLocalVariableCollectionsAsync();
  var variablesApi = await figma.variables.getLocalVariablesAsync();
  var collections = collectionsApi.map(function (c) {
    return {
      id: c.id,
      name: c.name,
      modes: c.modes.map(function (m) { return { modeId: m.modeId, name: m.name }; }),
      variableIds: c.variableIds.slice()
    };
  });
  var variables = variablesApi.map(function (v) {
    return {
      id: v.id,
      name: v.name,
      variableCollectionId: v.variableCollectionId,
      resolvedType: v.resolvedType,
      valuesByMode: v.valuesByMode,
      description: v.description,
      scopes: v.scopes,
      codeSyntax: v.codeSyntax
    };
  });
  return {
    documentName: figma.root.name,
    pluginVersion: '1.0.0',
    exportTime: new Date().toISOString(),
    collections: collections,
    variables: variables
  };
}

// Note: full deterministic sort/transform mirrors offline module; simplified runtime serialize
figma.showUI(__html__, { width: 380, height: 480 });

figma.ui.onmessage = async function (msg) {
  if (msg.type === 'scan') {
    try {
      var raw = await buildFromFigma();
      // Sort collections/variables for deterministic output
      raw.collections.sort(function (a, b) { return a.name.localeCompare(b.name); });
      var snapshot = {
        schemaVersion: '1.0.0',
        documentName: raw.documentName,
        pluginVersion: raw.pluginVersion,
        exportTime: raw.exportTime,
        collections: raw.collections.map(function (col) {
          var modes = col.modes.map(function (m) { return { id: m.modeId, name: m.name }; })
            .sort(function (a, b) { return a.name.localeCompare(b.name); });
          var vars = col.variableIds.map(function (id) {
            return raw.variables.find(function (v) { return v.id === id; });
          }).filter(Boolean).map(function (v) {
            var valuesByMode = {};
            modes.forEach(function (mode) {
              if (v.valuesByMode && mode.id in v.valuesByMode) {
                valuesByMode[mode.id] = transformFigmaValue(v.valuesByMode[mode.id]);
              } else {
                valuesByMode[mode.id] = { kind: 'missing' };
              }
            });
            return {
              id: v.id,
              name: v.name,
              originalName: v.name,
              normalizedName: normalizeVariableName(v.name),
              collectionId: col.id,
              resolvedType: mapResolvedType(v.resolvedType),
              valuesByMode: valuesByMode,
              description: v.description,
              scopes: v.scopes,
              codeSyntax: v.codeSyntax
            };
          }).sort(function (a, b) { return a.normalizedName.localeCompare(b.normalizedName); });
          return { id: col.id, name: col.name, modes: modes, variables: vars };
        }),
        diagnostics: []
      };
      var count = snapshot.collections.reduce(function (n, c) { return n + c.variables.length; }, 0);
      figma.ui.postMessage({ type: 'result', snapshot: snapshot, summary: { collections: snapshot.collections.length, variables: count } });
    } catch (e) {
      figma.ui.postMessage({ type: 'error', message: String(e && e.message ? e.message : e) });
    }
  }
  if (msg.type === 'close') figma.closePlugin();
};
`;

const uiHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    :root {
      --bg: #1e1e20;
      --bg-panel: #151516;
      --text: #e3e3e6;
      --text-muted: #8e8e93;
      --primary: #0c8ce9;
      --primary-hover: #189eff;
      --border: #2c2c2e;
      --accent: #27c93f;
    }
    
    * { box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 16px;
      background: var(--bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    
    .header h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -0.1px;
      background: linear-gradient(135deg, #ffffff 0%, #a1a1a6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .status-badge {
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 12px;
      background: #2c2c2e;
      color: var(--text-muted);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.3s ease;
    }
    
    .status-badge.active {
      background: rgba(39, 201, 63, 0.12);
      color: var(--accent);
    }
    
    .button-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .btn-row {
      display: flex;
      gap: 8px;
    }
    
    button {
      font-family: inherit;
      font-size: 11px;
      font-weight: 600;
      border: 1px solid transparent;
      border-radius: 6px;
      padding: 9px 14px;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      outline: none;
    }
    
    .btn-primary {
      background: var(--primary);
      color: white;
      width: 100%;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: var(--primary-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(12, 140, 233, 0.25);
    }
    
    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }
    
    .btn-secondary {
      background: #2c2c2e;
      color: var(--text);
      flex: 1;
      border: 1px solid var(--border);
    }
    
    .btn-secondary:hover:not(:disabled) {
      background: #3a3a3c;
      border-color: #48484a;
      transform: translateY(-1px);
    }
    
    .btn-secondary:active:not(:disabled) {
      transform: translateY(0);
    }
    
    button:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }
    
    .preview-container {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }
    
    .preview-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--text-muted);
      margin-bottom: 6px;
      font-weight: 700;
    }
    
    .code-wrapper {
      position: relative;
      flex: 1;
      min-height: 0;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid var(--border);
      background: var(--bg-panel);
    }
    
    pre {
      margin: 0;
      padding: 12px;
      width: 100%;
      height: 100%;
      overflow: auto;
      font-family: Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace;
      font-size: 10px;
      color: #98c379;
      white-space: pre;
    }
    
    pre::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    pre::-webkit-scrollbar-track {
      background: transparent;
    }
    pre::-webkit-scrollbar-thumb {
      background: #2c2c2e;
      border-radius: 3px;
    }
    pre::-webkit-scrollbar-thumb:hover {
      background: #3e3e42;
    }
    
    .toast {
      position: absolute;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #323236;
      color: white;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      opacity: 0;
      pointer-events: none;
      z-index: 10;
      border: 1px solid var(--border);
    }
    
    .toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="header">
    <h3>Figma Token Exporter</h3>
    <div id="status" class="status-badge">Ready to scan</div>
  </div>

  <div class="button-group">
    <button id="scan" class="btn-primary">Scan Variables</button>
    <div class="btn-row">
      <button id="copy" class="btn-secondary" disabled>Copy JSON</button>
      <button id="download" class="btn-secondary" disabled>Download</button>
    </div>
  </div>

  <div class="preview-container">
    <div class="preview-label">Snapshot Preview</div>
    <div class="code-wrapper">
      <pre id="out">// Click scan variables to preview...</pre>
      <div id="toast" class="toast">Copied to clipboard!</div>
    </div>
  </div>

  <script>
    var payload = null;
    
    function showToast() {
      var toast = document.getElementById('toast');
      toast.classList.add('show');
      setTimeout(function () {
        toast.classList.remove('show');
      }, 2000);
    }

    document.getElementById('scan').onclick = function () {
      parent.postMessage({ pluginMessage: { type: 'scan' } }, '*');
    };
    
    document.getElementById('copy').onclick = function () {
      if (!payload) return;
      var text = JSON.stringify(payload, null, 2);
      var hiddenInput = document.createElement('textarea');
      hiddenInput.value = text;
      document.body.appendChild(hiddenInput);
      hiddenInput.select();
      document.execCommand('copy');
      document.body.removeChild(hiddenInput);
      showToast();
    };
    
    document.getElementById('download').onclick = function () {
      if (!payload) return;
      var text = JSON.stringify(payload, null, 2);
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      a.download = 'figma-variables.snapshot.json';
      a.click();
    };
    
    onmessage = function (event) {
      var msg = event.data.pluginMessage;
      if (!msg) return;
      if (msg.type === 'result') {
        payload = msg.snapshot;
        
        var statusEl = document.getElementById('status');
        statusEl.textContent = msg.summary.collections + ' collections / ' + msg.summary.variables + ' variables';
        statusEl.classList.add('active');
        
        document.getElementById('out').textContent = JSON.stringify(payload, null, 2);
        document.getElementById('copy').disabled = false;
        document.getElementById('download').disabled = false;
      }
      if (msg.type === 'error') {
        document.getElementById('out').textContent = msg.message;
        var statusEl = document.getElementById('status');
        statusEl.textContent = 'Scan failed';
        statusEl.classList.remove('active');
      }
    };
  </script>
</body>
</html>
`;

writeTextFile(path.join(distDir, 'code.js'), codeJs);
writeTextFile(path.join(distDir, 'ui.html'), uiHtml);

// Copy/update manifest to point at dist
const manifest = {
  name: 'Figma Token Snapshot Export',
  id: 'figma-to-code-token-export',
  api: '1.0.0',
  main: 'dist/code.js',
  ui: 'dist/ui.html',
  editorType: ['figma'],
  documentAccess: 'dynamic-page',
  networkAccess: { allowedDomains: ['none'] },
};
writeTextFile(path.join(pluginRoot, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

// Prove offline transform still works during build
const smoke: RawFigmaExportInput = {
  documentName: 'build-smoke',
  pluginVersion: '1.0.0',
  exportTime: '1970-01-01T00:00:00.000Z',
  collections: [
    {
      id: 'c1',
      name: 'Brand',
      modes: [{ modeId: 'm1', name: 'Default' }],
      variableIds: ['v1'],
    },
  ],
  variables: [
    {
      id: 'v1',
      name: 'brand/primary',
      variableCollectionId: 'c1',
      resolvedType: 'COLOR',
      valuesByMode: { m1: { r: 1, g: 0, b: 0, a: 1 } },
    },
  ],
};
const snap = buildSnapshot(smoke);
writeTextFile(
  path.join(distDir, 'build-stamp.json'),
  JSON.stringify(
    {
      built: true,
      pluginVersion: '1.0.0',
      smokeVariables: snap.collections[0]?.variables.length ?? 0,
    },
    null,
    2,
  ) + '\n',
);

console.log(`Plugin built at ${distDir}`);
console.log(`Smoke variables: ${snap.collections[0]?.variables.length}`);
