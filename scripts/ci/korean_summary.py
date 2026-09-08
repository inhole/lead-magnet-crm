"""Validate test counts and render a Korean GitHub job summary."""
import argparse
import json
import os
from pathlib import Path

KEYS = ('total', 'passed', 'failed', 'errors', 'skipped')


def render(path, label, description=None):
    intro = f'{description}\n\n' if description else ''
    try:
        data = json.loads(Path(path).read_text(encoding='utf-8'))
        if not isinstance(data, dict) or any(
            type(data.get(key)) is not int or data[key] < 0 for key in KEYS
        ):
            raise ValueError('invalid counts')
        if data['total'] != sum(data[key] for key in KEYS[1:]):
            raise ValueError('inconsistent total')
    except (OSError, ValueError):
        table = (
            '| 항목 | 결과 |\n'
            '| --- | ---: |\n'
            '| 전체 테스트 | 확인 불가 |\n'
            '| 최종 결과 | 확인 필요: 리포트 누락 또는 형식 오류 |\n'
        )
        return f'### {label}\n\n{intro}{table}', 1
    valid = data['total'] > 0 and data['passed'] > 0 and not (data['failed'] or data['errors'])
    result = '성공' if valid else ('확인 필요: 미실행 또는 전체 건너뜀' if data['skipped'] == data['total'] else '실패')
    labels = ('전체 테스트', '성공', '실패', '오류', '건너뜀')
    rows = '\n'.join(f'| {name} | {data[key]}건 |' for name, key in zip(labels, KEYS))
    table = f'| 항목 | 결과 |\n| --- | ---: |\n{rows}\n| 최종 결과 | {result} |\n'
    return f'### {label}\n\n{intro}{table}', 0 if valid else 1


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('report')
    parser.add_argument('--label', default='테스트 결과')
    parser.add_argument('--description')
    args = parser.parse_args()
    content, code = render(args.report, args.label, args.description)
    print(content)
    if destination := os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(destination, 'a', encoding='utf-8') as output:
            output.write(content + '\n')
    return code


if __name__ == '__main__':
    raise SystemExit(main())
