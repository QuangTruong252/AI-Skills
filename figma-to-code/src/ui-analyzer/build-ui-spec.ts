import type { Diagnostic } from '../contracts/diagnostics.js';
import { createDiagnostic, sortDiagnostics } from '../contracts/diagnostics.js';
import type { UiSpec, UiSpecNode, UiSpecResponsiveClass } from '../contracts/types.js';
import { SCHEMA_VERSION } from '../contracts/types.js';

/** Offline MCP/design-context shape — never invent live Figma data. */
export type DesignContextInput = {
  nodeId: string;
  name: string;
  type: string;
  figmaNodeUrl?: string;
  screenshotPath?: string;
  children?: DesignContextInput[];
  autoLayout?: UiSpecNode['autoLayout'];
  sizing?: UiSpecNode['sizing'];
  absolute?: boolean;
  width?: number;
  height?: number;
  tokenReferences?: Array<{ property: string; tokenName: string }>;
  hardValues?: Array<{ property: string; value: string | number; unit?: string }>;
  componentHints?: Array<{ name: string; evidence: string[] }>;
  states?: string[];
  assets?: string[];
  /** When screenshot metadata contradicts tree */
  screenshotContradiction?: string;
};

export function classifyResponsive(node: DesignContextInput): UiSpecResponsiveClass {
  if (node.absolute) return 'Decorative absolute';
  if (node.sizing?.horizontal === 'FILL' || node.sizing?.vertical === 'FILL') return 'Fluid';
  if (node.sizing?.horizontal === 'HUG' || node.sizing?.vertical === 'HUG') return 'Intrinsic';
  if (node.sizing?.horizontal === 'FIXED' && node.width && node.width > 0) {
    // Never default frame width to fixed CSS — mark as content-dependent unless explicitly fixed intent
    if (node.type === 'FRAME' && !node.autoLayout) return 'Content-dependent';
    return 'Fixed';
  }
  if (node.autoLayout) return 'Fluid';
  return 'Intrinsic';
}

export function buildUiSpec(input: DesignContextInput): UiSpec {
  const diagnostics: Diagnostic[] = [];

  if (input.screenshotContradiction) {
    diagnostics.push(
      createDiagnostic(
        'UI_SCREENSHOT_TREE_MISMATCH',
        'warning',
        `Screenshot and MCP tree contradiction: ${input.screenshotContradiction}`,
        { source: { nodeId: input.nodeId } },
      ),
    );
  }

  const tree = mapNode(input, diagnostics);

  return {
    schemaVersion: SCHEMA_VERSION,
    source: {
      figmaNodeUrl: input.figmaNodeUrl,
      nodeId: input.nodeId,
      screenshotPath: input.screenshotPath,
    },
    tree,
    assets: input.assets ? [...input.assets].sort() : [],
    states: input.states ? [...input.states].sort() : [],
    diagnostics: sortDiagnostics(diagnostics),
  };
}

function mapNode(input: DesignContextInput, diagnostics: Diagnostic[]): UiSpecNode {
  const tokenReferences = (input.tokenReferences ?? []).map((t) => {
    if (!t.tokenName) {
      diagnostics.push(
        createDiagnostic('UI_TOKEN_MISSING_NAME', 'warning', 'Token reference missing name', {
          source: { nodeId: input.nodeId },
        }),
      );
    }
    return {
      property: t.property,
      tokenName: t.tokenName,
      nodeId: input.nodeId,
    };
  });

  const hardValues = (input.hardValues ?? []).map((h) => ({
    property: h.property,
    value: h.value,
    unit: h.unit,
    severity: 'warning' as const,
  }));

  // Frame width must not become implicit fixed CSS
  if (input.type === 'FRAME' && input.width && !input.sizing) {
    diagnostics.push(
      createDiagnostic(
        'UI_FRAME_WIDTH_NOT_FIXED_CSS',
        'info',
        `Frame width ${input.width} recorded as hard value evidence only; do not emit fixed CSS by default`,
        { source: { nodeId: input.nodeId } },
      ),
    );
  }

  let componentMatch: UiSpecNode['componentMatch'];
  if (input.componentHints?.length) {
    const best = input.componentHints[0]!;
    if (!best.evidence?.length) {
      diagnostics.push(
        createDiagnostic(
          'UI_COMPONENT_MATCH_WEAK',
          'warning',
          `Component match ${best.name} lacks evidence (name-only matches are insufficient)`,
          { source: { nodeId: input.nodeId } },
        ),
      );
      componentMatch = {
        name: best.name,
        confidence: 0.2,
        evidence: [],
      };
    } else {
      componentMatch = {
        name: best.name,
        confidence: 0.75,
        evidence: best.evidence,
      };
    }
  }

  return {
    id: input.nodeId,
    name: input.name,
    type: input.type,
    autoLayout: input.autoLayout,
    sizing: input.sizing,
    tokenReferences,
    hardValues,
    responsiveIntent: classifyResponsive(input),
    componentMatch,
    children: (input.children ?? []).map((c) => mapNode(c, diagnostics)),
  };
}
