#!/usr/bin/env python3
"""Validate the daily-dev pack's static structure and cross-file contracts."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILLS_ROOT = ROOT / ".agents" / "skills"
AGENTS = ROOT / "AGENTS.md"
CORE = ROOT / ".agents" / "rules" / "core.md"

ROUTED_SKILLS = (
    "daily-dev",
    "bugfix",
    "feature-change",
    "figma-to-ui",
    "code-review",
    "auditing-frontend-structure",
)

RESULT_TEMPLATES = {
    "bugfix": SKILLS_ROOT / "bugfix" / "templates" / "bugfix-result.md",
    "feature-change": (
        SKILLS_ROOT / "feature-change" / "templates" / "feature-change-result.md"
    ),
    "figma-to-ui": (
        SKILLS_ROOT / "figma-to-ui" / "templates" / "figma-to-ui-result.md"
    ),
    "code-review": (
        SKILLS_ROOT / "code-review" / "templates" / "code-review-result.md"
    ),
}

CANONICAL_RESULT_MARKERS = (
    "workflow_result:",
    "role: primary | secondary",
    "status: in-progress | completed | clarification-required | approval-required | blocked | handoff-required",
    "sources_loaded: []",
    "scope_completed:",
    "files_changed: []",
    "validation:",
    "open_items:",
    "return_to: daily-dev",
)

LEGACY_RESULT_MARKERS = (
    "workflow_scope_result:",
    "recommended_task_state:",
    "secondary_result:",
    "feature_change_result:",
    "figma_to_ui_result:",
    "code_review_result:",
    "bugfix_result:",
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

WORD_BUDGETS = {
    "daily-dev": 1800,
    "bugfix": 3600,
    "feature-change": 4200,
    "figma-to-ui": 3600,
    "code-review": 3600,
    "auditing-frontend-structure": 1400,
}


def read_utf8(path: Path, errors: list[str]) -> str:
    if not path.is_file():
        errors.append(f"missing: {path.relative_to(ROOT)}")
        return ""
    raw = path.read_bytes()
    if raw.startswith(b"\xef\xbb\xbf"):
        errors.append(f"{path.relative_to(ROOT)}: UTF-8 BOM is not allowed")
    try:
        return raw.decode("utf-8").replace("\r\n", "\n").replace("\r", "\n")
    except UnicodeDecodeError as exc:
        errors.append(f"{path.relative_to(ROOT)}: invalid UTF-8 ({exc})")
        return ""


def word_count(text: str) -> int:
    return len(re.findall(r"\b\w+[\w'-]*\b", text))


def run_package_validators() -> list[str]:
    errors: list[str] = []
    for skill in ROUTED_SKILLS:
        validator = SKILLS_ROOT / skill / "tests" / "validate_skill.py"
        if not validator.is_file():
            errors.append(f"{skill}: missing tests/validate_skill.py")
            continue
        result = subprocess.run(
            [sys.executable, str(validator)],
            cwd=validator.parent.parent,
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode != 0:
            output = ((result.stdout or "") + (result.stderr or "")).strip()
            errors.append(f"{skill}: package validator failed\n{output}")
    return errors


def check_bootstrap_contract(errors: list[str]) -> None:
    text = read_utf8(AGENTS, errors)
    if not text:
        return

    for marker in (
        "## Bootstrap contract",
        "## Non-negotiable invariants",
        "## Required reading",
        "## Ordered workflow routing",
        "### Optional secondary routing",
        "The first matching predicate wins.",
        "Select the preliminary route",
        "Build the internal preflight receipt for that selected route",
        "Confirm the route and start task work",
        "mandatory_sources: []",
        "sources_loaded: []",
        "missing_sources: []",
        "route: <workflow | clarification-required>",
        "`mandatory_sources` and `sources_loaded` MUST both include `AGENTS.md`",
        "Any repository change or routed specialized workflow",
        "Any routed Figma visual work, primary or secondary",
        "except a report-only template/SCSS structure audit",
        "`mandatory_sources` MUST include `AGENTS.md`",
        "not visual-only with Figma as the main acceptance source",
        "select every applicable bounded secondary",
        "preflight receipt with its mandatory sources",
    ):
        if marker not in text:
            errors.append(f"AGENTS.md: missing bootstrap contract marker: {marker}")

    invariant_section = re.search(
        r"^## Non-negotiable invariants\s*$\n(.*?)(?=^##\s)",
        text,
        re.M | re.S,
    )
    expected_invariants = {
        "missing-mandatory-source": "stop-and-ask-developer",
        "unresolved-clarification": "stop-and-ask-developer",
        "git-write": "developer-only",
        "secondary-return": "daily-dev",
        "whole-task-owner": "daily-dev",
    }
    if not invariant_section:
        errors.append("AGENTS.md: cannot parse invariant section")
    else:
        pairs = [
            (rule_id.strip(), behavior.strip())
            for rule_id, behavior in re.findall(
                r"^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|",
                invariant_section.group(1),
                re.M,
            )
            if rule_id.strip() not in {"Rule ID", "---"}
        ]
        ids = [rule_id for rule_id, _ in pairs]
        if len(ids) != len(set(ids)):
            errors.append("AGENTS.md: invariant Rule IDs must be unique")
        if dict(pairs) != expected_invariants or len(pairs) != len(
            expected_invariants
        ):
            errors.append(
                "AGENTS.md: invariant table must equal "
                f"{expected_invariants}, found {pairs}"
            )

    primary_matches = list(
        re.finditer(
            r"^\|\s*(\d+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*$",
            text,
            re.M,
        )
    )
    orders = [int(match.group(1)) for match in primary_matches]
    if orders != list(range(1, 8)):
        errors.append(
            f"AGENTS.md: workflow route order must be exactly 1..7, found {orders}"
        )
    expected_predicates = {
        1: "requested outcome is evaluation without implementation",
        2: "change is limited to repository instructions",
        3: "Existing accepted behavior is broken",
        4: "New product behavior",
        5: "implementation is visual-only",
        6: "Evidence is insufficient",
        7: "Repository work is required",
    }
    rows = {
        int(match.group(1)): (match.group(2), match.group(3))
        for match in primary_matches
    }
    for order, fragment in expected_predicates.items():
        if fragment not in rows.get(order, ("", ""))[0]:
            errors.append(
                f"AGENTS.md: route {order} must contain predicate fragment: {fragment}"
            )

    expected_primary_paths = {
        1: (
            ".agents/skills/auditing-frontend-structure/SKILL.md",
            ".agents/skills/code-review/SKILL.md",
        ),
        2: (".agents/skills/daily-dev/SKILL.md",),
        3: (".agents/skills/bugfix/SKILL.md",),
        4: (".agents/skills/feature-change/SKILL.md",),
        5: (".agents/skills/figma-to-ui/SKILL.md",),
        6: ("clarification-required",),
        7: (".agents/skills/daily-dev/SKILL.md",),
    }
    for order, required_paths in expected_primary_paths.items():
        route_cell = rows.get(order, ("", ""))[1]
        for required_path in required_paths:
            if required_path not in route_cell:
                errors.append(
                    f"AGENTS.md: primary route {order} missing route-cell target "
                    f"{required_path}"
                )

    secondary_matches = list(
        re.finditer(
            r"^\|\s*(S\d+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*$",
            text,
            re.M,
        )
    )
    secondary_rows = {
        match.group(1): (match.group(2), match.group(3))
        for match in secondary_matches
    }
    if list(secondary_rows) != ["S1", "S2", "S3"]:
        errors.append(
            "AGENTS.md: optional secondary route order must be S1, S2, S3"
        )
    expected_secondary_paths = {
        "S1": ".agents/skills/figma-to-ui/SKILL.md",
        "S2": ".agents/skills/code-review/SKILL.md",
        "S3": ".agents/skills/auditing-frontend-structure/SKILL.md",
    }
    for order, required_path in expected_secondary_paths.items():
        route_cell = secondary_rows.get(order, ("", ""))[1]
        if required_path not in route_cell:
            errors.append(
                f"AGENTS.md: secondary route {order} missing route-cell target "
                f"{required_path}"
            )

    for skill in ROUTED_SKILLS:
        exact_path = f".agents/skills/{skill}/SKILL.md"
        if exact_path not in text:
            errors.append(f"AGENTS.md: missing exact routed skill path: {exact_path}")


def check_frontmatter_and_budgets(
    errors: list[str], warnings: list[str]
) -> None:
    for skill in ROUTED_SKILLS:
        path = SKILLS_ROOT / skill / "SKILL.md"
        text = read_utf8(path, errors)
        if not text:
            continue
        frontmatter = re.match(r"^---\n(.*?)\n---\n", text, re.S)
        if not frontmatter:
            errors.append(f"{skill}/SKILL.md: missing YAML frontmatter")
        else:
            header = frontmatter.group(1)
            entries = []
            for line in header.splitlines():
                match = re.match(r"^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$", line)
                if not match:
                    errors.append(
                        f"{skill}/SKILL.md: unsupported frontmatter line: {line}"
                    )
                    continue
                entries.append(match.groups())
            keys = [key for key, _ in entries]
            values = dict(entries)
            if keys != ["name", "description"]:
                errors.append(
                    f"{skill}/SKILL.md: frontmatter keys must be exactly "
                    f"['name', 'description'], found {keys}"
                )
            if values.get("name") != skill:
                errors.append(f"{skill}/SKILL.md: unexpected name")
            if not values.get("description", "").strip().startswith("Use when"):
                errors.append(
                    f"{skill}/SKILL.md: description must start with 'Use when'"
                )

        budget = WORD_BUDGETS[skill]
        words = word_count(text)
        if words > budget:
            warnings.append(f"{skill}/SKILL.md: {words} words (budget {budget})")


def check_result_contracts(errors: list[str]) -> None:
    daily = read_utf8(SKILLS_ROOT / "daily-dev" / "SKILL.md", errors)
    for marker in CANONICAL_RESULT_MARKERS:
        if marker not in daily:
            errors.append(f"daily-dev/SKILL.md: missing result marker: {marker}")
    check_result_envelope(
        daily,
        SKILLS_ROOT / "daily-dev" / "SKILL.md",
        "<workflow-name>",
        errors,
    )

    for workflow, path in RESULT_TEMPLATES.items():
        text = read_utf8(path, errors)
        if not text:
            continue
        if f"workflow: {workflow}" not in text:
            errors.append(f"{path.relative_to(ROOT)}: wrong or missing workflow owner")
        for marker in CANONICAL_RESULT_MARKERS:
            if marker not in text:
                errors.append(f"{path.relative_to(ROOT)}: missing marker: {marker}")
        check_result_envelope(text, path, workflow, errors)

    inline_result_skills = (
        "feature-change",
        "figma-to-ui",
        "code-review",
        "auditing-frontend-structure",
    )
    for workflow in inline_result_skills:
        path = SKILLS_ROOT / workflow / "SKILL.md"
        text = read_utf8(path, errors)
        for marker in CANONICAL_RESULT_MARKERS:
            if marker not in text:
                errors.append(
                    f"{path.relative_to(ROOT)}: missing result marker: {marker}"
                )
        check_result_envelope(text, path, workflow, errors)

    policy_paths = [
        *SKILLS_ROOT.glob("*/SKILL.md"),
        *SKILLS_ROOT.glob("*/README.md"),
        *SKILLS_ROOT.glob("*/templates/*.md"),
        *(
            path
            for path in SKILLS_ROOT.glob("*/tests/pressure-scenarios.md")
            if path.parent.parent.name != "daily-dev"
        ),
    ]
    uppercase_status = re.compile(
        r"\b(?:COMPLETED|WAITING_FOR_CLARIFICATION|APPROVAL_REQUIRED|"
        r"BLOCKED|HANDOFF_REQUIRED)\b"
    )
    for path in policy_paths:
        text = read_utf8(path, errors)
        for marker in LEGACY_RESULT_MARKERS:
            if marker in text:
                errors.append(f"{path.relative_to(ROOT)}: legacy result marker {marker}")
        match = uppercase_status.search(text)
        if match:
            errors.append(
                f"{path.relative_to(ROOT)}: legacy status {match.group(0)}"
            )


def check_result_envelope(
    text: str, path: Path, expected_workflow: str, errors: list[str]
) -> None:
    blocks = [
        block
        for block in re.findall(r"```yaml\n(.*?)\n```", text, re.S)
        if re.search(r"^workflow_result:\s*$", block, re.M)
    ]
    if len(blocks) != 1:
        errors.append(
            f"{path.relative_to(ROOT)}: expected one canonical workflow_result "
            f"YAML block, found {len(blocks)}"
        )
        return

    fields: list[str] = []
    values: dict[str, str] = {}
    for line in blocks[0].splitlines():
        match = re.match(r"^  ([^ \t#][^:]*):\s*(.*)$", line)
        if not match:
            continue
        key, value = match.groups()
        key = key.strip()
        fields.append(key)
        values[key] = value

    expected_fields = [
        "workflow",
        "role",
        "status",
        "sources_loaded",
        "scope_completed",
        "files_changed",
        "validation",
        "open_items",
        "return_to",
    ]
    if fields != expected_fields:
        errors.append(
            f"{path.relative_to(ROOT)}: workflow_result fields must be "
            f"{expected_fields}, found {fields}"
        )

    expected_values = {
        "workflow": expected_workflow,
        "role": "primary | secondary",
        "status": (
            "in-progress | completed | clarification-required | "
            "approval-required | blocked | handoff-required"
        ),
        "return_to": "daily-dev",
    }
    for field, expected in expected_values.items():
        if values.get(field) != expected:
            errors.append(
                f"{path.relative_to(ROOT)}: {field} must be {expected!r}, "
                f"found {values.get(field)!r}"
            )


def check_artifact_contract(errors: list[str]) -> None:
    skill = read_utf8(SKILLS_ROOT / "daily-dev" / "SKILL.md", errors)
    template_path = SKILLS_ROOT / "daily-dev" / "templates" / "active-task.md"
    template = read_utf8(template_path, errors)
    artifact_pattern = "working-docs/active-task-YYYYMMDD-HHMM-<slug>.md"

    if artifact_pattern not in skill or artifact_pattern not in template:
        errors.append("daily-dev: per-task artifact path contract is incomplete")
    for marker in (
        "MUST include second-level time plus a unique suffix",
        "Never overwrite it",
        "YYYY-MM-DD-HHMMSS-<task-id>-<report-kind>.md",
    ):
        if marker not in skill:
            errors.append(f"daily-dev/SKILL.md: missing artifact marker: {marker}")
    for marker in ("Task ID:", "Created:", "Before updating or deleting"):
        if marker not in template:
            errors.append(f"{template_path.relative_to(ROOT)}: missing {marker}")
    for marker in (
        "YYYYMMDD-HHMMSS-unique-suffix",
        "Before creation",
        "append a numeric slug",
    ):
        if marker not in template:
            errors.append(
                f"{template_path.relative_to(ROOT)}: missing collision marker: {marker}"
            )
    if "working-docs/active-task.md" in template:
        errors.append("active-task template: legacy singleton path is forbidden")

    for path in (
        SKILLS_ROOT / "daily-dev" / "SKILL.md",
        SKILLS_ROOT / "daily-dev" / "README.md",
        SKILLS_ROOT / "code-review" / "SKILL.md",
    ):
        text = read_utf8(path, errors)
        for paragraph in re.split(r"\n\s*\n", text):
            if "working-docs/active-task.md" not in paragraph:
                continue
            if "legacy" not in paragraph.lower() or not re.search(
                r"\b(?:never|not valid)\b", paragraph, re.I
            ):
                errors.append(
                    f"{path.relative_to(ROOT)}: singleton path is not explicitly forbidden"
                )


def check_daily_scenarios(errors: list[str]) -> None:
    path = SKILLS_ROOT / "daily-dev" / "tests" / "pressure-scenarios.md"
    text = read_utf8(path, errors)
    if not text:
        return
    matches = list(re.finditer(r"^##\s+(DD-\d{2})\s+.+$", text, re.M))
    if not matches:
        errors.append(f"{path.relative_to(ROOT)}: no structured scenarios found")
    ids = [match.group(1) for match in matches]
    if len(ids) != len(set(ids)) or ids != sorted(ids):
        errors.append(
            f"{path.relative_to(ROOT)}: scenario IDs must be unique and ordered"
        )
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
        if match.group(1) != "DD-11":
            legacy_status = re.search(
                r"\b(?:COMPLETED|WAITING_FOR_CLARIFICATION|APPROVAL_REQUIRED|"
                r"BLOCKED|HANDOFF_REQUIRED)\b",
                body,
            )
            if legacy_status:
                errors.append(
                    f"{match.group(0)}: legacy status {legacy_status.group(0)}"
                )
            for marker in LEGACY_RESULT_MARKERS:
                if marker in body:
                    errors.append(f"{match.group(0)}: legacy result marker {marker}")
    if "Behavioral execution status: `NOT RUN`" not in text:
        errors.append(
            f"{path.relative_to(ROOT)}: must distinguish unrun behavioral evidence"
        )


def check_inventory_contract(errors: list[str]) -> None:
    core = read_utf8(CORE, errors)
    if "## Inventory validity" not in core or "inventory-validity" not in core:
        errors.append("core.md: missing inventory validity contract")
    for name in ("TOKENS.md", "COMPONENTS.md", "PATTERNS.md"):
        path = ROOT / ".agents" / "references" / name
        text = read_utf8(path, errors)
        if "Validity gate" not in text or "stale" not in text.lower():
            errors.append(f"{path.relative_to(ROOT)}: missing stale inventory gate")


def check_markdown_links(errors: list[str]) -> None:
    policy_paths = [
        AGENTS,
        ROOT / "README.md",
        *ROOT.joinpath(".agents", "rules").glob("*.md"),
        *ROOT.joinpath(".agents", "references").glob("*.md"),
        *SKILLS_ROOT.glob("*/SKILL.md"),
        *SKILLS_ROOT.glob("*/README.md"),
        *SKILLS_ROOT.glob("*/templates/*.md"),
    ]
    for path in policy_paths:
        text = read_utf8(path, errors)
        for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", text):
            target = target.strip().strip("<>")
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            path_part = target.split("#", 1)[0]
            if not path_part:
                continue
            resolved = path.parent / Path(path_part)
            if not resolved.exists():
                errors.append(
                    f"{path.relative_to(ROOT)}: broken local Markdown link: {target}"
                )


def check_repository_safety(errors: list[str]) -> None:
    patterns = (
        r"^\s*(?:[-*]\s*)?git\s+add\b",
        r"^\s*(?:[-*]\s*)?git\s+commit\b",
        r"^\s*(?:[-*]\s*)?git\s+push\b",
        r"^\s*(?:[-*]\s*)?git\s+(?:merge|rebase|tag)\b",
        r"^\s*(?:[-*]\s*)?gh\s+pr\s+create\b",
    )
    policy_paths = [
        AGENTS,
        *ROOT.joinpath(".agents", "rules").glob("*.md"),
        *SKILLS_ROOT.glob("*/SKILL.md"),
        *SKILLS_ROOT.glob("*/README.md"),
        *SKILLS_ROOT.glob("*/templates/*.md"),
    ]
    for path in policy_paths:
        text = read_utf8(path, errors)
        for pattern in patterns:
            if re.search(pattern, text, re.M | re.I):
                errors.append(
                    f"{path.relative_to(ROOT)}: executable Git write instruction"
                )


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    errors.extend(run_package_validators())
    check_bootstrap_contract(errors)
    check_frontmatter_and_budgets(errors, warnings)
    check_result_contracts(errors)
    check_artifact_contract(errors)
    check_daily_scenarios(errors)
    check_inventory_contract(errors)
    check_markdown_links(errors)
    check_repository_safety(errors)

    if warnings:
        print("STRUCTURE VALIDATION WARNINGS")
        for warning in warnings:
            print(f"- {warning}")
        print()

    if errors:
        print("STRUCTURE VALIDATION FAILED")
        for error in errors:
            print(f"- {error}")
        return 1

    print("STRUCTURE VALIDATION PASSED")
    print(f"Validated {len(ROUTED_SKILLS)} routed skill packages")
    print("Behavioral evidence: NOT RUN (execute scenarios in fresh GPT/Gemini sessions)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
