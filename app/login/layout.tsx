import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to access your receipts and bill splits.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
