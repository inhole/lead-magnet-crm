# ADR-003: HTML 작성 계약과 격리 미리보기

- 상태: 채택
- 날짜: 2026-09-08
- 도입: 커밋 `cc4650e`. PR 워크플로를 도입하기 전의 초기 구현이다.
- 구현: `src/lib/forms/validate-html.ts`, `src/lib/forms/render-template.ts`, `src/components/campaigns/public-form.tsx`
- 관련 ADR: [ADR-005](005-variable-form-values-jsonb.md), [ADR-008](008-upload-only-template-entry.md)

## 결정

업로드 HTML은 parse5로 구문 분석하고 허용 요소·속성·입력 타입을 검사한다. 제목, 안내, 제출 버튼은 명시적인 data 속성으로 찾으며 입력 스키마는 등록 시 추출한다. 검증을 통과한 HTML만 비공개 Storage에 저장한다.

미리보기는 sandbox에 동일 출처나 스크립트 권한을 부여하지 않은 iframe에서 표시한다. 문서에는 `default-src 'none'`과 `form-action 'none'` 콘텐츠 보안 정책을 주입한다.

공개 신청 화면도 업로드 HTML을 iframe에 격리한다. 저장된 HTML을 다시 허용 목록으로 검증한 뒤 앱이 생성한 제출 브리지 스크립트만 주입하고, 부모 화면은 iframe의 `window`와 일회성 브리지 토큰이 모두 일치하는 메시지만 처리한다. 제목·안내·제출 버튼 문구는 HTML 문자열 치환이 아니라 파싱된 마커 요소의 텍스트 노드로 반영한다.

## 이유

정규식 치환만으로 브라우저 HTML 파싱과 실행 경로를 안전하게 다룰 수 없다. 지원 범위를 허용 목록으로 좁히고 외부 URL, 이벤트 핸들러, 실행 요소, 외부 요청 CSS를 등록 단계에서 거부해야 관리자 세션과 외부 시스템을 보호할 수 있다.

## 영향

파일 첨부, 외부 폰트·이미지·스타일시트, 사용자 JavaScript는 지원하지 않는다. 미리보기는 방문이나 신청을 기록하지 않으며 실제 공개 제출은 [ADR-006](006-api-boundaries-and-contract.md)의 서버 경계에서 처리한다. 허용 요소 목록은 `docs/html-template-rules.md`와 `src/lib/forms/ai-prompt.ts`가 같은 규칙을 공유한다.
