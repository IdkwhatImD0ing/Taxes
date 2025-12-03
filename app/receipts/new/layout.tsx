import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Receipt',
  description: 'Create a new receipt and split the bill with friends.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NewReceiptLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
