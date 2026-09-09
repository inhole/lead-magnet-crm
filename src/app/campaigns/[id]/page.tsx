import { CampaignDetail } from "@/components/campaigns/campaign-detail"

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 lg:px-10 lg:py-14"><p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Campaigns / Detail</p><h1 className="mb-10 text-4xl font-bold tracking-[-0.04em]">캠페인 상세</h1><CampaignDetail id={id} /></main>
}
