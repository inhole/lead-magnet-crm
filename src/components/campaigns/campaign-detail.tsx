"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { CheckIcon, CopyIcon, ExternalLinkIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

type Campaign = { id: string; name: string; campaign_forms: Array<{ public_id: string; title: string; description: string; submit_label: string; html_templates: { name: string } | null }> }
type DistributionLink = { channel: string; link_token: string }
const CHANNEL_LABELS: Record<string, string> = { instagram: "인스타그램", x: "X", youtube: "유튜브", threads: "스레드" }

export function CampaignDetail({ id }: { id: string }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [error, setError] = useState("")
  const [links, setLinks] = useState<DistributionLink[]>([])
  const [copied, setCopied] = useState("")
  useEffect(() => { fetch(`/api/campaigns/${id}`).then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.message); setCampaign(body.campaign) }).catch((reason) => setError(reason instanceof Error ? reason.message : "캠페인을 불러오지 못했습니다.")) }, [id])
  if (error) return <Alert variant="destructive"><AlertTitle>캠페인을 불러올 수 없습니다</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
  if (!campaign) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> 캠페인을 불러오는 중입니다.</div>
  const form = campaign.campaign_forms[0]
  async function loadLinks() { const response = await fetch(`/api/campaigns/${id}/links`, { method: "POST" }); const body = await response.json(); if (!response.ok) throw new Error(body.message); setLinks(body.links) }
  async function copyLink(link: DistributionLink) { const url = `${window.location.origin}/f/${form.public_id}?ref=${link.link_token}`; await navigator.clipboard.writeText(url); setCopied(link.channel) }
  return <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>{campaign.name}</CardTitle><Badge>공개 가능</Badge></div><CardDescription>{form?.html_templates?.name ?? "템플릿"}</CardDescription></CardHeader><CardContent className="flex flex-col gap-3"><p className="text-xl font-semibold">{form?.title}</p><p className="text-muted-foreground">{form?.description || "안내 문구 없음"}</p><p className="text-sm">버튼 문구: <strong>{form?.submit_label}</strong></p></CardContent></Card><Card><CardHeader><CardTitle>배포 링크</CardTitle><CardDescription>채널별 링크로 방문과 신청 유입을 연결합니다.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3">{form ? <Link href={`/f/${form.public_id}`} className={buttonVariants({ variant: "secondary" })}><ExternalLinkIcon data-icon="inline-start" />직접 유입 폼 열기</Link> : null}{links.length ? links.map(link => <div key={link.channel} className="flex items-center justify-between gap-3 rounded-lg border p-3"><span className="text-sm font-medium">{CHANNEL_LABELS[link.channel]}</span><Button type="button" variant="outline" size="sm" onClick={() => copyLink(link)}>{copied === link.channel ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}{copied === link.channel ? "복사됨" : "링크 복사"}</Button></div>) : <Button type="button" onClick={() => loadLinks().catch(reason => setError(reason instanceof Error ? reason.message : "링크를 만들지 못했습니다."))}>4개 채널 링크 만들기</Button>}</CardContent></Card></div>
}
