from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    ROOT / "SKILL.md",
    ROOT / "README.md",
    ROOT / "templates" / "bugfix-result.md",
    ROOT / "tests" / "pressure-scenarios.md",
]

errors: list[str] = []
for path in REQUIRED:
    if not path.exists():
        errors.append(f"missing: {path.relative_to(ROOT)}")

skill_path = ROOT / "SKILL.md"
if skill_path.exists():
    text = skill_path.read_text(encoding="utf-8")
    fm = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not fm:
        errors.append("SKILL.md: missing YAML frontmatter")
    else:
        header = fm.group(1)
        if "name: bugfix" not in header:
            errors.append("SKILL.md: unexpected name")
        desc_match = re.search(r"^description:\s*(.+)$", header, re.M)
        if not desc_match or not desc_match.group(1).strip().startswith("Use when"):
            errors.append("SKILL.md: description must start with 'Use when'")

    required_phrases = [
        "INTAKE FROM DAILY-DEV",
        "reproduced | evidence-backed | not-established",
        "confirmed | strong-hypothesis | disproved",
        "directly affected flow",
        "bounded temporary instrumentation",
        "MUST NOT collect secrets",
        "Do not perform destructive or irreversible reproduction",
        "Do not edit generated, vendor, or third-party code",
        "two targeted correction-and-rerun cycles",
        "HANDOFF_REQUIRED",
        "templates/bugfix-result.md",
        "MUST NOT execute Git write operations",
    ]
    for phrase in required_phrases:
        if phrase not in text:
            errors.append(f"SKILL.md: missing required phrase: {phrase}")

    forbidden_phrases = [
        "Quick Lane",
        "Standard Lane",
        "Architecture Lane",
        "superpowers:",
        "git commit -m",
        "patch the symptom",
    ]
    for phrase in forbidden_phrases:
        if phrase in text:
            errors.append(f"SKILL.md: contains forbidden phrase: {phrase}")

    words = len(re.findall(r"\b\w+[\w'-]*\b", text))
    if words > 3600:
        errors.append(f"SKILL.md: too long ({words} words; max 3600)")

result_template = ROOT / "templates" / "bugfix-result.md"
if result_template.exists():
    result_text = result_template.read_text(encoding="utf-8")
    for phrase in [
        "status: completed | approval-required | blocked | handoff-required",
        "original_failure_path: PASS | FAIL | NOT RUN",
        "diagnostic_changes_removed: true",
        "developer_verification_required:",
        "return_to: daily-dev",
    ]:
        if phrase not in result_text:
            errors.append(f"templates/bugfix-result.md: missing phrase: {phrase}")

scenario_path = ROOT / "tests" / "pressure-scenarios.md"
if scenario_path.exists():
    scenario_text = scenario_path.read_text(encoding="utf-8")
    scenario_count = len(re.findall(r"^## \d+\.", scenario_text, re.M))
    if scenario_count < 30:
        errors.append(f"pressure-scenarios.md: expected at least 30 scenarios, found {scenario_count}")

for path in REQUIRED:
    if not path.exists() or path.suffix != ".md":
        continue
    text = path.read_text(encoding="utf-8")
    for pattern in [r"^\s*git\s+commit\b", r"^\s*git\s+add\b", r"^\s*git\s+push\b"]:
        if re.search(pattern, text, re.M):
            errors.append(f"{path.relative_to(ROOT)}: executable forbidden Git command")

if errors:
    print("VALIDATION FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("VALIDATION PASSED")
print(f"Validated {len(REQUIRED)} required files")
