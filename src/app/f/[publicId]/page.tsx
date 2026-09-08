import { PublicForm } from "@/components/campaigns/public-form"

export default async function PublicFormPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params
  return <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10"><div className="w-full max-w-lg"><PublicForm publicId={publicId} /></div></main>
}
