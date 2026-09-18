#!/usr/bin/env python3
"""Prove the pack validator rejects known contract regressions."""

from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SOURCE_ROOT = Path(__file__).resolve().parents[1]


class ValidatorMutationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.root = Path(self.temp_dir.name) / "daily-dev"
        shutil.copytree(SOURCE_ROOT, self.root)

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def run_validator(self) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(self.root / "scripts" / "validate-all.py")],
            cwd=self.root,
            capture_output=True,
            text=True,
            check=False,
        )

    def replace_required(self, relative_path: str, old: str, new: str) -> None:
        path = self.root / relative_path
        text = path.read_text(encoding="utf-8")
        self.assertIn(old, text, f"test fixture missing expected contract in {relative_path}")
        path.write_text(text.replace(old, new), encoding="utf-8")

    def assert_mutation_rejected(
        self, relative_path: str, old: str, new: str
    ) -> None:
        self.replace_required(relative_path, old, new)
        result = self.run_validator()
        output = result.stdout + result.stderr
        self.assertNotEqual(
            result.returncode,
            0,
            f"validator accepted unsafe mutation in {relative_path}\n{output}",
        )

    def test_current_pack_reports_structure_only(self) -> None:
        result = self.run_validator()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("STRUCTURE VALIDATION PASSED", result.stdout)
        self.assertNotIn("\nVALIDATION PASSED", result.stdout)

    def test_daily_dev_route_path_removal_is_rejected(self) -> None:
        self.assert_mutation_rejected(
            "AGENTS.md",
            ".agents/skills/daily-dev/SKILL.md",
            "daily-dev",
        )

    def test_route_cell_path_removal_is_rejected(self) -> None:
        self.assert_mutation_rejected(
            "AGENTS.md",
            (
                "| 2 | The change is limited to repository instructions, rules, "
                "skills, documentation, validators, tests for those assets, or "
                "configuration maintenance | "
                "`.agents/skills/daily-dev/SKILL.md` |"
            ),
            (
                "| 2 | The change is limited to repository instructions, rules, "
                "skills, documentation, validators, tests for those assets, or "
                "configuration maintenance | `daily-dev` |"
            ),
        )

    def test_clarification_invariant_reversal_is_rejected(self) -> None:
        self.assert_mutation_rejected(
            "AGENTS.md",
            "| unresolved-clarification | stop-and-ask-developer |",
            "| unresolved-clarification | continue |",
        )

    def test_git_ownership_reversal_is_rejected(self) -> None:
        self.assert_mutation_rejected(
            "AGENTS.md",
            "| git-write | developer-only |",
            "| git-write | agent-allowed |",
        )

    def test_result_owner_reversal_is_rejected(self) -> None:
        self.assert_mutation_rejected(
            ".agents/skills/daily-dev/SKILL.md",
            "  return_to: daily-dev",
            "  return_to: primary-workflow",
        )

    def test_hyphenated_extra_result_key_is_rejected(self) -> None:
        self.assert_mutation_rejected(
            ".agents/skills/bugfix/templates/bugfix-result.md",
            "  open_items:\n",
            "  recommended-task-state: completed\n  open_items:\n",
        )

    def test_route_predicate_order_swap_is_rejected(self) -> None:
        path = self.root / "AGENTS.md"
        text = path.read_text(encoding="utf-8")
        route_6 = (
            "| 6 | Evidence is insufficient to choose a route without changing "
            "scope, behavior, contract, or acceptance criteria | "
            "`clarification-required` |"
        )
        route_7 = (
            "| 7 | Repository work is required and no specialized predicate "
            "above applies | `.agents/skills/daily-dev/SKILL.md` |"
        )
        self.assertIn(route_6, text)
        self.assertIn(route_7, text)
        swapped = (
            text.replace(route_6, "__ROUTE_6__")
            .replace(route_7, route_6.replace("| 6 |", "| 7 |", 1))
            .replace("__ROUTE_6__", route_7.replace("| 7 |", "| 6 |", 1))
        )
        path.write_text(swapped, encoding="utf-8")
        result = self.run_validator()
        self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_legacy_singleton_artifact_is_rejected(self) -> None:
        self.assert_mutation_rejected(
            ".agents/skills/daily-dev/templates/active-task.md",
            "working-docs/active-task-YYYYMMDD-HHMM-<slug>.md",
            "working-docs/active-task.md",
        )

    def test_minute_only_task_identity_is_rejected(self) -> None:
        self.assert_mutation_rejected(
            ".agents/skills/daily-dev/templates/active-task.md",
            "YYYYMMDD-HHMMSS-unique-suffix",
            "YYYYMMDD-HHMM-slug",
        )

    def test_legacy_status_is_rejected(self) -> None:
        self.assert_mutation_rejected(
            ".agents/skills/bugfix/templates/bugfix-result.md",
            "status: in-progress | completed | clarification-required",
            "status: IN_PROGRESS | COMPLETED | WAITING_FOR_CLARIFICATION",
        )

    def test_broken_canonical_link_is_rejected(self) -> None:
        self.assert_mutation_rejected(
            ".agents/skills/bugfix/SKILL.md",
            "../../../AGENTS.md",
            "../../../MISSING-AGENTS.md",
        )

    def test_extra_frontmatter_key_is_rejected(self) -> None:
        self.assert_mutation_rejected(
            ".agents/skills/daily-dev/SKILL.md",
            "name: daily-dev\ndescription:",
            "name: daily-dev\nowner: daily-dev\ndescription:",
        )

    def test_specialized_scenario_prompt_removal_is_rejected(self) -> None:
        path = (
            self.root
            / ".agents"
            / "skills"
            / "bugfix"
            / "tests"
            / "pressure-scenarios.md"
        )
        text = path.read_text(encoding="utf-8")
        self.assertIn("**Prompt:**", text)
        self.assertIn("**Expected:**", text)
        mutated = text.replace("**Prompt:**", "**Removed prompt:**", 1).replace(
            "**Expected:**", "**Removed expected:**", 1
        )
        path.write_text(mutated, encoding="utf-8")
        result = self.run_validator()
        self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_scenario_field_removal_is_rejected(self) -> None:
        self.assert_mutation_rejected(
            ".agents/skills/daily-dev/tests/pressure-scenarios.md",
            "**Forbidden actions:**",
            "**Removed actions field:**",
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
