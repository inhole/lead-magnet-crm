---
name: crm-ci-testing
description: 리드마그넷 CRM의 GitHub Actions 테스트 CI와 한글 건수 Summary를 구성하고 실패를 분석한다. 테스트 구현·워크플로 수정·CI 결과 검증에 사용한다.
---

# CRM CI 테스트 관리

docs/execution-plan.md의 성공·실패 기준을 구현과 연결한다. 현재 .github/workflows/harness-tests.yml는 도구 자체만 검증한다. 앱 코드가 생기면 [앱 CI 연결 규칙](references/app-ci.md)을 읽고 실제 앱 테스트 작업을 추가한다.

## 검증 경계
- 단위: 입력 검증·집계 등 독립 로직.
- 통합: 실제 테스트 DB의 소유권·제약·신청·집계. mock만으로 DB 권한을 검증했다고 판단하지 않는다.
- 브라우저 E2E: 등록 → 링크 방문 → 신청 → CRM·성과, iframe 격리 공격 사례.
- lint·typecheck·build는 테스트 건수에 더하지 않는다.
- 운영 DB·실사용자 데이터·운영 키를 CI에 사용하지 않는다.

## CI와 한글 Summary
- PR, main push, 수동 실행을 지원한다. 필수 테스트 실패 코드를 유지한다.
- 테스트 실패 후에도 GITHUB_STEP_SUMMARY를 생성한다. 취소·러너 장애로 생성 자체가 불가능하면 별도 상태로 보고한다.
- scripts/ci/korean_summary.py를 사용한다. 총 몇건, 성공, 실패, 오류, 건너뜀, 결과를 표시한다.
- 결과 없음·손상·0건·전체 건너뜀을 성공으로 처리하지 않는다.
- 재시도와 중복 리포트를 중복 합산하지 않는다. 브라우저별 사례는 범위를 명시한다.
- Summary에 비밀값·신청자 입력·전체 로그를 넣지 않는다. artifact도 비밀값을 제거하고 짧게 보관한다.
- 기본 권한은 contents: read. 비신뢰 PR 코드를 pull_request_target으로 실행하지 않는다.

## 완료 근거
실패 테스트·커밋·재현 명령 확인 → 원인 수정 → 관련 테스트 실행 → 해당 커밋 CI 확인 순서로 진행한다. 이유 없는 재실행으로 flaky 실패를 숨기지 않는다. 실제 실행 범위와 미실행 범위를 구분한다.
