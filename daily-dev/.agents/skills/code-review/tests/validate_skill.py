from __future__ import annotations

import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "SKILL.md"
README = ROOT / "README.md"
RESULT = ROOT / "templates" / "code-review-result.md"
SCENARIOS = ROOT / "tests" / "pressure-scenarios.md"

REQUIRED_FILES = (SKILL, README, RESULT, SCENARIOS)

REQUIRED_SKILL_MARKERS = (
    "name: code-review",
    "# Code Review",
    "## Activation and ownership",
    "## Review-only boundary",
    "## Review modes",
    "change-review",
    "targeted-audit",
    "evidence-review",
    "## Source authority",
    "## Review sequence",
    "## Finding eligibility",
    "## Severity model",
    "P0",
    "P1",
    "P2",
    "P3",
    "## Confidence model",
    "## Finding format",
    "## No-findings behavior",
    "## Result and return",
    "return_to: daily-dev",
    "../../rules/core.md#high-risk-changes",
    "../../rules/core.md#shared-component-changes",
    "../../rules/quality-gates.md",
)

REQUIRED_RESULT_MARKERS = (
    "code_review_result:",
    "workflow_scope:",
    "review_mode:",
    "findings:",
    "questions_or_required_verification:",
    "validation:",
    "assessment:",
    "recommended_follow_up:",
    "return_to: daily-dev",
)

FORBIDDEN_GIT_PATTERNS = (
    r"(?m)^\s*(?:[-*]\s*)?(?:`{0,3})?git\s+add\b",
    r"(?m)^\s*(?:[-*]\s*)?(?:`{0,3})?git\s+commit\b",
    r"(?m)^\s*(?:[-*]\s*)?(?:`{0,3})?git\s+push\b",
    r"(?m)^\s*(?:[-*]\s*)?(?:`{0,3})?git\s+merge\b",
    r"(?m)^\s*(?:[-*]\s*)?(?:`{0,3})?git\s+rebase\b",
    r"(?m)^\s*(?:[-*]\s*)?(?:`{0,3})?git\s+tag\b",
    r"(?m)^\s*(?:[-*]\s*)?(?:`{0,3})?gh\s+pr\s+create\b",
)

FORBIDDEN_POLICY_DUPLICATION = (
    "This is the canonical and complete approval-trigger list",
    "For code changes, run every configured applicable gate",
    "For each distinct validation failure whose root cause",
    "Every completed implementation response MUST use this structure",
)

FORBIDDEN_BEHAVIOR = (
    "review-and-fix",
    "auto-fix",
    "fix critical issues immediately",
    "invoke bugfix directly",
    "invoke feature-change directly",
    "invoke figma-to-ui directly",
)

SCENARIO_PATTERN = re.compile(r"^##\s+(\d+)\.\s+", re.MULTILINE)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def validate_files(errors: list[str]) -> None:
    for path in REQUIRED_FILES:
        require(path.is_file(), f"Missing required file: {path.relative_to(ROOT)}", errors)


def validate_skill(errors: list[str]) -> None:
    if not SKILL.is_file():
        return
    text = read(SKILL)
    require(text.startswith("---\n"), "SKILL.md must start with YAML front matter", errors)
    for marker in REQUIRED_SKILL_MARKERS:
        require(marker in text, f"SKILL.md missing marker: {marker}", errors)
    for phrase in FORBIDDEN_POLICY_DUPLICATION:
        require(phrase not in text, f"SKILL.md duplicates canonical policy: {phrase}", errors)
    for phrase in FORBIDDEN_BEHAVIOR:
        require(phrase not in text.lower(), f"SKILL.md contains forbidden behavior: {phrase}", errors)
    for pattern in FORBIDDEN_GIT_PATTERNS:
        require(
            re.search(pattern, text, re.IGNORECASE) is None,
            f"SKILL.md contains forbidden Git write instruction: {pattern}",
            errors,
        )


def validate_readme(errors: list[str]) -> None:
    if not README.is_file():
        return
    text = read(README)
    for marker in (
        "# Code Review",
        "## Package",
        "## Activation",
        "## Canonical ownership",
        "python tests/validate_skill.py",
    ):
        require(marker in text, f"README.md missing marker: {marker}", errors)
    for phrase in FORBIDDEN_POLICY_DUPLICATION:
        require(phrase not in text, f"README.md duplicates canonical policy: {phrase}", errors)


def validate_result(errors: list[str]) -> None:
    if not RESULT.is_file():
        return
    text = read(RESULT)
    for marker in REQUIRED_RESULT_MARKERS:
        require(marker in text, f"Result template missing marker: {marker}", errors)


def validate_scenarios(errors: list[str]) -> None:
    if not SCENARIOS.is_file():
        return
    text = read(SCENARIOS)
    numbers = [int(value) for value in SCENARIO_PATTERN.findall(text)]
    require(len(numbers) == 60, f"Expected exactly 60 scenarios, found {len(numbers)}", errors)
    require(numbers == list(range(1, 61)), "Scenario numbering must be contiguous from 1 to 60", errors)
    require(text.count("**Prompt:**") == 60, "Every scenario must contain one **Prompt:**", errors)
    require(text.count("**Expected:**") == 60, "Every scenario must contain one **Expected:**", errors)


def package_digest() -> str:
    digest = hashlib.sha256()
    for path in sorted(REQUIRED_FILES):
        if path.is_file():
            digest.update(path.relative_to(ROOT).as_posix().encode("utf-8"))
            digest.update(b"\0")
            digest.update(path.read_bytes())
            digest.update(b"\0")
    return digest.hexdigest()


def main() -> int:
    errors: list[str] = []
    validate_files(errors)
    validate_skill(errors)
    validate_readme(errors)
    validate_result(errors)
    validate_scenarios(errors)

    if errors:
        print("code-review package validation: FAIL")
        for error in errors:
            print(f"- {error}")
        return 1

    print("code-review package validation: PASS")
    print(f"package-sha256: {package_digest()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
