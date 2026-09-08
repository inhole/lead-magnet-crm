# HTML 템플릿 작성 규칙

등록 파일은 UTF-8 HTML이며 최대 256KB다.

## 필수 구조

- `form`은 정확히 하나만 둔다.
- 제목 요소에는 `data-form-title`, 안내 문구에는 `data-form-description`을 각각 하나씩 둔다.
- 제출 버튼에는 `type="submit" data-form-submit`을 둔다.
- 모든 입력 항목에는 `name`이 있어야 한다. 같은 `name`은 라디오 그룹에서만 중복할 수 있다.
- 지원 입력은 text, email, tel, number, textarea, select, checkbox, radio다.

## 보안 제한

script, iframe, object, embed, 외부 link와 meta 요소는 허용하지 않는다. `on*` 이벤트 속성, form action, 외부 URL, `url()` 또는 `@import`를 포함한 CSS도 거부한다. 미리보기는 동일 출처 권한 없는 sandbox iframe과 CSP 안에서만 실행한다.

작동하는 예시는 `samples/lead-form.html`에서 확인한다.
