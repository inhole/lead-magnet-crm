# 앱 CI 연결 규칙

1. Node 22와 `package-lock.json`을 기준으로 `npm ci`를 사용한다. 없는 명령을 빈 성공 스크립트로 대체하지 않는다.
2. 현재 Fast CI는 lint·typecheck·unit·production build다. `app-quality.yml`의 두 job이 모두 성공해야 한다.
3. P07에서 로컬 Supabase와 테스트 계정을 재현하는 integration job과 Playwright E2E job을 추가한다. 추가 전에는 해당 범위를 미검증으로 보고한다.
4. runner 리포트를 아래 형식으로 변환하는 adapter를 테스트하고 suite/case·재시도 중복 집계를 피한다.
5. Summary와 artifact는 `if: always()`로 실행하고 테스트 실패 종료 코드를 유지한다.
6. PR 메타데이터는 `.github/scripts/pr-policy.mjs`와 Node 내장 테스트로 검증한다. PR 입력을 shell 명령으로 실행하지 않는다.

## 건수 계약

```json
{"total":10,"passed":7,"failed":1,"errors":1,"skipped":1}
```

모든 값은 0 이상 정수이며 total은 나머지 합이다. 각 상태는 배타적 사례 수다. 미실행 suite를 0건 성공 리포트로 대체하지 않는다.

```yaml
- name: 한국어 테스트 Summary
  if: always()
  run: python scripts/ci/korean_summary.py reports/unit-counts.json --label "단위 테스트"
```
