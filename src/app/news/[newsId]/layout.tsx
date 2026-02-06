import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '뉴스 상세 - Finance Web',
  description: '뉴스 상세 정보를 확인하세요',
}

export default function NewsDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
