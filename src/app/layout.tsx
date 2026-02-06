import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/shared/components/providers";
import { ThemeProvider } from "@/shared/components/theme-provider";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";

export const metadata: Metadata = {
  title: "Finance Web - 미국 주식 & 코인 뉴스",
  description: "미국주식과 코인 관련 최신 뉴스를 실시간으로 확인하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          <Providers>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
