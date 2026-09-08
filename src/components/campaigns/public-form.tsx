"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

type FormField = { name: string; label: string; type: string; required: boolean; options?: string[] }
type PublicFormData = { title: string; description: string; submit_label: string; input_schema: FormField[] }

export function PublicForm({ publicId }: { publicId: string }) {
  const [form, setForm] = useState<PublicFormData | null>(null), [visitId, setVisitId] = useState(""), [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({}), [pending, setPending] = useState(false), [complete, setComplete] = useState(false)
  const eventKey = useRef(crypto.randomUUID()), idempotencyKey = useRef(crypto.randomUUID())
  useEffect(() => {
    const key = "lead-magnet-visitor-id"; let visitorId = localStorage.getItem(key)
    if (!visitorId) { visitorId = crypto.randomUUID(); localStorage.setItem(key, visitorId) }
    const linkToken = new URLSearchParams(window.location.search).get("ref")
    Promise.all([
      fetch(`/api/public/forms/${publicId}`).then(async r => { const b = await r.json(); if (!r.ok) throw new Error(b.message); return b.form }),
      fetch(`/api/public/forms/${publicId}/visits`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ visitorId, eventKey: eventKey.current, linkToken }) }).then(async r => { const b = await r.json(); if (!r.ok) throw new Error(b.message); return b.visit }),
    ]).then(([formData, visit]) => { setForm(formData); setVisitId(visit.visit_id) }).catch(reason => setError(reason instanceof Error ? reason.message : "폼을 불러오지 못했습니다."))
  }, [publicId])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!visitId || pending || !form) return
    setPending(true); setError(""); setFieldErrors({}); const data = new FormData(event.currentTarget)
    const values = Object.fromEntries(form.input_schema.map(field => field.type === "checkbox" ? [field.name, field.options?.length ? data.getAll(field.name).map(String) : data.has(field.name)] : [field.name, String(data.get(field.name) ?? "")]))
    try { const r = await fetch(`/api/public/forms/${publicId}/submissions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ visitId, idempotencyKey: idempotencyKey.current, values }) }); const b = await r.json(); if (!r.ok) { setFieldErrors(b.fieldErrors ?? {}); throw new Error(b.message) } setComplete(true) }
    catch (reason) { setError(reason instanceof Error ? reason.message : "신청을 저장하지 못했습니다.") } finally { setPending(false) }
  }
  if (complete) return <Card><CardHeader><CardTitle>신청이 완료되었습니다</CardTitle><CardDescription>입력하신 내용이 안전하게 저장되었습니다.</CardDescription></CardHeader></Card>
  if (error && !form) return <Alert variant="destructive"><AlertTitle>폼을 열 수 없습니다</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
  if (!form || !visitId) return <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Spinner /> 폼을 불러오는 중입니다.</div>
  return <Card><CardHeader><CardTitle>{form.title}</CardTitle><CardDescription>{form.description}</CardDescription></CardHeader><form onSubmit={submit}><CardContent><FieldGroup>{form.input_schema.map(field => <DynamicField key={field.name} field={field} error={fieldErrors[field.name]} />)}</FieldGroup>{error ? <Alert variant="destructive" className="mt-5"><AlertTitle>신청을 저장하지 못했습니다</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}</CardContent><CardFooter><Button type="submit" disabled={pending}>{pending ? <Spinner data-icon="inline-start" /> : null}{pending ? "저장 중" : form.submit_label}</Button></CardFooter></form></Card>
}

function DynamicField({ field, error }: { field: FormField; error?: string }) {
  if (field.type === "textarea") return <Field data-invalid={!!error}><FieldLabel htmlFor={field.name}>{field.label}{field.required ? " *" : ""}</FieldLabel><Textarea id={field.name} name={field.name} required={field.required} aria-invalid={!!error} /><FieldError>{error}</FieldError></Field>
  if (field.type === "select") return <Field data-invalid={!!error}><FieldLabel htmlFor={field.name}>{field.label}{field.required ? " *" : ""}</FieldLabel><select id={field.name} name={field.name} required={field.required} aria-invalid={!!error} className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"><option value="">선택하세요</option>{field.options?.map(option => <option key={option}>{option}</option>)}</select><FieldError>{error}</FieldError></Field>
  if (field.type === "radio" || (field.type === "checkbox" && field.options?.length)) return <fieldset className="flex flex-col gap-2"><legend className="text-sm font-medium">{field.label}{field.required ? " *" : ""}</legend>{field.options?.map(option => <label key={option} className="flex items-center gap-2 text-sm"><input type={field.type} name={field.name} value={option} required={field.type === "radio" && field.required} />{option}</label>)}<FieldError>{error}</FieldError></fieldset>
  return <Field data-invalid={!!error}><FieldLabel htmlFor={field.name}>{field.label}{field.required ? " *" : ""}</FieldLabel><Input id={field.name} name={field.name} type={field.type} required={field.required} aria-invalid={!!error} /><FieldError>{error}</FieldError></Field>
}
