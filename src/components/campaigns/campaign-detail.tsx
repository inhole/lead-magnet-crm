"use client"

import { CheckIcon, CopyIcon, ExternalLinkIcon, Globe2Icon, LockIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { CampaignInsights } from "@/components/campaigns/campaign-insights"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

type FormField = { name: string; label: string; type: string; required: boolean }
type Campaign = { id: string; name: string; published_at: string | null; campaign_forms: Array<{ public_id: string; title: string; description: string; submit_label: string; html_templates: { name: string; input_schema: FormField[] } | null }> }
type DistributionLink = { channel: string; link_token: string }
const LABELS: Record<string, string> = { instagram: "인스타그램", x: "X", youtube: "유튜브", threads: "스레드" }

export function CampaignDetail({ id }: { id: string }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null), [error, setError] = useState("")
  const [links, setLinks] = useState<DistributionLink[] | null>(null), [copied, setCopied] = useState("")
  const [linkError, setLinkError] = useState(""), [linkPending, setLinkPending] = useState(false)
  const [publicationError, setPublicationError] = useState(""), [publicationPending, setPublicationPending] = useState(false)
  useEffect(() => { fetch(`/api/campaigns/${id}`).then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.message); setCampaign(body.campaign) }).catch(reason => setError(reason instanceof Error ? reason.message : "캠페인을 불러오지 못했습니다.")) }, [id])
  useEffect(() => { fetch(`/api/campaigns/${id}/links`).then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.message); setLinks(body.links ?? []) }).catch(reason => { setLinks([]); setLinkError(reason instanceof Error ? reason.message : "배포 링크를 불러오지 못했습니다.") }) }, [id])
  if (error) return <Alert variant="destructive"><AlertTitle>캠페인을 불러올 수 없습니다</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
  if (!campaign) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> 캠페인을 불러오는 중입니다.</div>
  const form = campaign.campaign_forms[0]
  const isPublished = Boolean(campaign.published_at)
  async function restoreLinks() {
    setLinkPending(true); setLinkError("")
    try { const response = await fetch(`/api/campaigns/${id}/links`, { method: "POST" }); const body = await response.json(); if (!response.ok) throw new Error(body.message); setLinks(body.links ?? []) }
    catch (reason) { setLinkError(reason instanceof Error ? reason.message : "링크를 만들지 못했습니다.") }
    finally { setLinkPending(false) }
  }
  async function copyUrl(url: string, key: string) {
    try { await navigator.clipboard.writeText(url); setCopied(key); setLinkError("") }
    catch { setLinkError("브라우저가 클립보드 접근을 허용하지 않았습니다. 주소창의 URL을 직접 복사해 주세요.") }
  }
  async function togglePublication() {
    const published = !isPublished
    setPublicationPending(true); setPublicationError("")
    try {
      const response = await fetch(`/api/campaigns/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ published }) })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message)
      setCampaign((current) => current ? { ...current, published_at: body.campaign.published_at } : current)
    } catch (reason) { setPublicationError(reason instanceof Error ? reason.message : "공개 상태를 변경하지 못했습니다.") }
    finally { setPublicationPending(false) }
  }
  const directPath = `/f/${form.public_id}`
  const absoluteUrl = (path: string) => new URL(path, window.location.origin).toString()
  return <div className="flex flex-col gap-6">
    <div className="grid gap-6 lg:grid-cols-2">
      <Card><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>{campaign.name}</CardTitle><Badge variant={campaign.published_at ? "default" : "secondary"}>{campaign.published_at ? "공개" : "미공개"}</Badge></div><CardDescription>{form?.html_templates?.name ?? "템플릿"}</CardDescription></CardHeader><CardContent className="flex flex-col gap-3"><p className="text-xl font-semibold">{form?.title}</p><p className="text-muted-foreground">{form?.description || "안내 문구 없음"}</p><p className="text-sm">버튼 문구: <strong>{form?.submit_label}</strong></p><Button type="button" variant={campaign.published_at ? "outline" : "default"} onClick={togglePublication} disabled={publicationPending}>{campaign.published_at ? <LockIcon data-icon="inline-start" /> : <Globe2Icon data-icon="inline-start" />}{publicationPending ? "변경 중" : campaign.published_at ? "비공개로 전환" : "캠페인 공개하기"}</Button>{publicationError ? <Alert variant="destructive"><AlertTitle>공개 상태를 변경할 수 없습니다</AlertTitle><AlertDescription>{publicationError}</AlertDescription></Alert> : null}</CardContent></Card>
      <Card><CardHeader><CardTitle>배포 링크</CardTitle><CardDescription>직접 유입 URL을 공유하거나 채널별 링크로 유입 성과를 구분하세요.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3">{campaign.published_at ? <div className="grid gap-2 sm:grid-cols-2"><Link href={directPath} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "secondary" })}><ExternalLinkIcon data-icon="inline-start" />직접 유입 폼 열기</Link><Button type="button" variant="outline" onClick={() => copyUrl(absoluteUrl(directPath), "direct")}>{copied === "direct" ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}{copied === "direct" ? "복사됨" : "직접 유입 URL 복사"}</Button></div> : <Alert><LockIcon /><AlertTitle>현재 미공개 캠페인입니다</AlertTitle><AlertDescription>캠페인을 공개하면 직접 유입 폼과 채널 링크가 방문자에게 열립니다.</AlertDescription></Alert>}{links === null ? <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground"><Spinner /> 배포 링크를 불러오는 중입니다.</div> : links.length ? links.map(link => <div key={link.channel} className="flex items-center justify-between gap-3 rounded-lg border p-3"><span className="text-sm font-medium">{LABELS[link.channel]}</span><Button type="button" variant="outline" size="sm" disabled={!campaign.published_at} onClick={() => copyUrl(absoluteUrl(`${directPath}?ref=${link.link_token}`), link.channel)}>{copied === link.channel ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}{copied === link.channel ? "복사됨" : "링크 복사"}</Button></div>) : <Button type="button" onClick={restoreLinks} disabled={linkPending}>{linkPending ? <Spinner data-icon="inline-start" /> : null}{linkPending ? "링크 만드는 중" : "4개 채널 링크 다시 만들기"}</Button>}{linkError ? <Alert variant="destructive"><AlertTitle>배포 링크 작업을 완료하지 못했습니다</AlertTitle><AlertDescription>{linkError}</AlertDescription></Alert> : null}</CardContent></Card>
    </div>
    <CampaignInsights id={id} inputSchema={form?.html_templates?.input_schema ?? []} />
  </div>
}
