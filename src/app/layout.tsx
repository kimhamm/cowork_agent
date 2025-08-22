import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HEM Agent - MCP 기반 일정 관리",
  description: "자연어로 일정을 관리할 수 있는 MCP 기반 애플리케이션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <UserProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
