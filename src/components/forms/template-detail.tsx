"use client"

import { useEffect, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

type Template = {
  id: string
  name: string
  input_schema: Array<{ name: string; label: string; type: string; required: boolean }>
  created_at: string
  default_title: string
  default_description: string
  default_submit_label: string
}

export function TemplateDetail({ templateId }: { templateId: string }) {
  const [template, setTemplate] = useState<Template | null>(null)
  const [preview, setPreview] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/templates/${templateId}/preview`)
      .then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.message); setTemplate(body.template); setPreview(body.preview) })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "템플릿을 불러오지 못했습니다."))
  }, [templateId])

  if (error) return <Alert variant="destructive"><AlertTitle>템플릿을 열 수 없습니다</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
  if (!template || !preview) return <div className="flex min-h-80 items-center justify-center gap-2 text-sm text-muted-foreground"><Spinner /> 템플릿을 불러오는 중입니다.</div>

  return <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]"><Card><CardHeader><CardTitle>{template.name}</CardTitle><CardDescription><time dateTime={template.created_at}>{new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(new Date(template.created_at))}</time></CardDescription></CardHeader><CardContent className="flex flex-col gap-4">
    <dl className="flex flex-col gap-1 text-sm">
      <div><dt className="inline text-muted-foreground">제목: </dt><dd className="inline font-medium">{template.default_title || "지정 안 됨"}</dd></div>
      <div><dt className="inline text-muted-foreground">안내 문구: </dt><dd className="inline">{template.default_description || "지정 안 됨"}</dd></div>
      <div><dt className="inline text-muted-foreground">제출 버튼: </dt><dd className="inline">{template.default_submit_label || "지정 안 됨"}</dd></div>
    </dl>
    <div className="flex flex-col gap-3 border-t pt-3">{template.input_schema.map((field) => <div key={field.name} className="flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium">{field.label}</span><Badge variant="secondary">{field.type}{field.required ? " · 필수" : ""}</Badge></div>)}</div>
  </CardContent></Card><Card><CardHeader><CardTitle>폼 미리보기</CardTitle><CardDescription>등록된 HTML을 실행 권한 없는 sandbox에서 표시합니다.</CardDescription></CardHeader><CardContent><iframe title={`${template.name} 미리보기`} sandbox="" srcDoc={preview} className="min-h-[680px] w-full border-0 bg-white" /></CardContent></Card></div>
}
