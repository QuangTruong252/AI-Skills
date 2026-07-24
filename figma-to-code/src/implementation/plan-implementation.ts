export type ImplementationStrategy =
  | 'Existing component'
  | 'Extend existing component'
  | 'Compose existing components'
  | 'Create new component'
  | 'Plain semantic HTML';

export type ImplementationPlanItem = {
  nodeId: string;
  nodeName: string;
  strategy: ImplementationStrategy;
  component?: string;
  tokens: string[];
  notes: string[];
};

export type ImplementationPlan = {
  items: ImplementationPlanItem[];
  rules: string[];
};

export function buildImplementationPlan(input: {
  nodes: Array<{
    id: string;
    name: string;
    componentMatch?: { name: string; confidence: number; evidence: string[] };
    tokenReferences?: Array<{ tokenName: string }>;
    prefersHtml?: boolean;
  }>;
  availableComponents: string[];
}): ImplementationPlan {
  const available = new Set(input.availableComponents);
  const items: ImplementationPlanItem[] = input.nodes.map((n) => {
    const tokens = (n.tokenReferences ?? []).map((t) => t.tokenName);
    const notes: string[] = [];
    let strategy: ImplementationStrategy = 'Plain semantic HTML';
    let component: string | undefined;

    if (n.prefersHtml) {
      strategy = 'Plain semantic HTML';
    } else if (n.componentMatch && n.componentMatch.confidence >= 0.7 && available.has(n.componentMatch.name)) {
      strategy = 'Existing component';
      component = n.componentMatch.name;
      notes.push(...n.componentMatch.evidence);
    } else if (n.componentMatch && available.has(n.componentMatch.name)) {
      strategy = 'Extend existing component';
      component = n.componentMatch.name;
      notes.push('Match confidence below 0.7; prefer extend over clone');
    } else if (n.componentMatch && !available.has(n.componentMatch.name)) {
      strategy = 'Create new component';
      component = n.componentMatch.name;
      notes.push('No existing component registry hit; create only if reuse is impossible');
    }

    notes.push('Use semantic/application tokens from registry; never raw Figma hex');
    notes.push('Prefer flex/grid, intrinsic sizing, existing breakpoint mixins');

    return {
      nodeId: n.id,
      nodeName: n.name,
      strategy,
      component,
      tokens,
      notes,
    };
  });

  return {
    items,
    rules: [
      'Do not copy raw Figma colors',
      'Do not use Figma token names if registry maps to application tokens',
      'Hardcoded values require explicit justification',
      'Avoid fixed width/height from desktop frames',
      'Avoid absolute positioning for main layout',
      'Do not create duplicate shared components',
    ],
  };
}

export function lintTokenUsage(input: {
  usedTokens: string[];
  resolvedMappings: Record<string, { systemToken: string }>;
  systemTokenNames: string[];
}): { ok: boolean; unresolved: string[]; nonSemantic: string[] } {
  const system = new Set(input.systemTokenNames);
  const unresolved: string[] = [];
  const nonSemantic: string[] = [];

  for (const t of input.usedTokens) {
    if (t.startsWith('--figma-') || (!t.startsWith('--') && !input.resolvedMappings[t])) {
      // Figma-side name
      if (!input.resolvedMappings[t]) unresolved.push(t);
      continue;
    }
    if (t.startsWith('--') && !system.has(t)) {
      unresolved.push(t);
    }
    if (t.startsWith('--brand-') || /^#[0-9a-fA-F]{3,8}$/.test(t)) {
      nonSemantic.push(t);
    }
  }

  return {
    ok: unresolved.length === 0,
    unresolved: [...new Set(unresolved)].sort(),
    nonSemantic: [...new Set(nonSemantic)].sort(),
  };
}
