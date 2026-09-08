"use client"

import { useState, type FormEvent } from "react"
import { CheckCircle2Icon, FileCode2Icon, UploadIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import type { FormFieldSchema, HtmlValidationError } from "@/lib/forms/types"

type Validation = { preview: string; fields: FormFieldSchema[] }

export function HtmlUpload() {
  const [name, setName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [validation, setValidation] = useState<Validation | null>(null)
  const [errors, setErrors] = useState<HtmlValidationError[]>([])
  const [pending, setPending] = useState<"validate" | "save" | null>(null)
  const [saved, setSaved] = useState(false)

  async function validate(selectedFile: File) {
    setPending("validate")
    setValidation(null)
    setErrors([])
    setSaved(false)
    const body = new FormData()
    body.set("file", selectedFile)
    const response = await fetch("/api/templates/validate", { method: "POST", body })
    const data = await response.json()
    if (response.ok) setValidation({ preview: data.preview, fields: data.fields })
    else setErrors(data.errors ?? [{ code: data.code ?? "UNKNOWN", message: data.message ?? "HTML 검증에 실패했습니다." }])
    setPending(null)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file || !validation) return
    setPending("save")
    setSaved(false)
    const body = new FormData()
    body.set("name", name)
    body.set("file", file)
    const response = await fetch("/api/templates", { method: "POST", body })
    const data = await response.json()
    if (response.ok) setSaved(true)
    else setErrors(data.errors ?? [{ code: data.code ?? "UNKNOWN", message: data.message ?? "템플릿 등록에 실패했습니다." }])
    setPending(null)
  }

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,440px)_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>HTML 파일 등록</CardTitle>
          <CardDescription>작성 규칙을 확인한 뒤 256KB 이하의 HTML 파일을 선택하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="template-name">템플릿 이름</FieldLabel>
              <Input id="template-name" value={name} maxLength={120} required onChange={(event) => setName(event.target.value)} placeholder="예: 무료 체크리스트 신청 폼" />
            </Field>
            <Field data-invalid={errors.length > 0 || undefined}>
              <FieldLabel htmlFor="html-file">HTML 파일</FieldLabel>
              <Input id="html-file" type="file" accept=".html,text/html" required aria-invalid={errors.length > 0 || undefined} onChange={(event) => { const selected = event.target.files?.[0] ?? null; setFile(selected); if (selected) void validate(selected) }} />
              <FieldDescription>script, 외부 URL, 이벤트 핸들러와 form action은 허용하지 않습니다.</FieldDescription>
              {errors.length > 0 && <FieldError errors={errors} />}
            </Field>
          </FieldGroup>

          {pending === "validate" && <Alert className="mt-5"><Spinner /><AlertTitle>HTML을 검사하고 있습니다</AlertTitle><AlertDescription>구조, 입력 스키마, 실행 가능한 콘텐츠를 확인합니다.</AlertDescription></Alert>}
          {validation && <Alert className="mt-5"><CheckCircle2Icon /><AlertTitle>검증을 통과했습니다</AlertTitle><AlertDescription>입력 항목 {validation.fields.length}개를 추출했습니다.</AlertDescription></Alert>}
          {saved && <Alert className="mt-5"><CheckCircle2Icon /><AlertTitle>템플릿을 등록했습니다</AlertTitle><AlertDescription>이제 캠페인 생성에서 이 템플릿을 선택할 수 있습니다.</AlertDescription></Alert>}
        </CardContent>
        <CardFooter className="justify-between">
          <a href="/api/templates/sample" download className="text-sm font-medium underline underline-offset-4">샘플 받기</a>
          <Button type="submit" disabled={!validation || !name.trim() || pending !== null}>
            {pending === "save" ? <Spinner data-icon="inline-start" /> : <UploadIcon data-icon="inline-start" />}
            {pending === "save" ? "등록 중" : "템플릿 등록"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="min-h-[620px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileCode2Icon />격리 미리보기</CardTitle>
          <CardDescription>미리보기에서는 방문이나 신청을 기록하지 않으며 외부 실행을 차단합니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1">
          {validation ? (
            <iframe title="등록할 HTML 템플릿 미리보기" sandbox="" srcDoc={validation.preview} className="min-h-[500px] w-full rounded-lg border bg-white" />
          ) : (
            <div className="flex min-h-[500px] w-full items-center justify-center rounded-lg border border-dashed text-center text-sm text-muted-foreground">
              HTML 파일을 선택하면 안전성 검증 후 미리보기가 표시됩니다.
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  )
}
