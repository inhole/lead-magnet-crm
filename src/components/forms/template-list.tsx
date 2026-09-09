"use client"

import { FileCode2Icon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Template = {
  id: string
  name: string
  input_schema: Array<{ name: string }>
  created_at: string
}

const koreaTime = (value: string) => new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  dateStyle: "medium",
  timeStyle: "short",
}).format(new Date(value))

export function TemplateList() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/templates")
      .then(async (response) => {
        const body = await response.json()
        if (!response.ok) throw new Error(body.message)
        setTemplates(body.templates ?? [])
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "템플릿을 불러오지 못했습니다."))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground"><Spinner /> 템플릿을 불러오는 중입니다.</div>
  if (error) return <Alert variant="destructive"><AlertTitle>목록을 불러올 수 없습니다</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
  if (!templates.length) return <Empty className="border"><EmptyHeader><EmptyMedia variant="icon"><FileCode2Icon /></EmptyMedia><EmptyTitle>등록된 템플릿이 없습니다</EmptyTitle><EmptyDescription>HTML을 등록해 첫 커스텀 신청 폼의 기반을 만드세요.</EmptyDescription></EmptyHeader><EmptyContent><Link href="/templates/new" className={buttonVariants()}>첫 템플릿 등록하기</Link></EmptyContent></Empty>

  return (
    <div className="overflow-hidden rounded-2xl border bg-card/55">
      <Table>
        <TableHeader><TableRow><TableHead>템플릿 이름</TableHead><TableHead>입력 항목</TableHead><TableHead className="text-right">등록일</TableHead></TableRow></TableHeader>
        <TableBody>{templates.map((template) => <TableRow key={template.id}><TableCell className="font-medium">{template.name}</TableCell><TableCell><Badge variant="secondary">{template.input_schema.length}개</Badge></TableCell><TableCell className="text-right"><time dateTime={template.created_at} className="text-sm text-muted-foreground">{koreaTime(template.created_at)}</time></TableCell></TableRow>)}</TableBody>
      </Table>
    </div>
  )
}
