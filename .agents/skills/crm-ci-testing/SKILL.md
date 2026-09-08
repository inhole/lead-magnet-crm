---
name: crm-ci-testing
description: 리드마그넷 CRM의 GitHub Actions 앱 테스트, PR 운영 정책, 한글 건수 Summary를 구성하고 실패를 분석한다. 테스트 구현·워크플로 수정·CI 결과 검증에 사용한다.
---

# CRM CI 테스트 관리

docs/execution-plan.md의 성공·실패 기준을 구현과 연결한다. 앱 CI 또는 PR 정책 변경 전 [앱 CI 연결 규칙](references/app-ci.md)을 읽는다. `harness-tests.yml`은 결과 집계 도구만 검증하며 앱 기능 검증 근거가 아니다.

## 검증 경계

- 단위: 입력 검증·집계 등 독립 로직.
- 통합: 실제 테스트 DB의 소유권·제약·신청·집계. mock만으로 DB 권한을 검증했다고 판단하지 않는다.
- 브라우저 E2E: 등록 → 링크 방문 → 신청 → CRM·성과, iframe 격리 공격 사례.
- lint·typecheck·build는 테스트 건수에 더하지 않는다. 운영 DB·실사용자 데이터·운영 키를 CI에 사용하지 않는다.

## CI와 Summary

- `app-quality.yml`은 PR, `main` push, 수동 실행에서 lint·typecheck·unit·build를 자동 검증한다.
- `pr-policy.yml`은 PR에서 브랜치명·한글 제목·종료 이슈 참조를 검증한다.
- `harness-tests.yml`은 CI 결과 집계 도구를 독립 검증한다.
- 같은 PR/ref의 이전 실행은 concurrency로 취소한다. 테스트 실패 후에도 Summary와 artifact를 남기되 실패 코드를 유지한다.
- 결과 없음·손상·0건·전체 건너뜀을 성공으로 처리하지 않는다.
- Summary와 artifact에 비밀값·신청자 입력·전체 로그를 넣지 않는다.
- 기본 권한은 contents: read. 비신뢰 PR 코드를 pull_request_target으로 실행하지 않는다.

## 완료 근거

실패 재현 → 원인 수정 → 관련 로컬 테스트 → 현재 커밋 CI 확인 순서로 진행한다. 이유 없는 재실행으로 flaky 실패를 숨기지 않는다. 실제 실행 범위와 미실행 범위를 구분한다.

필수 PR check는 `PR 운영 정책 / 브랜치·제목·이슈 연결`, `앱 품질 검사 / lint · typecheck · build`, `앱 품질 검사 / 단위 테스트`, `CI 결과 집계 도구 검증 / 테스트 결과 집계 로직`이다. 이름 변경은 branch protection 계약 변경으로 취급한다.
