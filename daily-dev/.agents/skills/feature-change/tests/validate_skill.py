from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    ROOT / "SKILL.md",
    ROOT / "README.md",
    ROOT / "templates" / "feature-change-result.md",
    ROOT / "tests" / "pressure-scenarios.md",
]

errors: list[str] = []

for path in REQUIRED:
    if not path.exists():
        errors.append(f"missing: {path.relative_to(ROOT)}")
        continue
    raw = path.read_bytes()
    if raw.startswith(b"\xef\xbb\xbf"):
        errors.append(f"{path.relative_to(ROOT)}: UTF-8 BOM is not allowed")
    try:
        raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        errors.append(f"{path.relative_to(ROOT)}: not valid UTF-8 ({exc})")

skill_path = ROOT / "SKILL.md"
if skill_path.exists():
    text = skill_path.read_text(encoding="utf-8")
    fm = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not fm:
        errors.append("SKILL.md: missing YAML frontmatter")
    else:
        header = fm.group(1)
        if "name: feature-change" not in header:
            errors.append("SKILL.md: unexpected name")
        desc_match = re.search(r"^description:\s*(.+)$", header, re.M)
        if not desc_match or not desc_match.group(1).strip().startswith("Use when"):
            errors.append("SKILL.md: description must start with 'Use when'")

    required_phrases = [
        "INTAKE FROM DAILY-DEV",
        "WAITING_FOR_CLARIFICATION",
        "bounded discovery",
        "explicit | derived",
        "acceptance_criterion:",
        "canonical_gate_handoff:",
        "candidate_design:",
        "smallest coherent design",
        "invalidation_map:",
        "PASS | FAIL | NOT RUN",
        "workflow_scope_result:",
        "recommended_task_state:",
        "templates/feature-change-result.md",
        "daily-dev owns the final task exit state",
        "MUST NOT execute Git write operations",
        "new or upgraded dependency is proposal-only",
        "Do not edit generated, vendor, or third-party output",
    ]
    for phrase in required_phrases:
        if phrase not in text:
            errors.append(f"SKILL.md: missing required phrase: {phrase}")

    required_references = [
        "../../../AGENTS.md",
        "../../rules/core.md",
        "../../rules/quality-gates.md",
    ]
    for reference in required_references:
        if reference not in text:
            errors.append(f"SKILL.md: missing canonical reference: {reference}")

    forbidden_phrases = [
        "Quick Lane",
        "Standard Lane",
        "Architecture Lane",
        "superpowers:",
        "feature-change owns the final task exit state",
        "feature-change owns whole-task ownership",
        "git commit -m",
        "git push origin",
    ]
    for phrase in forbidden_phrases:
        if phrase in text:
            errors.append(f"SKILL.md: contains forbidden phrase: {phrase}")

    words = len(re.findall(r"\b\w+[\w'-]*\b", text))
    if words > 4200:
        errors.append(f"SKILL.md: too long ({words} words; max 4200)")

result_template = ROOT / "templates" / "feature-change-result.md"
if result_template.exists():
    result_text = result_template.read_text(encoding="utf-8")
    for phrase in [
        "status: completed | approval-required | blocked | handoff-required",
        "status: COMPLETED | WAITING_FOR_CLARIFICATION | APPROVAL_REQUIRED | BLOCKED | HANDOFF_REQUIRED",
        "source_kind: explicit | derived",
        "validation_status: PASS | FAIL | NOT RUN",
        "risk_status: none | preliminary | confirmed",
        "real_data_execution: NOT RUN",
        "sensitive_data_collected: false",
        "git_actions_executed: false",
        "return_to: daily-dev",
    ]:
        if phrase not in result_text:
            errors.append(
                f"templates/feature-change-result.md: missing phrase: {phrase}"
            )

scenario_path = ROOT / "tests" / "pressure-scenarios.md"
scenario_count = 0
if scenario_path.exists():
    scenario_text = scenario_path.read_text(encoding="utf-8")
    numbers = [
        int(number)
        for number in re.findall(r"^## (\d+)\.", scenario_text, re.M)
    ]
    scenario_count = len(numbers)
    if scenario_count != 60:
        errors.append(
            f"pressure-scenarios.md: expected exactly 60 scenarios, found {scenario_count}"
        )
    if numbers != list(range(1, 61)):
        errors.append("pressure-scenarios.md: scenario numbering must be contiguous 1..60")
    prompt_count = len(re.findall(r"^\*\*Prompt:\*\*", scenario_text, re.M))
    expected_count = len(re.findall(r"^\*\*Expected:\*\*", scenario_text, re.M))
    if prompt_count != 60:
        errors.append(
            f"pressure-scenarios.md: expected 60 Prompt blocks, found {prompt_count}"
        )
    if expected_count != 60:
        errors.append(
            f"pressure-scenarios.md: expected 60 Expected blocks, found {expected_count}"
        )

readme_path = ROOT / "README.md"
if readme_path.exists():
    readme_text = readme_path.read_text(encoding="utf-8")
    for phrase in [
        "feature-change/",
        "feature-change-result.md",
        "pressure-scenarios.md",
        "python tests/validate_skill.py",
        "Pressure scenarios: 60",
    ]:
        if phrase not in readme_text:
            errors.append(f"README.md: missing phrase: {phrase}")

for path in REQUIRED:
    if not path.exists() or path.suffix != ".md":
        continue
    text = path.read_text(encoding="utf-8")
    for pattern in [
        r"^\s*git\s+add\b",
        r"^\s*git\s+commit\b",
        r"^\s*git\s+push\b",
        r"^\s*git\s+merge\b",
        r"^\s*git\s+rebase\b",
        r"^\s*gh\s+pr\s+create\b",
    ]:
        if re.search(pattern, text, re.M):
            errors.append(f"{path.relative_to(ROOT)}: executable forbidden Git command")

if errors:
    print("VALIDATION FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("VALIDATION PASSED")
print(f"Validated {len(REQUIRED)} required files")
print(f"Pressure scenarios: {scenario_count}")
