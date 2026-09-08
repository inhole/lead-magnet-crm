import json
import tempfile
import unittest
from pathlib import Path
from korean_summary import render


class SummaryTests(unittest.TestCase):
    def evaluate(self, data):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'result.json'
            path.write_text(json.dumps(data), encoding='utf-8')
            return render(path, '검증')

    def test_success_counts(self):
        text, code = self.evaluate(dict(total=3, passed=2, failed=0, errors=0, skipped=1))
        self.assertEqual(code, 0)
        self.assertIn('총 몇건 : 3', text)
        self.assertIn('건너뜀 : 1', text)

    def test_failure(self):
        self.assertEqual(self.evaluate(dict(total=2, passed=1, failed=1, errors=0, skipped=0))[1], 1)

    def test_error(self):
        self.assertEqual(self.evaluate(dict(total=1, passed=0, failed=0, errors=1, skipped=0))[1], 1)

    def test_zero(self):
        self.assertEqual(self.evaluate(dict.fromkeys(('total', 'passed', 'failed', 'errors', 'skipped'), 0))[1], 1)

    def test_all_skipped(self):
        self.assertEqual(self.evaluate(dict(total=2, passed=0, failed=0, errors=0, skipped=2))[1], 1)

    def test_inconsistent_total(self):
        self.assertEqual(self.evaluate(dict(total=10, passed=1, failed=0, errors=0, skipped=0))[1], 1)

    def test_invalid_values(self):
        for value in (-1, True, '1', None):
            with self.subTest(value=value):
                self.assertEqual(self.evaluate(dict(total=value, passed=1, failed=0, errors=0, skipped=0))[1], 1)

    def test_missing(self):
        with tempfile.TemporaryDirectory() as directory:
            text, code = render(Path(directory) / 'missing.json', '검증')
        self.assertEqual(code, 1)
        self.assertIn('확인 불가', text)

    def test_malformed(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'bad.json'
            path.write_text('{', encoding='utf-8')
            self.assertEqual(render(path, '검증')[1], 1)
