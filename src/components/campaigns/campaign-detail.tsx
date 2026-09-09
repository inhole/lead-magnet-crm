"use client"

import { CheckIcon, CopyIcon, ExternalLinkIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { CampaignInsights } from "@/components/campaigns/campaign-insights"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

type Campaign = { id: string; name: string; campaign_forms: Array<{ public_id: string; title: string; description: string; submit_label: string; html_templates: { name: string } | null }> }
type DistributionLink = { channel: string; link_token: string }
const LABELS: Record<string, string> = { instagram: "인스타그램", x: "X", youtube: "유튜브", threads: "스레드" }

export function CampaignDetail({ id }: { id: string }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null), [error, setError] = useState("")
  const [links, setLinks] = useState<DistributionLink[]>([]), [copied, setCopied] = useState("")
  const [linkError, setLinkError] = useState(""), [linkPending, setLinkPending] = useState(false)
  useEffect(() => { fetch(`/api/campaigns/${id}`).then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.message); setCampaign(body.campaign) }).catch(reason => setError(reason instanceof Error ? reason.message : "캠페인을 불러오지 못했습니다.")) }, [id])
  if (error) return <Alert variant="destructive"><AlertTitle>캠페인을 불러올 수 없습니다</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
  if (!campaign) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> 캠페인을 불러오는 중입니다.</div>
  const form = campaign.campaign_forms[0]
  async function loadLinks() {
    setLinkPending(true); setLinkError("")
    try { const response = await fetch(`/api/campaigns/${id}/links`, { method: "POST" }); const body = await response.json(); if (!response.ok) throw new Error(body.message); setLinks(body.links) }
    catch (reason) { setLinkError(reason instanceof Error ? reason.message : "링크를 만들지 못했습니다.") }
    finally { setLinkPending(false) }
  }
  async function copyUrl(url: string, key: string) {
    try { await navigator.clipboard.writeText(url); setCopied(key); setLinkError("") }
    catch { setLinkError("브라우저가 클립보드 접근을 허용하지 않았습니다. 주소창의 URL을 직접 복사해 주세요.") }
  }
  const directPath = `/f/${form.public_id}`
  const absoluteUrl = (path: string) => new URL(path, window.location.origin).toString()
  return <div className="flex flex-col gap-6">
    <div className="grid gap-6 lg:grid-cols-2">
      <Card><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>{campaign.name}</CardTitle><Badge>공개 가능</Badge></div><CardDescription>{form?.html_templates?.name ?? "템플릿"}</CardDescription></CardHeader><CardContent className="flex flex-col gap-3"><p className="text-xl font-semibold">{form?.title}</p><p className="text-muted-foreground">{form?.description || "안내 문구 없음"}</p><p className="text-sm">버튼 문구: <strong>{form?.submit_label}</strong></p></CardContent></Card>
      <Card><CardHeader><CardTitle>배포 링크</CardTitle><CardDescription>직접 유입 URL을 공유하거나 채널별 링크로 유입 성과를 구분하세요.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3"><div className="grid gap-2 sm:grid-cols-2"><Link href={directPath} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "secondary" })}><ExternalLinkIcon data-icon="inline-start" />직접 유입 폼 열기</Link><Button type="button" variant="outline" onClick={() => copyUrl(absoluteUrl(directPath), "direct")}>{copied === "direct" ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}{copied === "direct" ? "복사됨" : "직접 유입 URL 복사"}</Button></div>{links.length ? links.map(link => <div key={link.channel} className="flex items-center justify-between gap-3 rounded-lg border p-3"><span className="text-sm font-medium">{LABELS[link.channel]}</span><Button type="button" variant="outline" size="sm" onClick={() => copyUrl(absoluteUrl(`${directPath}?ref=${link.link_token}`), link.channel)}>{copied === link.channel ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}{copied === link.channel ? "복사됨" : "링크 복사"}</Button></div>) : <Button type="button" onClick={loadLinks} disabled={linkPending}>{linkPending ? <Spinner data-icon="inline-start" /> : null}{linkPending ? "링크 만드는 중" : "4개 채널 링크 만들기"}</Button>}{linkError ? <Alert variant="destructive"><AlertTitle>배포 링크 작업을 완료하지 못했습니다</AlertTitle><AlertDescription>{linkError}</AlertDescription></Alert> : null}</CardContent></Card>
    </div>
    <CampaignInsights id={id} />
  </div>
}
