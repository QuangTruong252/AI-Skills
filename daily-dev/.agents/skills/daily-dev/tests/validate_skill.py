from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    ROOT / "SKILL.md",
    ROOT / "README.md",
    ROOT / "templates" / "active-task.md",
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
        if "name: daily-dev" not in header:
            errors.append("SKILL.md: unexpected name")
        desc_match = re.search(r"^description:\s*(.+)$", header, re.M)
        if not desc_match or not desc_match.group(1).strip().startswith("Use when"):
            errors.append("SKILL.md: description must start with 'Use when'")

    required_phrases = [
        "Minimal triage",
        "WAITING_FOR_CLARIFICATION",
        "primary_skill",
        "secondary_skills",
        "preliminary | confirmed",
        "working-docs/active-task.md",
        "delete the artifact by default",
        "quality-gates.md",
        "MUST NOT execute Git write operations",
        "auditing-frontend-structure",
        "Frontend structure audit routing",
        "inventory validity",
    ]
    for phrase in required_phrases:
        if phrase not in text:
            errors.append(f"SKILL.md: missing required phrase: {phrase}")

    forbidden_phrases = [
        "Quick Lane",
        "Standard Lane",
        "Architecture Lane",
        "Superpowers Routing",
        "superpowers:",
        "Ponytail",
        "Artifact Gate",
        "daily-dev-orchestrator",
    ]
    for phrase in forbidden_phrases:
        if phrase in text:
            errors.append(f"SKILL.md: contains obsolete phrase: {phrase}")

    words = len(re.findall(r"\b\w+[\w'-]*\b", text))
    if words > 2400:
        errors.append(f"SKILL.md: too long ({words} words; max 2400)")

    scenarios_path = ROOT / "tests" / "pressure-scenarios.md"
    if scenarios_path.exists():
        scenario_count = len(
            re.findall(r"^##\s+\d+\.", scenarios_path.read_text(encoding="utf-8"), re.M)
        )
        if scenario_count < 17:
            errors.append(
                f"tests/pressure-scenarios.md: expected at least 17 scenarios, found {scenario_count}"
            )

active_task = ROOT / "templates" / "active-task.md"
if active_task.exists():
    task_text = active_task.read_text(encoding="utf-8")
    for section in [
        "## Routing",
        "## Scope",
        "## Clarification",
        "## Risks and approvals",
        "## Progress",
        "## Validation",
        "## Blockers",
        "## Next action",
        "## Retention",
    ]:
        if section not in task_text:
            errors.append(f"templates/active-task.md: missing section: {section}")

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