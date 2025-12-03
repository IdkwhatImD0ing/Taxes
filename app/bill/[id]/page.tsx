import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getPublicBill } from '@/app/actions/receipts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Receipt, Check } from 'lucide-react'
import { formatDatePST } from '@/lib/date'
import type { Metadata } from 'next'

interface PublicBillPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: PublicBillPageProps
): Promise<Metadata> {
  const { id } = await params
  const receipt = await getPublicBill(id)
  
  if (!receipt) {
    return {
      title: 'Bill Not Found',
      description: 'This bill could not be found.',
    }
  }

  const title = receipt.name || 'Bill Split'
  const totalAmount = receipt.bill_items?.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0) || 0
  const peopleCount = receipt.bill_items?.length || 0
  const formattedDate = formatDatePST(receipt.date)
  
  const description = `${title} - $${totalAmount.toFixed(2)} split between ${peopleCount} ${peopleCount === 1 ? 'person' : 'people'} on ${formattedDate}`
  
  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/bill/${id}`,
      siteName: 'Receipt Split',
      locale: 'en_US',
    },
    twitter: {
      card: receipt.image_url ? 'summary_large_image' : 'summary',
      title,
      description,
    },
  }

  // If there's a receipt image, add it to OpenGraph and Twitter cards
  if (receipt.image_url) {
    metadata.openGraph = {
      ...metadata.openGraph,
      images: [
        {
          url: receipt.image_url,
          width: 1200,
          height: 630,
          alt: `Receipt for ${title}`,
        }
      ],
    }
    metadata.twitter = {
      ...metadata.twitter,
      images: [receipt.image_url],
    }
  }

  return metadata
}

export default async function PublicBillPage({ params }: PublicBillPageProps) {
  const { id } = await params
  const receipt = await getPublicBill(id)

  if (!receipt) {
    notFound()
  }

  const totalAmount = receipt.bill_items?.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-orange-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.08),transparent_50%)]" />
      
      <div className="relative z-10 container mx-auto py-8 px-4 max-w-2xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
            <span className="text-3xl">🧾</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-stone-800 to-stone-600 dark:from-stone-100 dark:to-stone-300 bg-clip-text text-transparent">
            {receipt.name || 'Bill Split'}
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2">
            {formatDatePST(receipt.date)}
          </p>
        </div>

        <div className="space-y-6">
          {/* Bill Items */}
          <Card className="border-stone-200/60 dark:border-stone-700/60 bg-white/80 dark:bg-stone-900/80 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg text-center">Who Owes What</CardTitle>
            </CardHeader>
            <CardContent>
              {receipt.bill_items && receipt.bill_items.length > 0 ? (
                <div className="space-y-3">
                  {receipt.bill_items.map((item: { id: string; person_name: string; amount: number; paid: boolean }) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between py-3 px-4 rounded-xl border transition-colors ${
                        item.paid
                          ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200/50 dark:border-emerald-700/30'
                          : 'bg-gradient-to-r from-stone-50 to-amber-50/30 dark:from-stone-800/50 dark:to-amber-900/10 border-stone-200/50 dark:border-stone-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.paid && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <span className={`font-medium text-lg ${
                          item.paid 
                            ? 'text-emerald-700 dark:text-emerald-300 line-through' 
                            : 'text-stone-700 dark:text-stone-200'
                        }`}>
                          {item.person_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-bold ${
                          item.paid 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          ${item.amount.toFixed(2)}
                        </span>
                        {item.paid && (
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                            PAID
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex items-center justify-between pt-4 mt-4 border-t-2 border-amber-300/50 dark:border-amber-600/30">
                    <span className="font-bold text-stone-600 dark:text-stone-300 text-lg">Total</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Receipt className="w-12 h-12 text-stone-300 dark:text-stone-600 mb-4" />
                  <p className="text-stone-500 dark:text-stone-400">No items in this bill yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Receipt Image */}
          {receipt.image_url && (
            <Card className="border-stone-200/60 dark:border-stone-700/60 bg-white/80 dark:bg-stone-900/80 shadow-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg text-center">Receipt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <Image
                    src={receipt.image_url}
                    alt="Receipt"
                    width={600}
                    height={800}
                    className="w-full h-auto max-h-[600px] object-contain"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <p className="text-center text-sm text-stone-400 dark:text-stone-500 pt-4">
            Shared via Receipt Split
          </p>
        </div>
      </div>
    </div>
  )
}

