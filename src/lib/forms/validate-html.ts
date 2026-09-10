import { defaultTreeAdapter, parse, serialize, type DefaultTreeAdapterMap } from "parse5"

import type {
  FormFieldSchema,
  FormFieldType,
  FormOption,
  HtmlValidationError,
  HtmlValidationResult,
} from "@/lib/forms/types"
import { buildTemplatePreview } from "@/lib/forms/render-template"

type Node = DefaultTreeAdapterMap["node"]
type Element = DefaultTreeAdapterMap["element"]

const MAX_HTML_BYTES = 256 * 1024
const allowedTags = new Set([
  "html", "head", "body", "title", "main", "section", "article", "div",
  "form", "label", "input", "textarea", "select", "option", "button",
  "h1", "h2", "h3", "p", "span", "small", "strong", "em", "ul", "ol", "li", "style",
])
const forbiddenTags = new Set(["script", "iframe", "object", "embed", "link", "base", "meta", "svg", "math"])
const forbiddenAttributes = new Set(["action", "formaction", "src", "srcdoc", "target", "ping"])
const supportedInputTypes = new Set<FormFieldType>(["text", "email", "tel", "number", "checkbox", "radio"])
const dangerousCss = /(?:@import|url\s*\(|expression\s*\(|javascript\s*:|behavior\s*:|-moz-binding)/i

function attribute(element: Element, name: string) {
  return element.attrs.find((item) => item.name.toLowerCase() === name)?.value
}

function hasAttribute(element: Element, name: string) {
  return element.attrs.some((item) => item.name.toLowerCase() === name)
}

function children(node: Node): Node[] {
  if (defaultTreeAdapter.isElementNode(node)) return node.childNodes
  if (node.nodeName === "#document" || node.nodeName === "#document-fragment") return node.childNodes
  return []
}

function textContent(node: Node): string {
  if (defaultTreeAdapter.isTextNode(node)) return node.value
  return children(node).map(textContent).join(" ").replace(/\s+/g, " ").trim()
}

function wrappingLabel(element: Element) {
  let parent = element.parentNode
  while (parent) {
    if (defaultTreeAdapter.isElementNode(parent) && parent.tagName === "label") return textContent(parent)
    parent = defaultTreeAdapter.getParentNode(parent)
  }
  return undefined
}

function isDescendant(ancestor: Element, node: Node): boolean {
  let current: Node | null = node
  while (current) {
    if (current === ancestor) return true
    current = defaultTreeAdapter.getParentNode(current)
  }
  return false
}

function findGroupWrapper(groupElements: Element[]): Element | null {
  let candidate = defaultTreeAdapter.getParentNode(groupElements[0])
  while (candidate) {
    if (defaultTreeAdapter.isElementNode(candidate) && candidate.tagName === "div" && groupElements.every((element) => isDescendant(candidate as Element, element))) {
      return candidate
    }
    candidate = defaultTreeAdapter.getParentNode(candidate)
  }
  return null
}

function groupLeadingText(wrapper: Element, groupElements: Element[]): string | undefined {
  for (const child of wrapper.childNodes) {
    if (defaultTreeAdapter.isTextNode(child)) {
      const text = child.value.trim()
      if (text) return text
      continue
    }
    if (!defaultTreeAdapter.isElementNode(child)) continue
    if (groupElements.some((element) => isDescendant(child, element))) return undefined
    const text = textContent(child)
    if (text) return text
  }
  return undefined
}

function groupLabel(groupElements: Element[], name: string): string {
  const wrapper = findGroupWrapper(groupElements)
  if (!wrapper) return name
  return attribute(wrapper, "data-form-group-label") || groupLeadingText(wrapper, groupElements) || name
}

function optionLabel(element: Element, labels: Map<string, string>) {
  const id = attribute(element, "id")
  return (id && labels.get(id)) || wrappingLabel(element) || attribute(element, "aria-label") || attribute(element, "value") || ""
}

function walk(node: Node, visit: (element: Element) => void) {
  if (defaultTreeAdapter.isElementNode(node)) visit(node)
  children(node).forEach((child) => walk(child, visit))
}

function fieldType(element: Element): FormFieldType | null {
  if (element.tagName === "textarea") return "textarea"
  if (element.tagName === "select") return "select"
  if (element.tagName !== "input") return null
  const type = (attribute(element, "type") || "text").toLowerCase() as FormFieldType
  return supportedInputTypes.has(type) ? type : null
}

function optionValues(element: Element): FormOption[] {
  return element.childNodes
    .filter(defaultTreeAdapter.isElementNode)
    .filter((child) => child.tagName === "option")
    .map((option) => ({ value: attribute(option, "value") || textContent(option), label: textContent(option) || attribute(option, "value") || "" }))
    .filter((option) => option.value)
}

export function validateFormHtml(html: string): HtmlValidationResult {
  const errors: HtmlValidationError[] = []
  if (!html.trim()) return { ok: false, errors: [{ code: "EMPTY_HTML", message: "HTML 내용이 비어 있습니다." }] }
  if (new TextEncoder().encode(html).length > MAX_HTML_BYTES) {
    return { ok: false, errors: [{ code: "HTML_TOO_LARGE", message: "HTML 파일은 256KB 이하여야 합니다." }] }
  }

  const document = parse(html)
  const elements: Element[] = []
  walk(document, (element) => elements.push(element))

  for (const element of elements) {
    const tag = element.tagName.toLowerCase()
    if (forbiddenTags.has(tag)) errors.push({ code: "FORBIDDEN_TAG", message: `<${tag}> 요소는 사용할 수 없습니다.` })
    else if (!allowedTags.has(tag)) errors.push({ code: "UNSUPPORTED_TAG", message: `<${tag}> 요소는 지원하지 않습니다.` })

    for (const attr of element.attrs) {
      const name = attr.name.toLowerCase()
      if (name.startsWith("on")) errors.push({ code: "EVENT_HANDLER", message: `${tag}의 ${name} 이벤트 속성은 사용할 수 없습니다.` })
      if (forbiddenAttributes.has(name)) errors.push({ code: "FORBIDDEN_ATTRIBUTE", message: `${tag}의 ${name} 속성은 사용할 수 없습니다.` })
      if (name === "href" && !attr.value.startsWith("#")) errors.push({ code: "EXTERNAL_URL", message: "외부 URL 링크는 사용할 수 없습니다." })
      if (name === "style" && dangerousCss.test(attr.value)) errors.push({ code: "DANGEROUS_CSS", message: "외부 요청 또는 실행 가능한 CSS는 사용할 수 없습니다." })
    }
    if (tag === "style" && dangerousCss.test(textContent(element))) errors.push({ code: "DANGEROUS_CSS", message: "외부 요청 또는 실행 가능한 CSS는 사용할 수 없습니다." })
  }

  const forms = elements.filter((element) => element.tagName === "form")
  if (forms.length !== 1) errors.push({ code: "FORM_COUNT", message: "HTML에는 form 요소가 정확히 하나 있어야 합니다." })

  const markerRules = [
    ["data-form-title", "제목"],
    ["data-form-description", "안내 문구"],
    ["data-form-submit", "제출 버튼"],
  ] as const
  for (const [marker, label] of markerRules) {
    const count = elements.filter((element) => hasAttribute(element, marker)).length
    if (count !== 1) errors.push({ code: "MARKER_COUNT", message: `${label} 위치를 표시하는 ${marker} 속성이 정확히 하나 필요합니다.` })
  }
  const submitMarker = elements.find((element) => hasAttribute(element, "data-form-submit"))
  if (submitMarker && (submitMarker.tagName !== "button" || (attribute(submitMarker, "type") || "submit") !== "submit")) {
    errors.push({ code: "INVALID_SUBMIT_MARKER", message: "data-form-submit은 제출 button 요소에 지정해야 합니다." })
  }

  const labels = new Map<string, string>()
  elements.filter((element) => element.tagName === "label").forEach((label) => {
    const target = attribute(label, "for")
    if (target) labels.set(target, textContent(label))
  })

  const fields: FormFieldSchema[] = []
  for (const element of elements.filter((item) => ["input", "textarea", "select"].includes(item.tagName))) {
    const type = fieldType(element)
    const rawType = attribute(element, "type") || element.tagName
    if (!type) {
      errors.push({ code: "UNSUPPORTED_FIELD", message: `${rawType} 입력 타입은 지원하지 않습니다.` })
      continue
    }
    const name = attribute(element, "name")?.trim()
    if (!name) {
      errors.push({ code: "MISSING_NAME", message: `${type} 입력 항목에는 name 속성이 필요합니다.` })
      continue
    }
    const id = attribute(element, "id")
    const label = (id && labels.get(id)) || wrappingLabel(element) || attribute(element, "aria-label") || name
    fields.push({
      name,
      label,
      type,
      required: hasAttribute(element, "required"),
      ...(type === "select" ? { options: optionValues(element) } : {}),
    })
  }

  const grouped = Map.groupBy(fields, (field) => field.name)
  for (const [name, sameNameFields] of grouped) {
    const isGroupable = sameNameFields.every((field) => field.type === "radio") || sameNameFields.every((field) => field.type === "checkbox")
    if (sameNameFields.length > 1 && !isGroupable) {
      errors.push({ code: "DUPLICATE_NAME", message: `${name} name은 라디오·체크박스 그룹 외에는 중복 사용할 수 없습니다.` })
    }
  }
  if (fields.length === 0) errors.push({ code: "NO_FIELDS", message: "지원되는 입력 항목이 하나 이상 필요합니다." })

  if (errors.length) return { ok: false, errors: [...new Map(errors.map((error) => [`${error.code}:${error.message}`, error])).values()] }
  const normalizedFields = [...grouped.values()].map((sameNameFields) => {
    const groupType = sameNameFields[0].type
    const isGroup = sameNameFields.length > 1 && (groupType === "radio" || groupType === "checkbox")
    if (!isGroup) return sameNameFields[0]
    const groupElements = elements.filter((element) => element.tagName === "input" && (attribute(element, "type") || "text").toLowerCase() === groupType && attribute(element, "name") === sameNameFields[0].name)
    return {
      ...sameNameFields[0],
      label: groupLabel(groupElements, sameNameFields[0].name),
      required: sameNameFields.some((field) => field.required),
      options: groupElements.map((element) => ({ value: attribute(element, "value") || "", label: optionLabel(element, labels) })).filter((option) => option.value),
    }
  })
  return { ok: true, html: serialize(document), fields: normalizedFields }
}

export function buildSandboxPreview(html: string) {
  return buildTemplatePreview(html)
}
