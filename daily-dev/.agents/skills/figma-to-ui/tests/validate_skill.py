from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = (
    ROOT / "SKILL.md",
    ROOT / "README.md",
    ROOT / "templates" / "figma-to-ui-result.md",
    ROOT / "tests" / "pressure-scenarios.md",
)
errors: list[str] = []

for path in REQUIRED:
    if not path.is_file():
        errors.append(f"missing: {path.relative_to(ROOT)}")

skill = ROOT / "SKILL.md"
if skill.is_file():
    text = skill.read_text(encoding="utf-8")
    if not re.match(r"^---\n.*?name:\s*figma-to-ui\n.*?\n---\n", text, re.S):
        errors.append("SKILL.md: invalid frontmatter or name")
    for marker in (
        "## Source authority",
        "## UI change authorization",
        "## Mapping classification",
        "## Missing capability",
        "templates/figma-to-ui-result.md",
        "workflow_result:",
        "return_to: daily-dev",
    ):
        if marker not in text:
            errors.append(f"SKILL.md: missing marker: {marker}")

result = ROOT / "templates" / "figma-to-ui-result.md"
if result.is_file():
    text = result.read_text(encoding="utf-8")
    for marker in (
        "workflow_result:",
        "workflow: figma-to-ui",
        "role: primary | secondary",
        "clarification-required",
        "sources_loaded: []",
        "scope_completed:",
        "files_changed: []",
        "validation:",
        "open_items:",
        "return_to: daily-dev",
    ):
        if marker not in text:
            errors.append(f"templates/figma-to-ui-result.md: missing marker: {marker}")
    for legacy in ("figma_to_ui_result:", "recommended_task_state:"):
        if legacy in text:
            errors.append(f"templates/figma-to-ui-result.md: legacy contract {legacy}")

scenarios = ROOT / "tests" / "pressure-scenarios.md"
if scenarios.is_file():
    text = scenarios.read_text(encoding="utf-8")
    matches = list(re.finditer(r"^##\s+(\d+)\.\s+.+$", text, re.M))
    if not matches:
        errors.append("pressure-scenarios.md: no scenarios found")
    ids = [int(match.group(1)) for match in matches]
    if len(ids) != len(set(ids)) or ids != sorted(ids):
        errors.append("pressure-scenarios.md: IDs must be unique and ordered")
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        body = text[match.end() : end]
        prompt = re.search(
            r"^\*\*Prompt:\*\*\s*(.*?)(?=^\*\*Expected:\*\*)",
            body,
            re.M | re.S,
        )
        expected = re.search(r"^\*\*Expected:\*\*\s*(.*)$", body, re.M | re.S)
        if not prompt or not prompt.group(1).strip():
            errors.append(f"scenario {match.group(1)}: missing non-empty Prompt")
        if not expected or not expected.group(1).strip():
            errors.append(f"scenario {match.group(1)}: missing non-empty Expected")

if errors:
    print("figma-to-ui package structure: FAIL")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("figma-to-ui package structure: PASS")
