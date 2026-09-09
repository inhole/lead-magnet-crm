import { CampaignForm } from "@/components/campaigns/campaign-form"

export default function NewCampaignPage() {
  return <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 lg:px-10 lg:py-14"><p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Campaigns / New</p><h1 className="text-4xl font-bold tracking-[-0.04em]">새 캠페인</h1><p className="mb-10 mt-3 text-muted-foreground">HTML 템플릿과 방문자에게 보여줄 문구를 연결합니다.</p><CampaignForm /></main>
}
