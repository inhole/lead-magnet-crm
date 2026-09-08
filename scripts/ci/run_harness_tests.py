"""Execute tooling tests, never application tests."""
import json
import unittest
from pathlib import Path

directory = Path(__file__).resolve().parent
suite = unittest.defaultTestLoader.discover(str(directory), pattern='test_*.py')
result = unittest.TextTestRunner(verbosity=2).run(suite)
failed_ids = {case.id().split(' (')[0] for case, _ in result.failures}
error_ids = {case.id().split(' (')[0] for case, _ in result.errors} - failed_ids
failed, errors, skipped = len(failed_ids), len(error_ids), len(result.skipped)
counts = dict(total=result.testsRun, passed=result.testsRun - failed - errors - skipped,
              failed=failed, errors=errors, skipped=skipped)
destination = directory.parents[1] / 'reports' / 'harness-counts.json'
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text(json.dumps(counts), encoding='utf-8')
raise SystemExit(0 if result.wasSuccessful() and result.testsRun else 1)
