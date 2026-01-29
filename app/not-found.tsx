import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Search } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-background to-brand-100/50 dark:from-background dark:via-brand-50/5 dark:to-background p-4">
      <div className="absolute inset-0 bg-receipt-pattern" />
      
      <Card className="w-full max-w-md relative z-10 card-receipt text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-200 to-brand-300 dark:from-brand-400/20 dark:to-brand-500/20 flex items-center justify-center shadow-lg">
            <Search className="w-10 h-10 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-6xl font-bold text-gradient-brand">
              404
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Page Not Found
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          
          <Link href="/">
            <Button className="btn-brand w-full">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

