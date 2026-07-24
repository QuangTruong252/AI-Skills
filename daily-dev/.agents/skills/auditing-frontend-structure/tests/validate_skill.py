from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPOSITORY_ROOT = ROOT.parents[2]
REQUIRED = [
    ROOT / "SKILL.md",
    ROOT / "agents" / "openai.yaml",
    ROOT / "tests" / "pressure-scenarios.md",
]

errors: list[str] = []

for path in REQUIRED:
    if not path.exists():
        errors.append(f"missing: {path.relative_to(ROOT)}")

skill_path = ROOT / "SKILL.md"
if skill_path.exists():
    text = skill_path.read_text(encoding="utf-8")
    frontmatter = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not frontmatter:
        errors.append("SKILL.md: missing YAML frontmatter")
    else:
        header = frontmatter.group(1)
        if "name: auditing-frontend-structure" not in header:
            errors.append("SKILL.md: unexpected name")
        description = re.search(r"^description:\s*(.+)$", header, re.M)
        if not description or not description.group(1).strip().startswith("Use when"):
            errors.append("SKILL.md: description must start with 'Use when'")

    words = len(re.findall(r"\b\w+[\w'-]*\b", text))
    if words > 1100:
        errors.append(f"SKILL.md: too long ({words} words; max 1100)")

    for required_phrase in [
        "Report-only contract",
        "Abstraction ladder",
        "`DELETE`",
        "`MERGE`",
        "`KEEP`",
        "`VERIFY`",
        "working-docs/reports/",
        "working-docs/active-task.md",
        "return_to: daily-dev",
        "do not manufacture advice",
        "MUST NOT redefine policy",
    ]:
        if required_phrase not in text:
            errors.append(f"SKILL.md: missing required phrase: {required_phrase}")

    if "Artifact Gate" in text:
        errors.append("SKILL.md: obsolete phrase 'Artifact Gate'")

    if "TODO" in text:
        errors.append("SKILL.md: unresolved TODO")

metadata_path = ROOT / "agents" / "openai.yaml"
if metadata_path.exists():
    metadata = metadata_path.read_text(encoding="utf-8")
    if "$auditing-frontend-structure" not in metadata:
        errors.append("agents/openai.yaml: default prompt must mention the skill")

daily_dev_path = REPOSITORY_ROOT / ".agents" / "skills" / "daily-dev" / "SKILL.md"
if not daily_dev_path.exists():
    errors.append("daily-dev/SKILL.md: missing")
else:
    daily_dev_text = daily_dev_path.read_text(encoding="utf-8")
    if "auditing-frontend-structure" not in daily_dev_text:
        errors.append("daily-dev/SKILL.md: audit route is not integrated")
    if "Frontend structure audit routing" not in daily_dev_text:
        errors.append("daily-dev/SKILL.md: missing frontend structure audit routing section")

agents_path = REPOSITORY_ROOT / "AGENTS.md"
if not agents_path.exists():
    errors.append("AGENTS.md: missing")
elif "auditing-frontend-structure" not in agents_path.read_text(encoding="utf-8"):
    errors.append("AGENTS.md: audit skill is not routed")

scenarios_path = ROOT / "tests" / "pressure-scenarios.md"
if scenarios_path.exists():
    scenario_count = len(
        re.findall(r"^##\s+\d+\.", scenarios_path.read_text(encoding="utf-8"), re.M)
    )
    if scenario_count < 5:
        errors.append(
            f"tests/pressure-scenarios.md: expected at least 5 scenarios, found {scenario_count}"
        )

if errors:
    print("VALIDATION FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("VALIDATION PASSED")
print(f"Validated {len(REQUIRED)} required files and daily-dev integration")
