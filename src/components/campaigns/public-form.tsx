"use client"

import { useEffect, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

type PublicFormData = { title: string; description: string; submit_label: string; input_schema: Array<{ name: string; label: string; type: string; required: boolean }> }

export function PublicForm({ publicId }: { publicId: string }) {
  const [form, setForm] = useState<PublicFormData | null>(null)
  const [error, setError] = useState("")
  useEffect(() => { fetch(`/api/public/forms/${publicId}`).then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.message); setForm(body.form) }).catch((reason) => setError(reason instanceof Error ? reason.message : "폼을 불러오지 못했습니다.")) }, [publicId])
  if (error) return <Alert variant="destructive"><AlertTitle>폼을 열 수 없습니다</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
  if (!form) return <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Spinner /> 폼을 불러오는 중입니다.</div>
  return <Card><CardHeader><CardTitle>{form.title}</CardTitle><CardDescription>{form.description}</CardDescription></CardHeader><CardContent className="flex flex-col gap-3">{form.input_schema.map((field) => <div key={field.name} className="rounded-lg border px-3 py-3"><p className="text-sm font-medium">{field.label}{field.required ? " *" : ""}</p><p className="text-xs text-muted-foreground">{field.type}</p></div>)}</CardContent><CardFooter><Button disabled>{form.submit_label}</Button><span className="text-xs text-muted-foreground">신청 저장은 다음 단계에서 활성화됩니다.</span></CardFooter></Card>
}
