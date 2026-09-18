from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = (
    ROOT / "SKILL.md",
    ROOT / "README.md",
    ROOT / "templates" / "active-task.md",
    ROOT / "tests" / "pressure-scenarios.md",
)
SCENARIO_FIELDS = (
    "**Setup:**",
    "**Prompt:**",
    "**Expected route:**",
    "**Expected status:**",
    "**Required actions:**",
    "**Forbidden actions:**",
    "**Required evidence:**",
)

errors: list[str] = []
for path in REQUIRED:
    if not path.is_file():
        errors.append(f"missing: {path.relative_to(ROOT)}")

skill = ROOT / "SKILL.md"
if skill.is_file():
    text = skill.read_text(encoding="utf-8")
    frontmatter = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not frontmatter:
        errors.append("SKILL.md: missing YAML frontmatter")
    else:
        header = frontmatter.group(1)
        if "name: daily-dev" not in header:
            errors.append("SKILL.md: unexpected name")
        description = re.search(r"^description:\s*(.+)$", header, re.M)
        if not description or not description.group(1).strip().startswith("Use when"):
            errors.append("SKILL.md: description must start with 'Use when'")

    for marker in (
        "## Preflight",
        "## Canonical statuses",
        "## Canonical workflow result",
        "workflow_result:",
        "sources_loaded: []",
        "return_to: daily-dev",
        "active-task-YYYYMMDD-HHMM-<slug>.md",
        "behavioral trials",
    ):
        if marker not in text:
            errors.append(f"SKILL.md: missing marker: {marker}")

template = ROOT / "templates" / "active-task.md"
if template.is_file():
    text = template.read_text(encoding="utf-8")
    for marker in (
        "Task ID:",
        "Created:",
        "active-task-YYYYMMDD-HHMM-<slug>.md",
        "## Preflight",
        "## Routing",
        "## Scope",
        "## Open items",
        "## Workflow results",
        "## Validation",
        "## Retention",
    ):
        if marker not in text:
            errors.append(f"templates/active-task.md: missing marker: {marker}")

scenarios = ROOT / "tests" / "pressure-scenarios.md"
if scenarios.is_file():
    text = scenarios.read_text(encoding="utf-8")
    matches = list(re.finditer(r"^##\s+(DD-\d{2})\s+.+$", text, re.M))
    if not matches:
        errors.append("pressure-scenarios.md: no structured scenarios found")
    ids = [match.group(1) for match in matches]
    if len(ids) != len(set(ids)) or ids != sorted(ids):
        errors.append("pressure-scenarios.md: scenario IDs must be unique and ordered")
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        body = text[match.end() : end]
        positions: list[tuple[int, str]] = []
        for field in SCENARIO_FIELDS:
            occurrences = [found.start() for found in re.finditer(re.escape(field), body)]
            if len(occurrences) != 1:
                errors.append(
                    f"{match.group(0)}: field {field} must occur exactly once"
                )
                continue
            positions.append((occurrences[0], field))
        if len(positions) == len(SCENARIO_FIELDS):
            if [field for _, field in sorted(positions)] != list(SCENARIO_FIELDS):
                errors.append(f"{match.group(0)}: scenario fields are out of order")
            ordered_positions = sorted(positions)
            for field_index, (start, field) in enumerate(ordered_positions):
                value_start = start + len(field)
                value_end = (
                    ordered_positions[field_index + 1][0]
                    if field_index + 1 < len(ordered_positions)
                    else len(body)
                )
                if not body[value_start:value_end].strip():
                    errors.append(f"{match.group(0)}: field {field} is empty")

for path in REQUIRED:
    if not path.is_file() or path.suffix != ".md":
        continue
    text = path.read_text(encoding="utf-8")
    for pattern in (r"^\s*git\s+add\b", r"^\s*git\s+commit\b", r"^\s*git\s+push\b"):
        if re.search(pattern, text, re.M):
            errors.append(f"{path.relative_to(ROOT)}: executable Git write command")

if errors:
    print("daily-dev package structure: FAIL")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("daily-dev package structure: PASS")
print(f"Structured scenarios: {len(matches)}")
