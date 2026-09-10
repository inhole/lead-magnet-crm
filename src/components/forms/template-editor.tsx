"use client"

import { useEffect, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocumentEditor } from "@/components/forms/document-editor"
import { HtmlEditor } from "@/components/forms/html-editor"
import { HtmlUpload } from "@/components/forms/html-upload"
import { parseFormDocument, type FormDocument } from "@/lib/forms/document"

type Duplicate = { name: string; document: FormDocument }

export function TemplateEditor({ duplicateFrom }: { duplicateFrom?: string }) {
  const [mode, setMode] = useState("build")
  const [duplicate, setDuplicate] = useState<Duplicate | null>(null)
  const [loading, setLoading] = useState(Boolean(duplicateFrom))
  const [error, setError] = useState("")

  useEffect(() => {
    if (!duplicateFrom) return
    fetch(`/api/templates/${duplicateFrom}/preview`)
      .then(async (response) => {
        const body = await response.json()
        if (!response.ok) throw new Error(body.message)
        setDuplicate({ name: body.template.name, document: parseFormDocument(body.html) })
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "복제할 템플릿을 불러오지 못했습니다."))
      .finally(() => setLoading(false))
  }, [duplicateFrom])

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> 복제할 템플릿을 불러오는 중입니다.</div>

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert variant="destructive"><AlertTitle>복제할 템플릿을 불러올 수 없습니다</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
      <Tabs value={mode} onValueChange={(value) => setMode(value as string)} className="flex-col">
        <TabsList>
          <TabsTrigger value="build">구조로 만들기</TabsTrigger>
          <TabsTrigger value="html">HTML 직접 작성</TabsTrigger>
          <TabsTrigger value="upload">파일 업로드</TabsTrigger>
        </TabsList>
        <TabsContent value="build"><DocumentEditor initialDocument={duplicate?.document} initialName={duplicate ? `${duplicate.name} 복제` : undefined} /></TabsContent>
        <TabsContent value="html"><HtmlEditor /></TabsContent>
        <TabsContent value="upload"><HtmlUpload /></TabsContent>
      </Tabs>
    </div>
  )
}
