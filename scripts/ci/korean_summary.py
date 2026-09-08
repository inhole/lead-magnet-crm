"""Validate test counts and render a Korean GitHub job summary."""
import argparse
import json
import os
from pathlib import Path

KEYS = ('total', 'passed', 'failed', 'errors', 'skipped')


def render(path, label):
    try:
        data = json.loads(Path(path).read_text(encoding='utf-8'))
        if not isinstance(data, dict) or any(
            type(data.get(key)) is not int or data[key] < 0 for key in KEYS
        ):
            raise ValueError('invalid counts')
        if data['total'] != sum(data[key] for key in KEYS[1:]):
            raise ValueError('inconsistent total')
    except (OSError, ValueError):
        return f'### {label}\n\n총 몇건 : 확인 불가\n\n결과 : 리포트 누락 또는 형식 오류\n', 1
    valid = data['total'] > 0 and data['passed'] > 0 and not (data['failed'] or data['errors'])
    result = '성공' if valid else ('미실행 또는 전체 건너뜀' if data['skipped'] == data['total'] else '실패')
    rows = zip(('총 몇건', '성공', '실패', '오류', '건너뜀'), KEYS)
    body = '\n\n'.join(f'{name} : {data[key]}' for name, key in rows)
    return f'### {label}\n\n{body}\n\n결과 : {result}\n', 0 if valid else 1


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('report')
    parser.add_argument('--label', default='테스트 결과')
    args = parser.parse_args()
    content, code = render(args.report, args.label)
    print(content)
    if destination := os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(destination, 'a', encoding='utf-8') as output:
            output.write(content + '\n')
    return code


if __name__ == '__main__':
    raise SystemExit(main())
