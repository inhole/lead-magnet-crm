# 앱 CI 연결 규칙

1. 앱 생성 후 lockfile·package scripts와 Node 버전을 확인한다. 없는 명령을 빈 성공 스크립트로 대체하지 않는다.
2. lint·typecheck·build를 별도로 두고 단위·통합·E2E를 연결한다.
3. CI 로컬 Supabase, 마이그레이션, 테스트 계정을 재현하고 앱 준비 후 E2E를 실행한다.
4. runner의 JSON/JUnit을 아래 형식으로 변환하는 adapter를 테스트한다. suite/case 이중 집계와 재시도 중복을 피한다.
5. Summary와 artifact 단계는 if: always()로 실행하고 테스트 실패 종료 코드를 유지한다.

## 건수 계약

```json
{"total":10,"passed":7,"failed":1,"errors":1,"skipped":1}
```

모든 값은 0 이상 정수이며 total은 나머지 합이다. 각 상태는 배타적인 테스트 사례 수다. 미실행 suite를 0건 성공 리포트로 대체하지 않는다. suite별 Summary가 기본이며 통합 시 필수 결과가 모두 존재하는지 검사한다.

```yaml
- name: 한국어 테스트 Summary
  if: always()
  run: python scripts/ci/korean_summary.py reports/unit-counts.json --label "단위 테스트"
```

참고: [GitHub Summary](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands#adding-a-job-summary), [워크플로 문법](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).
