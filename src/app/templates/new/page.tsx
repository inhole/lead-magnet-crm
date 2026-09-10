import { TemplateEditor } from "@/components/forms/template-editor"

export default async function NewTemplatePage({ searchParams }: { searchParams: Promise<{ duplicateFrom?: string }> }) {
  const { duplicateFrom } = await searchParams
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Templates / New</p>
        <h1 className="text-4xl font-bold tracking-[-0.04em]">HTML 템플릿 등록</h1>
        <p className="mb-10 mt-3 text-muted-foreground">구조 편집기로 필드를 만들거나 HTML을 직접 작성·업로드해 신청 폼을 등록합니다.</p>
        <TemplateEditor duplicateFrom={duplicateFrom} />
    </main>
  )
}
