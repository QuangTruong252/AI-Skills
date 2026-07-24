import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { scanTokenPaths } from '../../src/scanner/scan-tokens.js';
import { packageRootFrom } from '../../src/shared/fs-utils.js';

const pkg = packageRootFrom(import.meta.url);
const fixtures = path.join(pkg, 'tests/fixtures/scss');

describe('SCSS scanner', () => {
  it('preserves primay typo name, themes, color-mix, multiline font, multi shadow, media include', () => {
    const reg = scanTokenPaths({
      tokenPaths: [path.join(fixtures, 'edge-cases.scss')],
      includePrivate: false,
    });

    const names = reg.declarations.map((d) => d.name);
    expect(names).toContain('--alias-primay-default');
    expect(names).not.toContain('--_choice-size');

    const light = reg.declarations.find(
      (d) => d.name === '--mapped-surface-page' && d.theme === 'light',
    );
    const dark = reg.declarations.find(
      (d) => d.name === '--mapped-surface-page' && d.theme === 'dark',
    );
    expect(light).toBeTruthy();
    expect(dark).toBeTruthy();
    // same name light/dark is not duplicate error
    expect(
      reg.diagnostics.filter((d) => d.code === 'TOKEN_DUPLICATE_DECLARATION'),
    ).toHaveLength(0);

    const hover = reg.declarations.find((d) => d.name === '--app-hover-bg');
    expect(hover?.rawValue).toContain('color-mix');

    const font = reg.declarations.find((d) => d.name === '--app-font-family-heading');
    expect(font?.rawValue).toContain('Roboto');
    expect(font?.rawValue.includes('\n') || font?.rawValue.includes('system-ui')).toBe(true);

    const shadow = reg.declarations.find((d) => d.name === '--app-shadow-e1');
    expect(shadow?.rawValue).toContain('rgba');

    const gap = reg.declarations.find((d) => d.name === '--app-layout-gap-padding');
    expect(gap?.responsiveContext).toMatch(/media-up/);
  });

  it('includes private only when configured', () => {
    const reg = scanTokenPaths({
      tokenPaths: [path.join(fixtures, 'edge-cases.scss')],
      includePrivate: true,
    });
    expect(reg.declarations.some((d) => d.name === '--_choice-size')).toBe(true);
  });

  it('detects circular references', () => {
    const reg = scanTokenPaths({ tokenPaths: [path.join(fixtures, 'cycle.scss')] });
    expect(reg.diagnostics.some((d) => d.code === 'TOKEN_CIRCULAR_REFERENCE')).toBe(true);
  });

  it('detects broken references', () => {
    const reg = scanTokenPaths({ tokenPaths: [path.join(fixtures, 'broken-ref.scss')] });
    expect(reg.diagnostics.some((d) => d.code === 'TOKEN_BROKEN_REFERENCE')).toBe(true);
  });

  it('detects duplicate in same context', () => {
    const reg = scanTokenPaths({ tokenPaths: [path.join(fixtures, 'duplicate.scss')] });
    expect(reg.diagnostics.some((d) => d.code === 'TOKEN_DUPLICATE_DECLARATION')).toBe(true);
  });

  it('scans real styles/ token tree without crash and excludes private', () => {
    const stylesTokens = path.resolve(pkg, '../styles/tokens');
    const variables = path.resolve(pkg, '../styles/_variables.scss');
    const reg = scanTokenPaths({
      tokenPaths: [stylesTokens, variables],
      includePrivate: false,
      tokenNamespaces: ['--brand-', '--alias-', '--mapped-', '--state-', '--app-', '--calendar-'],
      layerHeuristics: {
        brand: 'brand',
        alias: 'alias',
        'mapped-light': 'mapped',
        'mapped-dark': 'mapped',
        state: 'state',
        semantic: 'semantic',
        typography: 'typography',
        responsive: 'responsive',
        effects: 'effects',
        variables: 'app',
      },
    });

    expect(reg.declarations.length).toBeGreaterThan(80);
    expect(reg.declarations.some((d) => d.name.startsWith('--_'))).toBe(false);
    expect(reg.declarations.some((d) => d.name === '--alias-primay-default')).toBe(true);

    const lightMapped = reg.declarations.filter(
      (d) => d.name.startsWith('--mapped-') && (d.theme === 'light' || d.theme === 'root'),
    );
    const darkMapped = reg.declarations.filter(
      (d) => d.name.startsWith('--mapped-') && d.theme === 'dark',
    );
    expect(lightMapped.length).toBeGreaterThan(1);
    expect(darkMapped.length).toBeGreaterThan(1);

    // styles.scss not in token paths by default — private vars there not scanned
    expect(reg.diagnostics.some((d) => d.code === 'SCSS_PARSE_ERROR')).toBe(false);
  });

  it('does not scan files outside configured paths', () => {
    const reg = scanTokenPaths({
      tokenPaths: [path.join(fixtures, 'edge-cases.scss')],
    });
    // no styles.scss tokens
    expect(reg.declarations.every((d) => d.source.file.includes('edge-cases'))).toBe(true);
  });
});
