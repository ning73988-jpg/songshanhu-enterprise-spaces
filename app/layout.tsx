import type { Metadata } from "next";
import "./globals.css";
import { sitePath } from "@/lib/site-path";

export const metadata: Metadata = {
  title: "松山湖产业招商｜园区与产业空间",
  description: "查找松山湖写字楼、厂房、研发办公与仓储空间。当前为评审版，房源资料为演示数据。",
  icons: {
    icon: sitePath("/favicon.svg"),
    shortcut: sitePath("/favicon.svg"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
