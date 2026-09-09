export const HTML_TEMPLATE_AI_PROMPT = `리드 수집용 단일 HTML 신청 폼을 만들어줘. 결과는 설명이나 마크다운 없이 완전한 HTML만 출력해줘.

규칙:
- form 요소는 정확히 1개만 사용하고 action 속성은 넣지 않는다.
- 제목에는 data-form-title, 설명에는 data-form-description, 제출 버튼에는 data-form-submit 속성을 넣는다.
- 모든 input, textarea, select에는 고유한 name과 연결된 label을 둔다.
- 지원 입력 타입은 text, email, tel, number, checkbox, radio이며 필요한 항목은 required로 표시한다. textarea와 select도 사용할 수 있다.
- meta, fieldset, legend 요소는 사용하지 않는다. 선택 항목을 묶을 때는 div와 label을 사용한다.
- script, iframe, 외부 URL, 외부 CSS/폰트, 이벤트 핸들러(onclick 등)는 사용하지 않는다.
- 개인정보는 최소한으로 요청하고 모바일에서도 읽기 쉽게 작성한다.

폼 주제: [여기에 리드마그넷과 수집할 정보 입력]`
