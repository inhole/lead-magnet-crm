"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { CircleAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    if (!response.ok) {
      setError(data.message ?? "로그인에 실패했습니다.")
      setPending(false)
      return
    }
    router.push("/")
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <p className="mb-10 text-lg font-bold tracking-tight">lead<span className="text-muted-foreground">/</span>magnet</p>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl tracking-[-0.04em]">다시 만나요.</CardTitle>
            <CardDescription>운영자 계정으로 캠페인에 접근하세요.</CardDescription>
          </CardHeader>
          <form onSubmit={submit}>
            <CardContent>
              <FieldGroup>
                <Field data-invalid={Boolean(error) || undefined}>
                  <FieldLabel htmlFor="email">이메일</FieldLabel>
                  <Input id="email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(error) || undefined} placeholder="you@example.com" />
                </Field>
                <Field data-invalid={Boolean(error) || undefined}>
                  <FieldLabel htmlFor="password">비밀번호</FieldLabel>
                  <Input id="password" required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(error) || undefined} />
                </Field>
                {error && (
                  <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertTitle>로그인할 수 없습니다</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </FieldGroup>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending && <Spinner data-icon="inline-start" />}
                {pending ? "로그인 중" : "로그인"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}
