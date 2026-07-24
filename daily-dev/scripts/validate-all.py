#!/usr/bin/env python3
"""Run every skill package validator and pack-level consistency checks."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILLS_ROOT = ROOT / ".agents" / "skills"
AGENTS = ROOT / "AGENTS.md"
CORE = ROOT / ".agents" / "rules" / "core.md"
REFERENCES = [
    ROOT / ".agents" / "references" / "TOKENS.md",
    ROOT / ".agents" / "references" / "COMPONENTS.md",
    ROOT / ".agents" / "references" / "PATTERNS.md",
]

# Skills that AGENTS.md must route when active.
ROUTED_SKILLS = {
    "daily-dev",
    "bugfix",
    "feature-change",
    "figma-to-ui",
    "code-review",
    "auditing-frontend-structure",
}

# Soft word budgets for context efficiency. Exceeding is a warning, not a fail,
# except for daily-dev and auditing-frontend-structure which enforce in-package.
WORD_BUDGETS = {
    "daily-dev": 2400,
    "bugfix": 2200,
    "feature-change": 2800,
    "figma-to-ui": 2200,
    "code-review": 2400,
    "auditing-frontend-structure": 1100,
}

MIN_SCENARIOS = {
    "daily-dev": 17,
    "bugfix": 20,
    "feature-change": 40,
    "figma-to-ui": 40,
    "code-review": 40,
    "auditing-frontend-structure": 5,
}


def word_count(text: str) -> int:
    return len(re.findall(r"\b\w+[\w'-]*\b", text))


def scenario_count(path: Path) -> int:
    if not path.is_file():
        return 0
    return len(re.findall(r"^##\s+\d+\.", path.read_text(encoding="utf-8"), re.M))


def run_package_validators() -> list[str]:
    errors: list[str] = []
    for skill_dir in sorted(SKILLS_ROOT.iterdir()):
        if not skill_dir.is_dir():
            continue
        validator = skill_dir / "tests" / "validate_skill.py"
        if not validator.is_file():
            errors.append(f"{skill_dir.name}: missing tests/validate_skill.py")
            continue
        result = subprocess.run(
            [sys.executable, str(validator)],
            cwd=skill_dir,
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode != 0:
            output = (result.stdout or "") + (result.stderr or "")
            errors.append(f"{skill_dir.name}: validator failed\n{output.strip()}")
    return errors


def check_routing_consistency() -> list[str]:
    errors: list[str] = []
    if not AGENTS.is_file():
        return ["AGENTS.md: missing"]
    agents_text = AGENTS.read_text(encoding="utf-8")
    for skill in sorted(ROUTED_SKILLS):
        skill_path = SKILLS_ROOT / skill / "SKILL.md"
        if not skill_path.is_file():
            errors.append(f"routed skill missing package: {skill}")
            continue
        if skill not in agents_text:
            errors.append(f"AGENTS.md: missing route mention for {skill}")
        if f".agents/skills/{skill}/SKILL.md" not in agents_text and skill != "daily-dev":
            # daily-dev is mentioned with path; all should have path
            if f".agents/skills/{skill}/" not in agents_text:
                errors.append(f"AGENTS.md: missing skill path for {skill}")
    if "Inventory validity" not in agents_text:
        errors.append("AGENTS.md: missing Inventory validity section")
    if "Context efficiency" not in agents_text:
        errors.append("AGENTS.md: missing Context efficiency section")
    return errors


def check_core_inventory_gate() -> list[str]:
    errors: list[str] = []
    if not CORE.is_file():
        return ["core.md: missing"]
    text = CORE.read_text(encoding="utf-8")
    if "## Inventory validity" not in text:
        errors.append("core.md: missing Inventory validity section")
    if 'id="inventory-validity"' not in text and "inventory-validity" not in text:
        errors.append("core.md: missing inventory-validity anchor or section id")
    return errors


def check_reference_validity_gates() -> list[str]:
    errors: list[str] = []
    for path in REFERENCES:
        if not path.is_file():
            errors.append(f"missing reference: {path.relative_to(ROOT)}")
            continue
        text = path.read_text(encoding="utf-8")
        if "Validity gate" not in text:
            errors.append(f"{path.relative_to(ROOT)}: missing Validity gate")
        if "stale" not in text.lower():
            errors.append(f"{path.relative_to(ROOT)}: must discuss stale inventory")
    return errors


def check_activation_docs() -> list[str]:
    errors: list[str] = []
    staged_pattern = re.compile(
        r"staged until.*AGENTS\.md|Until `?AGENTS\.md`? routing",
        re.I,
    )
    for skill in ROUTED_SKILLS:
        readme = SKILLS_ROOT / skill / "README.md"
        if not readme.is_file():
            # README is optional for some packages historically; require for routed.
            errors.append(f"{skill}: missing README.md")
            continue
        text = readme.read_text(encoding="utf-8")
        if "Status: Active" not in text and "**Status: Active**" not in text:
            errors.append(f"{skill}/README.md: must declare Status: Active")
        if staged_pattern.search(text):
            errors.append(
                f"{skill}/README.md: still describes package as staged despite AGENTS routing"
            )
        if "_legacy-references" in text:
            errors.append(f"{skill}/README.md: obsolete _legacy-references path")
    return errors


def check_budgets_and_scenarios() -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    for skill, budget in WORD_BUDGETS.items():
        skill_md = SKILLS_ROOT / skill / "SKILL.md"
        if not skill_md.is_file():
            continue
        words = word_count(skill_md.read_text(encoding="utf-8"))
        if words > budget:
            warnings.append(f"{skill}: SKILL.md has {words} words (budget {budget})")
        scenarios = scenario_count(SKILLS_ROOT / skill / "tests" / "pressure-scenarios.md")
        minimum = MIN_SCENARIOS.get(skill, 0)
        if scenarios < minimum:
            errors.append(
                f"{skill}: pressure scenarios {scenarios} < required minimum {minimum}"
            )
    return errors, warnings


def check_no_orphan_orchestrator_name() -> list[str]:
    """Flag positive use of retired names in active policy docs."""
    errors: list[str] = []
    policy_globs = [
        ROOT / "AGENTS.md",
        ROOT / "README.md",
        *ROOT.joinpath(".agents", "rules").glob("*.md"),
        *ROOT.joinpath(".agents", "references").glob("*.md"),
        *ROOT.joinpath(".agents", "skills").glob("*/SKILL.md"),
        *ROOT.joinpath(".agents", "skills").glob("*/README.md"),
        *ROOT.joinpath(".agents", "skills").glob("*/templates/*.md"),
    ]
    for path in policy_globs:
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8")
        for token in ("daily-dev-orchestrator", "Artifact Gate"):
            if token in text:
                errors.append(
                    f"{path.relative_to(ROOT)}: obsolete {token} reference"
                )
    return errors


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    errors.extend(run_package_validators())
    errors.extend(check_routing_consistency())
    errors.extend(check_core_inventory_gate())
    errors.extend(check_reference_validity_gates())
    errors.extend(check_activation_docs())
    budget_errors, budget_warnings = check_budgets_and_scenarios()
    errors.extend(budget_errors)
    warnings.extend(budget_warnings)
    errors.extend(check_no_orphan_orchestrator_name())

    if warnings:
        print("VALIDATION WARNINGS")
        for warning in warnings:
            print(f"- {warning}")
        print()

    if errors:
        print("VALIDATION FAILED")
        for error in errors:
            print(f"- {error}")
        return 1

    print("VALIDATION PASSED")
    print(f"Validated {len(ROUTED_SKILLS)} routed skill packages and pack consistency")
    if warnings:
        print(f"Warnings: {len(warnings)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
