"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { MegaphoneIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"

type Campaign = { id: string; name: string; created_at: string; campaign_forms: Array<{ public_id: string; title: string }> }

export function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/campaigns")
      .then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.message); setCampaigns(body.campaigns ?? []) })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "캠페인을 불러오지 못했습니다."))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground"><Spinner /> 캠페인을 불러오는 중입니다.</div>
  if (error) return <Alert variant="destructive"><AlertTitle>목록을 불러올 수 없습니다</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
  if (!campaigns.length) return <Empty className="border"><EmptyHeader><EmptyMedia variant="icon"><MegaphoneIcon /></EmptyMedia><EmptyTitle>아직 캠페인이 없습니다</EmptyTitle><EmptyDescription>등록한 템플릿으로 첫 공개 폼을 만들어 보세요.</EmptyDescription></EmptyHeader><EmptyContent><Link href="/campaigns/new" className={buttonVariants()}>첫 캠페인 만들기</Link></EmptyContent></Empty>

  return <div className="overflow-hidden rounded-2xl border bg-card/55">{campaigns.map((campaign) => <Link href={`/campaigns/${campaign.id}`} key={campaign.id} className="flex items-center justify-between gap-4 border-b px-5 py-5 last:border-b-0 hover:bg-card"><div className="flex flex-col gap-1"><span className="font-semibold">{campaign.name}</span><span className="text-sm text-muted-foreground">{campaign.campaign_forms[0]?.title}</span></div><div className="flex items-center gap-3"><Badge variant="secondary">공개 폼 생성됨</Badge><time className="hidden text-sm text-muted-foreground sm:inline">{new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium" }).format(new Date(campaign.created_at))}</time></div></Link>)}</div>
}
