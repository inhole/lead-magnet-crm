"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { applyTemplateDefaults, type FormCopyField } from "@/lib/forms/copy-defaults"
import { customizeFormHtml } from "@/lib/forms/render-template"

type Template = { id: string; name: string; input_schema: Array<{ name: string; label: string; type: string; required: boolean }>; default_title: string; default_description: string; default_submit_label: string }
type FieldErrors = Partial<Record<"name" | "templateId" | "title" | "description" | "submitLabel", string>>

export function CampaignForm() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [templateId, setTemplateId] = useState("")
  const [templatePreview, setTemplatePreview] = useState("")
  const [previewError, setPreviewError] = useState("")
  const [previewLoading, setPreviewLoading] = useState(false)
  const [values, setValues] = useState({ name: "", title: "", description: "", submitLabel: "신청하기" })
  const [touched, setTouched] = useState<Set<FormCopyField>>(new Set())
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    fetch("/api/templates").then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.message); setTemplates(body.templates ?? []) }).catch((error) => setMessage(error instanceof Error ? error.message : "템플릿 목록을 불러오지 못했습니다.")).finally(() => setLoading(false))
  }, [])

  const selectedTemplate = useMemo(() => templates.find((template) => template.id === templateId), [templateId, templates])
  const customizedPreview = useMemo(() => templatePreview ? customizeFormHtml(templatePreview, {
    title: values.title || "공개 폼 제목",
    description: values.description || "방문자에게 보여줄 안내 문구",
    submitLabel: values.submitLabel || "신청하기",
  }) : "", [templatePreview, values.description, values.submitLabel, values.title])

  function updateValue(field: "name" | FormCopyField, value: string) {
    if (field !== "name") setTouched((current) => new Set(current).add(field))
    setValues((current) => ({ ...current, [field]: value }))
  }

  function selectTemplate(value: string | null) {
    const nextId = value ?? ""
    setTemplateId(nextId); setTemplatePreview(""); setPreviewError(""); setPreviewLoading(Boolean(nextId))
    const template = templates.find((item) => item.id === nextId)
    if (template) {
      setValues((current) => applyTemplateDefaults(current, touched, {
        title: template.default_title,
        description: template.default_description,
        submitLabel: template.default_submit_label || "신청하기",
      }))
    }
  }

  useEffect(() => {
    if (!templateId) return
    const controller = new AbortController()
    fetch(`/api/templates/${templateId}/preview`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json()
        if (!response.ok) throw new Error(body.message)
        setTemplatePreview(body.preview)
      })
      .catch((reason) => { if (reason instanceof DOMException && reason.name === "AbortError") return; setPreviewError(reason instanceof Error ? reason.message : "템플릿 미리보기를 불러오지 못했습니다.") })
      .finally(() => { if (!controller.signal.aborted) setPreviewLoading(false) })
    return () => controller.abort()
  }, [templateId])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setMessage(""); setFieldErrors({})
    try {
      const response = await fetch("/api/campaigns", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...values, templateId }) })
      const body = await response.json()
      if (!response.ok) { setFieldErrors(body.fieldErrors ?? {}); throw new Error(body.message) }
      router.push(`/campaigns/${body.campaign.campaign_id}`)
    } catch (error) { setMessage(error instanceof Error ? error.message : "캠페인을 저장하지 못했습니다.") } finally { setSubmitting(false) }
  }

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> 템플릿을 불러오는 중입니다.</div>
  if (!templates.length && !message) return <Empty className="border"><EmptyHeader><EmptyTitle>등록된 템플릿이 없습니다</EmptyTitle><EmptyDescription>캠페인을 만들기 전에 HTML 템플릿을 등록하세요.</EmptyDescription></EmptyHeader><EmptyContent><Button onClick={() => router.push("/templates/new")}>템플릿 등록하기</Button></EmptyContent></Empty>

  return <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
    <Card><CardHeader><CardTitle>캠페인 설정</CardTitle><CardDescription>템플릿을 선택하고 공개 폼에 표시할 문구를 입력하세요.</CardDescription></CardHeader><CardContent>
      <form id="campaign-form" onSubmit={submit}><FieldGroup>
        <Field data-invalid={Boolean(fieldErrors.name)}><FieldLabel htmlFor="name">캠페인 이름</FieldLabel><Input id="name" value={values.name} maxLength={120} aria-invalid={Boolean(fieldErrors.name)} onChange={(event) => updateValue("name", event.target.value)} /><FieldError>{fieldErrors.name}</FieldError></Field>
        <Field data-invalid={Boolean(fieldErrors.templateId)}><FieldLabel htmlFor="template-id">HTML 템플릿</FieldLabel><Select id="template-id" value={templateId} onValueChange={selectTemplate}><SelectTrigger className="w-full" aria-invalid={Boolean(fieldErrors.templateId)}><SelectValue placeholder="템플릿 선택">{(value) => templates.find((template) => template.id === value)?.name ?? "템플릿 선택"}</SelectValue></SelectTrigger><SelectContent><SelectGroup>{templates.map((template) => <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>)}</SelectGroup></SelectContent></Select><FieldError>{fieldErrors.templateId}</FieldError></Field>
        <Field data-invalid={Boolean(fieldErrors.title)}><FieldLabel htmlFor="title">공개 폼 제목</FieldLabel><Input id="title" value={values.title} maxLength={160} aria-invalid={Boolean(fieldErrors.title)} onChange={(event) => updateValue("title", event.target.value)} /><FieldError>{fieldErrors.title}</FieldError></Field>
        <Field data-invalid={Boolean(fieldErrors.description)}><FieldLabel htmlFor="description">안내 문구</FieldLabel><Textarea id="description" value={values.description} maxLength={1000} aria-invalid={Boolean(fieldErrors.description)} onChange={(event) => updateValue("description", event.target.value)} /><FieldDescription>HTML은 삽입되지 않고 텍스트로만 표시됩니다.</FieldDescription><FieldError>{fieldErrors.description}</FieldError></Field>
        <Field data-invalid={Boolean(fieldErrors.submitLabel)}><FieldLabel htmlFor="submitLabel">제출 버튼 문구</FieldLabel><Input id="submitLabel" value={values.submitLabel} maxLength={40} aria-invalid={Boolean(fieldErrors.submitLabel)} onChange={(event) => updateValue("submitLabel", event.target.value)} /><FieldError>{fieldErrors.submitLabel}</FieldError></Field>
      </FieldGroup></form>
      {message ? <Alert variant="destructive" className="mt-5"><AlertTitle>저장할 수 없습니다</AlertTitle><AlertDescription>{message}</AlertDescription></Alert> : null}
    </CardContent><CardFooter><Button type="submit" form="campaign-form" disabled={submitting}>{submitting ? <Spinner data-icon="inline-start" /> : null}{submitting ? "저장 중" : "캠페인 만들기"}</Button></CardFooter></Card>
    <Card><CardHeader><CardTitle>공개 폼 미리보기</CardTitle><CardDescription>{selectedTemplate ? `${selectedTemplate.name} · 입력 ${selectedTemplate.input_schema.length}개` : "템플릿을 선택하면 실제 디자인을 확인할 수 있습니다."}</CardDescription></CardHeader><CardContent>{previewLoading ? <div className="flex min-h-[500px] items-center justify-center gap-2 text-sm text-muted-foreground"><Spinner /> 템플릿을 불러오는 중입니다.</div> : previewError ? <Alert variant="destructive"><AlertTitle>미리보기를 불러올 수 없습니다</AlertTitle><AlertDescription>{previewError}</AlertDescription></Alert> : customizedPreview ? <iframe title="커스텀 신청 폼 미리보기" sandbox="" srcDoc={customizedPreview} className="min-h-[620px] w-full rounded-lg border bg-white" /> : <div className="flex min-h-[500px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">HTML 템플릿을 선택하세요.</div>}</CardContent></Card>
  </div>
}
