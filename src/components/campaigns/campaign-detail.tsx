"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

type Campaign = { id: string; name: string; campaign_forms: Array<{ public_id: string; title: string; description: string; submit_label: string; html_templates: { name: string } | null }> }

export function CampaignDetail({ id }: { id: string }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [error, setError] = useState("")
  useEffect(() => { fetch(`/api/campaigns/${id}`).then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.message); setCampaign(body.campaign) }).catch((reason) => setError(reason instanceof Error ? reason.message : "캠페인을 불러오지 못했습니다.")) }, [id])
  if (error) return <Alert variant="destructive"><AlertTitle>캠페인을 불러올 수 없습니다</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
  if (!campaign) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> 캠페인을 불러오는 중입니다.</div>
  const form = campaign.campaign_forms[0]
  return <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>{campaign.name}</CardTitle><Badge>공개 가능</Badge></div><CardDescription>{form?.html_templates?.name ?? "템플릿"}</CardDescription></CardHeader><CardContent className="flex flex-col gap-3"><p className="text-xl font-semibold">{form?.title}</p><p className="text-muted-foreground">{form?.description || "안내 문구 없음"}</p><p className="text-sm">버튼 문구: <strong>{form?.submit_label}</strong></p></CardContent></Card><Card><CardHeader><CardTitle>공개 URL</CardTitle><CardDescription>P05에서 채널 추적 링크와 신청 저장을 연결합니다.</CardDescription></CardHeader><CardContent>{form ? <Link href={`/f/${form.public_id}`} className={buttonVariants({ variant: "secondary" })}>공개 폼 열기</Link> : null}</CardContent></Card></div>
}
