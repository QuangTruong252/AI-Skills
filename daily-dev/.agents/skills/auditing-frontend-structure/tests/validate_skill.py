from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPOSITORY_ROOT = ROOT.parents[2]
REQUIRED = (
    ROOT / "SKILL.md",
    ROOT / "agents" / "openai.yaml",
    ROOT / "tests" / "pressure-scenarios.md",
)
errors: list[str] = []

for path in REQUIRED:
    if not path.is_file():
        errors.append(f"missing: {path.relative_to(ROOT)}")

skill = ROOT / "SKILL.md"
if skill.is_file():
    text = skill.read_text(encoding="utf-8")
    if not re.match(
        r"^---\n.*?name:\s*auditing-frontend-structure\n.*?\n---\n", text, re.S
    ):
        errors.append("SKILL.md: invalid frontmatter or name")
    for marker in (
        "Report-only contract",
        "Abstraction ladder",
        "`DELETE`",
        "`MERGE`",
        "`KEEP`",
        "`VERIFY`",
        "workflow_result:",
        "workflow: auditing-frontend-structure",
        "role: primary | secondary",
        "sources_loaded: []",
        "files_changed: []",
        "return_to: daily-dev",
    ):
        if marker not in text:
            errors.append(f"SKILL.md: missing marker: {marker}")

agents = REPOSITORY_ROOT / "AGENTS.md"
route = ".agents/skills/auditing-frontend-structure/SKILL.md"
if not agents.is_file() or route not in agents.read_text(encoding="utf-8"):
    errors.append("AGENTS.md: exact audit route is missing")

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
    print("auditing-frontend-structure package structure: FAIL")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("auditing-frontend-structure package structure: PASS")
