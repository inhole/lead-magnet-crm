import { defaultTreeAdapter, html as html5, parse, serialize, type DefaultTreeAdapterMap } from "parse5"

import { extractFormCopy } from "@/lib/forms/render-template"
import { SUPPORTED_FIELD_TYPES, type FormFieldType, type FormOption } from "@/lib/forms/types"
import { validateFormHtml } from "@/lib/forms/validate-html"

type Node = DefaultTreeAdapterMap["node"]
type Element = DefaultTreeAdapterMap["element"]
type ChildNode = DefaultTreeAdapterMap["childNode"]

const HTML_NS = html5.NS.HTML
const GROUPED_TYPES = new Set<FormFieldType>(["radio", "checkbox"])
const OPTION_TYPES = new Set<FormFieldType>(["select", "radio", "checkbox"])

export type FormDocumentField = {
  id: string
  name: string
  label: string
  type: FormFieldType
  required: boolean
  options?: FormOption[]
}

export type FormDocument = {
  title: string
  description: string
  submitLabel: string
  fields: FormDocumentField[]
}

export function emptyFormDocument(): FormDocument {
  return { title: "", description: "", submitLabel: "신청하기", fields: [] }
}

export function fieldSupportsOptions(type: FormFieldType) {
  return OPTION_TYPES.has(type)
}

export function fieldIsGrouped(type: FormFieldType) {
  return GROUPED_TYPES.has(type)
}

export function parseFormDocument(html: string): FormDocument {
  const copy = extractFormCopy(html)
  const validation = validateFormHtml(html)
  const fields = validation.ok ? validation.fields : []
  return {
    title: copy.title,
    description: copy.description,
    submitLabel: copy.submitLabel,
    fields: fields.map((field) => ({
      id: crypto.randomUUID(),
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      ...(field.options ? { options: field.options } : {}),
    })),
  }
}

function element(tagName: string, attrs: Record<string, string | boolean> = {}): Element {
  const list = Object.entries(attrs)
    .filter(([, value]) => value !== false)
    .map(([name, value]) => ({ name, value: typeof value === "string" ? value : "" }))
  return defaultTreeAdapter.createElement(tagName, HTML_NS, list)
}

function text(value: string) {
  return defaultTreeAdapter.createTextNode(value)
}

function append<T extends Element>(parent: T, ...children: ChildNode[]) {
  for (const child of children) defaultTreeAdapter.appendChild(parent, child)
  return parent
}

function buildFieldNodes(field: FormDocumentField): Element[] {
  if (!SUPPORTED_FIELD_TYPES.includes(field.type)) {
    throw new Error(`지원하지 않는 입력 타입입니다: ${field.type}`)
  }
  if (field.type === "textarea") {
    const label = append(element("label", { for: field.name }), text(field.label))
    const textarea = element("textarea", { id: field.name, name: field.name, required: field.required })
    return [label, textarea]
  }
  if (field.type === "select") {
    const label = append(element("label", { for: field.name }), text(field.label))
    const select = element("select", { id: field.name, name: field.name, required: field.required })
    for (const option of field.options ?? []) append(select, append(element("option", { value: option.value }), text(option.label)))
    return [label, select]
  }
  if (fieldIsGrouped(field.type)) {
    const wrapper = element("div", { "data-form-group-label": field.label })
    ;(field.options ?? []).forEach((option, index) => {
      const optionLabel = element("label")
      const input = element("input", { name: field.name, type: field.type, value: option.value, required: field.required && index === 0 })
      append(optionLabel, input, text(` ${option.label}`))
      append(wrapper, optionLabel)
    })
    return [wrapper]
  }
  const label = append(element("label", { for: field.name }), text(field.label))
  const input = element("input", { id: field.name, name: field.name, type: field.type, required: field.required })
  return [label, input]
}

export function buildFormHtml(document: FormDocument): string {
  const skeleton = parse('<!doctype html><html lang="ko"><head><title></title></head><body><main><h1 data-form-title></h1><p data-form-description></p><form></form></main></body></html>')
  const elements: Element[] = []
  const walk = (node: Node) => {
    if (defaultTreeAdapter.isElementNode(node)) elements.push(node)
    const children = defaultTreeAdapter.isElementNode(node) || node.nodeName === "#document" ? defaultTreeAdapter.getChildNodes(node) : []
    children.forEach(walk)
  }
  walk(skeleton)

  const title = elements.find((item) => item.attrs.some((attr) => attr.name === "data-form-title"))
  const description = elements.find((item) => item.attrs.some((attr) => attr.name === "data-form-description"))
  const form = elements.find((item) => item.tagName === "form")
  if (!title || !description || !form) throw new Error("에디터 골격 HTML을 생성하지 못했습니다.")

  append(title, text(document.title))
  append(description, text(document.description))
  for (const field of document.fields) append(form, ...buildFieldNodes(field))
  append(form, append(element("button", { type: "submit", "data-form-submit": true }), text(document.submitLabel)))

  return serialize(skeleton)
}
