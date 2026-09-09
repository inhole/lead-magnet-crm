import { defaultTreeAdapter, parse, serialize, type DefaultTreeAdapterMap } from "parse5"

type Node = DefaultTreeAdapterMap["node"]
type Element = DefaultTreeAdapterMap["element"]

type FormCopy = {
  title: string
  description: string
  submitLabel: string
}

function children(node: Node): Node[] {
  if (defaultTreeAdapter.isElementNode(node)) return node.childNodes
  if (node.nodeName === "#document" || node.nodeName === "#document-fragment") return node.childNodes
  return []
}

function walk(node: Node, visit: (element: Element) => void) {
  if (defaultTreeAdapter.isElementNode(node)) visit(node)
  children(node).forEach((child) => walk(child, visit))
}

function hasAttribute(element: Element, name: string) {
  return element.attrs.some((attribute) => attribute.name.toLowerCase() === name)
}

function replaceText(element: Element, value: string) {
  const text = defaultTreeAdapter.createTextNode(value)
  text.parentNode = element
  element.childNodes = [text]
}

export function customizeFormHtml(html: string, copy: FormCopy) {
  const document = parse(html)
  walk(document, (element) => {
    if (hasAttribute(element, "data-form-title")) replaceText(element, copy.title)
    if (hasAttribute(element, "data-form-description")) replaceText(element, copy.description)
    if (hasAttribute(element, "data-form-submit")) replaceText(element, copy.submitLabel)
  })
  return serialize(document)
}

function injectHead(html: string, content: string) {
  return serialize(parse(html)).replace("<head>", `<head>${content}`)
}

export function buildTemplatePreview(html: string, copy?: FormCopy) {
  const customized = copy ? customizeFormHtml(html, copy) : html
  const csp = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; form-action 'none'; base-uri 'none'"
  const securityHead = `<meta http-equiv="Content-Security-Policy" content="${csp}"><meta charset="utf-8"><style>body{margin:0;padding:24px;font-family:system-ui,sans-serif}form{max-width:560px;margin:auto}</style>`
  return injectHead(customized, securityHead)
}

export function buildInteractiveTemplate(html: string, copy: FormCopy, bridgeToken: string) {
  const customized = customizeFormHtml(html, copy)
  const csp = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; script-src 'unsafe-inline'; form-action 'none'; base-uri 'none'"
  const bridgeScript = `(()=>{const token=${JSON.stringify(bridgeToken)};document.documentElement.dataset.formBridge="ready";document.addEventListener("submit",event=>{event.preventDefault();const form=event.target;if(!(form instanceof HTMLFormElement))return;const entries=Array.from(new FormData(form).entries(),([name,value])=>[name,String(value)]);parent.postMessage({channel:"lead-magnet-form",token,type:"submit",entries},"*")},true);addEventListener("message",event=>{const data=event.data;if(event.source!==parent||!data||data.channel!=="lead-magnet-form"||data.token!==token||data.type!=="pending")return;const button=document.querySelector("[data-form-submit]");if(button)button.disabled=Boolean(data.value)})})();`
  const securityHead = `<meta http-equiv="Content-Security-Policy" content="${csp}"><meta charset="utf-8">`
  return injectHead(customized, securityHead).replace("</body>", `<script>${bridgeScript}</script></body>`)
}
