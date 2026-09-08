import Link from "next/link"
import { CampaignDetail } from "@/components/campaigns/campaign-detail"

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <main className="min-h-screen"><header className="border-b"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10"><Link href="/" className="text-lg font-bold tracking-tight">lead<span className="text-muted-foreground">/</span>magnet</Link><Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">캠페인으로 돌아가기</Link></div></header><div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14"><p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Campaigns / Detail</p><h1 className="mb-10 text-4xl font-bold tracking-[-0.04em]">캠페인 상세</h1><CampaignDetail id={id} /></div></main>
}
