"use client"

import { useEffect, useRef, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

type FormField = { name: string; label: string; type: string; required: boolean; options?: Array<{ value: string; label: string }> }
type PublicFormData = {
  title: string
  description: string
  submit_label: string
  input_schema: FormField[]
  html: string
  bridge_token: string
}

type BridgeSubmitMessage = {
  channel: "lead-magnet-form"
  token: string
  type: "submit"
  entries: Array<[string, string]>
}

type BridgeResizeMessage = {
  channel: "lead-magnet-form"
  token: string
  type: "resize"
  height: number
}

function isBridgeSubmitMessage(value: unknown): value is BridgeSubmitMessage {
  if (!value || typeof value !== "object") return false
  const message = value as Partial<BridgeSubmitMessage>
  return message.channel === "lead-magnet-form"
    && message.type === "submit"
    && typeof message.token === "string"
    && Array.isArray(message.entries)
    && message.entries.every((entry) => Array.isArray(entry) && entry.length === 2 && entry.every((item) => typeof item === "string"))
}

function isBridgeResizeMessage(value: unknown): value is BridgeResizeMessage {
  if (!value || typeof value !== "object") return false
  const message = value as Partial<BridgeResizeMessage>
  return message.channel === "lead-magnet-form" && message.type === "resize" && typeof message.token === "string" && typeof message.height === "number" && Number.isFinite(message.height)
}

function valuesFromEntries(fields: FormField[], entries: Array<[string, string]>) {
  const grouped = Map.groupBy(entries, ([name]) => name)
  return Object.fromEntries(fields.map((field) => {
    const values = (grouped.get(field.name) ?? []).map(([, value]) => value)
    if (field.type === "checkbox") return [field.name, field.options?.length ? values : values.length > 0]
    return [field.name, values[0] ?? ""]
  }))
}

export function PublicForm({ publicId }: { publicId: string }) {
  const [form, setForm] = useState<PublicFormData | null>(null)
  const [visitId, setVisitId] = useState("")
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)
  const [complete, setComplete] = useState(false)
  const [iframeHeight, setIframeHeight] = useState(320)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const formRef = useRef<PublicFormData | null>(null)
  const visitIdRef = useRef("")
  const pendingRef = useRef(false)
  const eventKey = useRef(crypto.randomUUID())
  const idempotencyKey = useRef(crypto.randomUUID())

  useEffect(() => {
    const key = "lead-magnet-visitor-id"
    let visitorId = localStorage.getItem(key)
    if (!visitorId) { visitorId = crypto.randomUUID(); localStorage.setItem(key, visitorId) }
    const linkToken = new URLSearchParams(window.location.search).get("ref")
    Promise.all([
      fetch(`/api/public/forms/${publicId}`).then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.message); return body.form }),
      fetch(`/api/public/forms/${publicId}/visits`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ visitorId, eventKey: eventKey.current, linkToken }) }).then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.message); return body.visit }),
    ]).then(([formData, visit]) => { setForm(formData); setVisitId(visit.visit_id) }).catch((reason) => setError(reason instanceof Error ? reason.message : "폼을 불러오지 못했습니다."))
  }, [publicId])

  useEffect(() => {
    formRef.current = form
    visitIdRef.current = visitId
  }, [form, visitId])

  useEffect(() => {
    async function receive(event: MessageEvent) {
      const activeForm = formRef.current
      const activeVisitId = visitIdRef.current
      if (!activeForm || event.source !== iframeRef.current?.contentWindow) return
      if (isBridgeResizeMessage(event.data) && event.data.token === activeForm.bridge_token) { setIframeHeight(Math.min(20000, Math.max(320, event.data.height + 2))); return }
      if (!activeVisitId || !isBridgeSubmitMessage(event.data) || event.data.token !== activeForm.bridge_token || pendingRef.current) return
      pendingRef.current = true
      setPending(true); setError(""); setFieldErrors({})
      const values = valuesFromEntries(activeForm.input_schema, event.data.entries)
      try {
        const response = await fetch(`/api/public/forms/${publicId}/submissions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ visitId: activeVisitId, idempotencyKey: idempotencyKey.current, values }) })
        const body = await response.json()
        if (!response.ok) { setFieldErrors(body.fieldErrors ?? {}); throw new Error(body.message) }
        setComplete(true)
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "신청을 저장하지 못했습니다.")
      } finally {
        pendingRef.current = false
        setPending(false)
      }
    }
    window.addEventListener("message", receive)
    return () => window.removeEventListener("message", receive)
  }, [publicId])

  useEffect(() => {
    if (!form) return
    iframeRef.current?.contentWindow?.postMessage({ channel: "lead-magnet-form", token: form.bridge_token, type: "pending", value: pending }, "*")
  }, [form, pending])

  if (complete) return <Card><CardHeader><CardTitle>신청이 완료되었습니다</CardTitle><CardDescription>입력하신 내용이 안전하게 저장되었습니다.</CardDescription></CardHeader></Card>
  if (error && !form) return <Alert variant="destructive"><AlertTitle>폼을 열 수 없습니다</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
  if (!form || !visitId) return <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Spinner /> 폼을 불러오는 중입니다.</div>

  return <div className="flex flex-col gap-4"><iframe ref={iframeRef} title={form.title} sandbox="allow-scripts allow-forms" srcDoc={form.html} style={{ height: iframeHeight }} className="block w-full border-0 bg-white" />{pending ? <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Spinner /> 신청을 저장하고 있습니다.</div> : null}{error ? <Alert variant="destructive"><AlertTitle>신청을 저장하지 못했습니다</AlertTitle><AlertDescription>{error}{Object.values(fieldErrors).length ? ` ${Object.values(fieldErrors).join(" ")}` : ""}</AlertDescription></Alert> : null}</div>
}
