#!/usr/bin/env python3
"""Structural check for the angular-motion skill package.

Checks required files, SKILL.md frontmatter, relative link resolution, and
pattern-index coverage. Does NOT compile Angular, run animations, or verify
accessibility -- see README.md 'What has and hasn't been verified'.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REQUIRED = ["SKILL.md", "README.md", "references/patterns/README.md"]
LINK = re.compile(r"\]\((?!https?:|#)([^)\s]+\.md)\)")
BACKTICK_PATH = re.compile(r"`((?:references|examples)/[\w./-]+\.md)`")


def errors():
    for name in REQUIRED:
        if not (ROOT / name).is_file():
            yield f"{name}: missing required file"

    skill = ROOT / "SKILL.md"
    if skill.is_file():
        text = skill.read_text(encoding="utf-8")
        if not text.startswith("---\n"):
            yield "SKILL.md: missing YAML frontmatter"
        else:
            front = text.split("---\n", 2)[1]
            for field in ("name", "description"):
                if not re.search(rf"^{field}:\s*\S", front, re.M):
                    yield f"SKILL.md: frontmatter missing '{field}'"

    for doc in sorted(ROOT.rglob("*.md")):
        text = doc.read_text(encoding="utf-8")
        rel = doc.relative_to(ROOT).as_posix()
        for target in LINK.findall(text):
            if not (doc.parent / target).resolve().is_file():
                yield f"{rel}: broken link -> {target}"
        for target in BACKTICK_PATH.findall(text):
            if not (ROOT / target).is_file():
                yield f"{rel}: backtick path does not resolve -> {target}"

    index = ROOT / "references/patterns/README.md"
    if index.is_file():
        listed = set(LINK.findall(index.read_text(encoding="utf-8")))
        on_disk = {p.name for p in (ROOT / "references/patterns").glob("*.md")} - {"README.md"}
        for name in sorted(on_disk - listed):
            yield f"references/patterns/README.md: {name} exists but is not indexed"
        for name in sorted(listed - on_disk):
            yield f"references/patterns/README.md: indexes {name}, which does not exist"


def main() -> int:
    found = list(errors())
    for line in found:
        print(f"ERROR {line}")
    docs = sum(1 for _ in ROOT.rglob("*.md"))
    print(f"{'FAIL' if found else 'OK'}: {docs} documents, {len(found)} error(s)")
    return 1 if found else 0


if __name__ == "__main__":
    sys.exit(main())
