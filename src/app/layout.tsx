import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Lead Magnet CRM", description: "리드마그넷 캠페인과 신청자를 한 곳에서 관리합니다." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko"><body>{children}</body></html>; }