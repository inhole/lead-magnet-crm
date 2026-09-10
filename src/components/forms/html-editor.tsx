"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2Icon, UploadIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { saveTemplateHtml } from "@/lib/forms/save-template"
import type { HtmlValidationError } from "@/lib/forms/types"

export function HtmlEditor() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [html, setHtml] = useState("")
  const [preview, setPreview] = useState("")
  const [errors, setErrors] = useState<HtmlValidationError[]>([])
  const [checking, setChecking] = useState(false)
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function changeHtml(value: string) {
    setHtml(value); setSaved(false); setMessage("")
    if (!value.trim()) { setPreview(""); setErrors([]); setChecking(false) }
    else setChecking(true)
  }

  useEffect(() => {
    if (!html.trim()) return
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      const body = new FormData()
      body.set("file", new File([html], "template.html", { type: "text/html" }))
      fetch("/api/templates/validate", { method: "POST", body, signal: controller.signal })
        .then(async (response) => {
          const data = await response.json()
          if (response.ok) { setPreview(data.preview); setErrors([]) }
          else { setPreview(""); setErrors(data.errors ?? [{ code: data.code ?? "UNKNOWN", message: data.message ?? "HTML 검증에 실패했습니다." }]) }
        })
        .catch((reason) => { if (reason instanceof DOMException && reason.name === "AbortError") return })
        .finally(() => setChecking(false))
    }, 500)
    return () => { clearTimeout(timeout); controller.abort() }
  }, [html])

  async function submit() {
    setMessage(""); setSaved(false); setSaving(true)
    try {
      const result = await saveTemplateHtml(name.trim(), html)
      if (!result.ok) { setErrors(result.errors ?? []); setMessage(result.message); return }
      setSaved(true)
      router.push("/templates")
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "템플릿을 등록하지 못했습니다.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,440px)_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>HTML 직접 작성</CardTitle>
          <CardDescription>html-template-rules.md의 작성 규칙에 맞는 HTML을 붙여넣으세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field><FieldLabel htmlFor="html-editor-name">템플릿 이름</FieldLabel><Input id="html-editor-name" value={name} maxLength={120} onChange={(event) => { setName(event.target.value); setSaved(false) }} placeholder="예: 무료 체크리스트 신청 폼" /></Field>
            <Field data-invalid={errors.length > 0 || undefined}>
              <FieldLabel htmlFor="html-editor-source">HTML 소스</FieldLabel>
              <Textarea id="html-editor-source" value={html} onChange={(event) => changeHtml(event.target.value)} aria-invalid={errors.length > 0 || undefined} className="min-h-64 font-mono text-xs" placeholder="<main>...</main>" />
              <FieldDescription>붙여넣으면 실시간으로 검증하고 오른쪽에 격리 미리보기를 표시합니다.</FieldDescription>
              {errors.length > 0 && <FieldError errors={errors} />}
            </Field>
          </FieldGroup>
          {message && !errors.length && <Alert variant="destructive" className="mt-5"><AlertTitle>등록할 수 없습니다</AlertTitle><AlertDescription>{message}</AlertDescription></Alert>}
          {saved && <Alert className="mt-5"><CheckCircle2Icon /><AlertTitle>템플릿을 등록했습니다</AlertTitle></Alert>}
        </CardContent>
        <CardFooter>
          <Button type="button" onClick={submit} disabled={saving || !name.trim() || !preview}>
            {saving ? <Spinner data-icon="inline-start" /> : <UploadIcon data-icon="inline-start" />}
            {saving ? "등록 중" : "템플릿 등록"}
          </Button>
        </CardFooter>
      </Card>
      <Card className="min-h-[620px]">
        <CardHeader>
          <CardTitle>격리 미리보기</CardTitle>
          <CardDescription>미리보기에서는 방문이나 신청을 기록하지 않으며 외부 실행을 차단합니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1">
          {checking ? (
            <div className="flex min-h-[500px] w-full items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground"><Spinner /> HTML을 검사하고 있습니다.</div>
          ) : preview ? (
            <iframe title="HTML 직접 작성 미리보기" sandbox="" srcDoc={preview} className="min-h-[500px] w-full rounded-lg border bg-white" />
          ) : (
            <div className="flex min-h-[500px] w-full items-center justify-center rounded-lg border border-dashed text-center text-sm text-muted-foreground">유효한 HTML을 입력하면 미리보기가 표시됩니다.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
