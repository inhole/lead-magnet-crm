"use client"

import { BarChart3Icon, BookOpenIcon, FileCode2Icon, LogOutIcon, MegaphoneIcon } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

const PUBLIC_PATHS = ["/login", "/f/", "/api-docs"]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path))

  useEffect(() => {
    if (isPublic) return
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((body) => setEmail(body.user?.email ?? ""))
      .catch(() => setEmail(""))
  }, [isPublic])

  async function logout() {
    setPending(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      setPending(false)
    }
    router.replace("/login")
    router.refresh()
  }

  if (isPublic) return children

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <Link href="/" className="mr-auto text-lg font-bold tracking-tight">
            lead<span className="text-muted-foreground">/</span>magnet
          </Link>
          <nav className="order-3 grid w-full grid-cols-4 gap-1 sm:order-none sm:flex sm:w-auto" aria-label="주 메뉴">
            <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full sm:w-auto", pathname === "/" && "bg-muted")}>
              <MegaphoneIcon data-icon="inline-start" />캠페인
            </Link>
            <Link href="/performance" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full sm:w-auto", pathname === "/performance" && "bg-muted")}>
              <BarChart3Icon data-icon="inline-start" />성과
            </Link>
            <Link href="/templates" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full sm:w-auto", pathname.startsWith("/templates") && "bg-muted")}>
              <FileCode2Icon data-icon="inline-start" />템플릿
            </Link>
            <Link href="/api-docs" target="_blank" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full sm:w-auto")}>
              <BookOpenIcon data-icon="inline-start" />API 문서
            </Link>
          </nav>
          <span className="hidden max-w-48 truncate text-sm text-muted-foreground lg:inline">{email}</span>
          <Button type="button" variant="ghost" size="sm" onClick={logout} disabled={pending}>
            <LogOutIcon data-icon="inline-start" />{pending ? "로그아웃 중" : "로그아웃"}
          </Button>
        </div>
      </header>
      {children}
    </div>
  )
}
