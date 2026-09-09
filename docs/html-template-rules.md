# HTML 템플릿 작성 규칙

등록 파일은 UTF-8 HTML이며 최대 256KB다.

## 필수 구조

- `form`은 정확히 하나만 둔다.
- 제목 요소에는 `data-form-title`, 안내 문구에는 `data-form-description`을 각각 하나씩 둔다.
- 제출 버튼에는 `type="submit" data-form-submit`을 둔다.
- 모든 입력 항목에는 `name`이 있어야 한다. 같은 `name`은 라디오 그룹과 체크박스 그룹에서만 중복할 수 있다. 그 외 타입의 중복 name은 거부된다.
- 지원 입력은 text, email, tel, number, textarea, select, checkbox, radio다.
- select의 `<option>`은 `value` 속성과 사람이 읽는 텍스트를 함께 둔다. 신청 상세에는 텍스트가 표시되고 저장은 `value`로 된다.

## 라디오·체크박스 그룹 제목

같은 name의 라디오·체크박스 여러 개를 하나의 `div`로 감싸면 그 묶음이 그룹으로 인식된다. 그룹 제목은 다음 순서로 정해진다.

1. 감싼 `div`의 `data-form-group-label` 속성값
2. 속성이 없으면 `div` 안에서 선택지보다 앞에 오는 첫 텍스트(예: 안내용 `span`이나 `p`)
3. 둘 다 없으면 `name` 속성값을 그대로 쓴다

각 선택지의 라벨은 해당 input을 감싼 `label`(또는 `id`로 연결된 `label`, `aria-label`)의 텍스트에서 읽는다. `div` 래퍼 없이 라디오·체크박스를 나열하면 그룹 제목은 `name`으로 표시되므로, 신청 상세에서 사람이 읽을 제목이 필요하면 반드시 `div`로 묶는다.

```html
<div data-form-group-label="관심 분야">
  <label><input name="interest" type="radio" value="sales" required> 영업</label>
  <label><input name="interest" type="radio" value="marketing"> 마케팅</label>
</div>
```

## 보안 제한

script, iframe, object, embed, 외부 link와 meta 요소는 허용하지 않는다. `on*` 이벤트 속성, form action, 외부 URL, `url()` 또는 `@import`를 포함한 CSS도 거부한다. 미리보기는 동일 출처 권한 없는 sandbox iframe과 CSP 안에서만 실행한다.

작동하는 예시는 `samples/lead-form.html`에서 확인한다.
