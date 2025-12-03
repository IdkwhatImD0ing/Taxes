import Link from 'next/link'
import { getReceipts } from '@/app/actions/receipts'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Receipt, ExternalLink, LogOut } from 'lucide-react'
import { formatDateShortPST } from '@/lib/date'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your receipts and bill splits in one place.',
  robots: {
    index: false, // This is a private dashboard
    follow: false,
  },
}

export default async function Dashboard() {
  const receipts = await getReceipts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-orange-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.08),transparent_50%)]" />
      
      <div className="relative z-10 container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-xl">🧾</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-stone-800 to-stone-600 dark:from-stone-100 dark:to-stone-300 bg-clip-text text-transparent">
              Receipt Split
            </h1>
          </div>
          
          <form action={logout}>
            <Button variant="ghost" size="sm" className="text-stone-500 hover:text-stone-700">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </form>
        </div>

        {/* Create Receipt Button */}
        <Link href="/receipts/new">
          <Card className="mb-6 border-dashed border-2 border-amber-300/50 dark:border-amber-600/30 bg-white/40 dark:bg-stone-900/40 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-white/60 dark:hover:bg-stone-900/60 transition-all cursor-pointer group">
            <CardContent className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-stone-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                <Plus className="w-6 h-6" />
                <span className="font-medium text-lg">Create New Receipt</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Receipts List */}
        {receipts.length === 0 ? (
          <Card className="border-stone-200/60 dark:border-stone-700/60 bg-white/60 dark:bg-stone-900/60">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Receipt className="w-12 h-12 text-stone-300 dark:text-stone-600 mb-4" />
              <p className="text-stone-500 dark:text-stone-400">No receipts yet</p>
              <p className="text-sm text-stone-400 dark:text-stone-500">Create your first receipt to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {receipts.map((receipt) => {
              const totalAmount = receipt.bill_items?.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0) || 0
              const peopleCount = receipt.bill_items?.length || 0
              const hasPublicLink = receipt.public_links && receipt.public_links.length > 0

              return (
                <Link key={receipt.id} href={`/receipts/${receipt.id}`}>
                  <Card className="border-stone-200/60 dark:border-stone-700/60 bg-white/80 dark:bg-stone-900/80 hover:shadow-lg hover:border-amber-300/50 dark:hover:border-amber-600/30 transition-all cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-stone-800 dark:text-stone-100">
                            {receipt.name || 'Untitled Receipt'}
                          </CardTitle>
                          <CardDescription className="text-stone-500 dark:text-stone-400">
                            {formatDateShortPST(receipt.date)}
                          </CardDescription>
                        </div>
                        {hasPublicLink && (
                          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full">
                            <ExternalLink className="w-3 h-3" />
                            <span>Shared</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-stone-500 dark:text-stone-400">
                          {peopleCount} {peopleCount === 1 ? 'person' : 'people'}
                        </span>
                        <span className="text-xl font-semibold text-stone-800 dark:text-stone-100">
                          ${totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
