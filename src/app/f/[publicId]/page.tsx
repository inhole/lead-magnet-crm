import { PublicForm } from "@/components/campaigns/public-form"

export default async function PublicFormPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params
  return <main className="min-h-screen bg-white"><div className="mx-auto w-full max-w-3xl"><PublicForm publicId={publicId} /></div></main>
}
