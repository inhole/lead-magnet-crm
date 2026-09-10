"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2Icon, PlusIcon, UploadIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { FieldCard } from "@/components/forms/field-card"
import { buildEditorTemplate } from "@/lib/forms/render-template"
import { buildFormHtml, emptyFormDocument, type FormDocument, type FormDocumentField } from "@/lib/forms/document"
import { saveTemplateHtml } from "@/lib/forms/save-template"
import type { HtmlValidationError } from "@/lib/forms/types"

const CHANNEL = "lead-magnet-editor"

function newField(): FormDocumentField {
  return { id: crypto.randomUUID(), name: "", label: "", type: "text", required: false }
}

function isCopyMessage(value: unknown): value is { channel: string; token: string; type: "copy"; field: "title" | "description" | "submitLabel"; value: string } {
  if (!value || typeof value !== "object") return false
  const message = value as Record<string, unknown>
  return message.channel === CHANNEL && message.type === "copy" && typeof message.token === "string" && typeof message.value === "string" && ["title", "description", "submitLabel"].includes(message.field as string)
}

export function DocumentEditor({ initialDocument, initialName }: { initialDocument?: FormDocument; initialName?: string }) {
  const router = useRouter()
  const [name, setName] = useState(initialName ?? "")
  const [doc, setDoc] = useState<FormDocument>(initialDocument ?? emptyFormDocument())
  const [bridgeToken, setBridgeToken] = useState(() => crypto.randomUUID())
  const [iframeHeight, setIframeHeight] = useState(500)
  const [errors, setErrors] = useState<HtmlValidationError[]>([])
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  function mutateFields(updater: (fields: FormDocumentField[]) => FormDocumentField[]) {
    setDoc((current) => ({ ...current, fields: updater(current.fields) }))
    setBridgeToken(crypto.randomUUID())
    setSaved(false)
  }

  function addField() {
    mutateFields((fields) => [...fields, newField()])
  }
  function removeField(id: string) {
    mutateFields((fields) => fields.filter((field) => field.id !== id))
  }
  function moveField(id: string, direction: -1 | 1) {
    mutateFields((fields) => {
      const index = fields.findIndex((field) => field.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= fields.length) return fields
      const next = [...fields]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }
  function updateField(id: string, patch: Partial<FormDocumentField>) {
    mutateFields((fields) => fields.map((field) => (field.id === id ? { ...field, ...patch } : field)))
  }

  const skeletonHtml = useMemo(() => buildFormHtml({ title: "", description: "", submitLabel: "", fields: doc.fields }), [doc.fields])
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 문구 변경은 iframe 내부 contenteditable이 담당하므로 재생성에서 제외
  const editorHtml = useMemo(() => buildEditorTemplate(skeletonHtml, { title: doc.title, description: doc.description, submitLabel: doc.submitLabel }, bridgeToken), [skeletonHtml, bridgeToken])

  useEffect(() => {
    function receive(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return
      const data = event.data
      if (data && data.channel === CHANNEL && data.type === "resize" && data.token === bridgeToken && typeof data.height === "number") {
        setIframeHeight(Math.min(4000, Math.max(400, data.height + 2)))
        return
      }
      if (!isCopyMessage(data) || data.token !== bridgeToken) return
      setDoc((current) => ({ ...current, [data.field]: data.value }))
      setSaved(false)
    }
    window.addEventListener("message", receive)
    return () => window.removeEventListener("message", receive)
  }, [bridgeToken])

  async function submit() {
    setErrors([]); setMessage(""); setSaved(false); setSaving(true)
    try {
      const html = buildFormHtml(doc)
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
          <CardTitle>구조 편집</CardTitle>
          <CardDescription>입력 항목을 추가·삭제·순서 변경하세요. 제목·안내 문구·제출 버튼 문구는 오른쪽 미리보기를 직접 클릭해 고칩니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field><FieldLabel htmlFor="document-editor-name">템플릿 이름</FieldLabel><Input id="document-editor-name" value={name} maxLength={120} onChange={(event) => { setName(event.target.value); setSaved(false) }} placeholder="예: 무료 체크리스트 신청 폼" /></Field>
          </FieldGroup>
          <div className="mt-5 flex flex-col gap-4">
            {doc.fields.map((field, index) => (
              <FieldCard
                key={field.id}
                field={field}
                index={index}
                total={doc.fields.length}
                onChange={(patch) => updateField(field.id, patch)}
                onRemove={() => removeField(field.id)}
                onMove={(direction) => moveField(field.id, direction)}
              />
            ))}
          </div>
          <Button type="button" variant="outline" className="mt-4" onClick={addField}><PlusIcon data-icon="inline-start" />입력 항목 추가</Button>
          {errors.length > 0 && <FieldError errors={errors} className="mt-5" />}
          {message && !errors.length && <Alert variant="destructive" className="mt-5"><AlertTitle>등록할 수 없습니다</AlertTitle><AlertDescription>{message}</AlertDescription></Alert>}
          {saved && <Alert className="mt-5"><CheckCircle2Icon /><AlertTitle>템플릿을 등록했습니다</AlertTitle></Alert>}
        </CardContent>
        <CardFooter>
          <Button type="button" onClick={submit} disabled={saving || !name.trim() || !doc.fields.length}>
            {saving ? <Spinner data-icon="inline-start" /> : <UploadIcon data-icon="inline-start" />}
            {saving ? "등록 중" : "템플릿 등록"}
          </Button>
        </CardFooter>
      </Card>
      <Card className="min-h-[620px]">
        <CardHeader>
          <CardTitle>미리보기</CardTitle>
          <CardDescription>제목·안내 문구·제출 버튼 문구를 클릭해 직접 고칠 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {doc.fields.length ? (
            <iframe ref={iframeRef} title="구조 편집기 미리보기" sandbox="allow-scripts" srcDoc={editorHtml} style={{ height: iframeHeight }} className="w-full rounded-lg border bg-white" />
          ) : (
            <div className="flex min-h-[500px] w-full items-center justify-center rounded-lg border border-dashed text-center text-sm text-muted-foreground">입력 항목을 추가하면 미리보기가 표시됩니다.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
