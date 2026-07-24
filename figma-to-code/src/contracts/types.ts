import type { Diagnostic } from './diagnostics.js';

export const SCHEMA_VERSION = '1.0.0' as const;
export const SUPPORTED_SCHEMA_VERSIONS = ['1.0.0'] as const;

export type FigmaVariableType =
  | 'COLOR'
  | 'FLOAT'
  | 'STRING'
  | 'BOOLEAN'
  | 'UNSUPPORTED';

export type FigmaValue =
  | { kind: 'literal'; value: string | number | boolean }
  | { kind: 'alias'; variableId: string; variableName?: string }
  | { kind: 'missing' }
  | { kind: 'unsupported'; raw: unknown };

export type FigmaVariable = {
  id: string;
  name: string;
  originalName: string;
  normalizedName: string;
  collectionId: string;
  resolvedType: FigmaVariableType;
  valuesByMode: Record<string, FigmaValue>;
  description?: string;
  scopes?: string[];
  codeSyntax?: Record<string, string>;
};

export type FigmaMode = {
  id: string;
  name: string;
};

export type FigmaCollection = {
  id: string;
  name: string;
  modes: FigmaMode[];
  variables: FigmaVariable[];
};

export type FigmaVariablesSnapshot = {
  schemaVersion: string;
  documentName: string;
  pluginVersion: string;
  exportTime: string;
  collections: FigmaCollection[];
  diagnostics?: Diagnostic[];
};

export type SystemTokenDeclaration = {
  name: string;
  layer: string;
  tokenType: string | 'unknown';
  rawValue: string;
  references: string[];
  selectorContext: string[];
  atRuleContext: string[];
  theme?: string;
  responsiveContext?: string;
  isPrivate: boolean;
  source: {
    file: string;
    line: number;
    column: number;
  };
};

export type SystemTokenRegistry = {
  schemaVersion: string;
  declarations: SystemTokenDeclaration[];
  importGraph: Record<string, string[]>;
  diagnostics: Diagnostic[];
};

export type TokenMapEntry = {
  figmaToken: string;
  systemToken: string;
  status: 'approved' | 'suggested' | 'rejected';
  type?: string;
  notes?: string;
};

export type TokenMap = {
  schemaVersion: string;
  mappings: TokenMapEntry[];
  usedFigmaTokens?: string[];
};

export type ResolvedMapping = {
  figmaToken: string;
  systemToken: string;
  status: 'approved';
  figmaType?: string;
  systemType?: string;
  modes?: Record<string, string>;
};

export type SuggestedMapping = {
  figmaToken: string;
  systemToken: string;
  status: 'suggested';
  confidence: number;
  reason: string;
};

export type TokenRegistryGenerated = {
  schemaVersion: string;
  figmaTokens: Record<string, FigmaVariable>;
  systemTokens: Record<string, SystemTokenDeclaration[]>;
  resolvedMappings: Record<string, ResolvedMapping>;
  suggestedMappings: Record<string, SuggestedMapping>;
  diagnostics: {
    unmappedFigmaTokens: string[];
    missingSystemTokens: string[];
    typeMismatches: string[];
    modeMismatches: string[];
    valueDrifts: string[];
    circularAliases: string[];
    brokenReferences: string[];
    items: Diagnostic[];
  };
};

export type UiSpecResponsiveClass =
  | 'Intrinsic'
  | 'Fluid'
  | 'Fixed'
  | 'Min/max constrained'
  | 'Breakpoint-dependent'
  | 'Content-dependent'
  | 'Decorative absolute';

export type UiSpecNode = {
  id: string;
  name: string;
  type: string;
  children?: UiSpecNode[];
  autoLayout?: {
    direction?: string;
    padding?: unknown;
    gap?: unknown;
    alignment?: string;
  };
  sizing?: {
    horizontal?: string;
    vertical?: string;
  };
  constraints?: unknown;
  tokenReferences?: Array<{
    property: string;
    tokenName: string;
    nodeId: string;
  }>;
  hardValues?: Array<{
    property: string;
    value: string | number;
    unit?: string;
    severity: 'info' | 'warning' | 'error';
  }>;
  responsiveIntent?: UiSpecResponsiveClass;
  componentMatch?: {
    name: string;
    confidence: number;
    evidence: string[];
  };
};

export type UiSpec = {
  schemaVersion: string;
  source: {
    figmaNodeUrl?: string;
    nodeId?: string;
    screenshotPath?: string;
  };
  tree: UiSpecNode;
  assets?: string[];
  states?: string[];
  diagnostics: Diagnostic[];
};

export type BootstrapRule = {
  figmaCollection: string;
  namePattern: string;
  systemNameTemplate: string;
  outputFile: string;
  modeSelectorMap?: Record<string, string>;
  modeAtRuleMap?: Record<string, string>;
};

export type FigmaToCodeConfig = {
  schemaVersion: string;
  projectRoot?: string;
  scss: {
    tokenPaths: string[];
    includePrivate?: boolean;
    tokenNamespaces: string[];
    privatePrefix: string;
    layerHeuristics: Record<string, string>;
  };
  figma: {
    snapshotPath: string;
    pluginVersion: string;
  };
  mapping: {
    tokenMapPath: string;
  };
  output: {
    registryPath: string;
    adapterScssPath: string;
    uiSpecPath: string;
    systemRegistryDebugPath?: string;
  };
  breakpoints: {
    source: string;
    viewports: Array<{ name: string; width: number }>;
  };
  valueDrift: {
    enabled: boolean;
    normalizeColors: boolean;
  };
  freezeExportTime?: string;
  bootstrap?: {
    rules: BootstrapRule[];
  };
};
