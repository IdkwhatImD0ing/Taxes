import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getReceipt } from '@/app/actions/receipts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Receipt } from 'lucide-react'
import { AddBillItemForm } from './add-bill-item-form'
import { PublicLinkSection } from './public-link-section'
import { DeleteReceiptButton } from './delete-receipt-button'
import { DeleteBillItemButton } from './delete-bill-item-button'
import { EditDate } from './edit-date'
import { JsonUpload } from './json-upload'
import { TogglePaid } from './toggle-paid'
import { UploadImage } from './upload-image'

interface ReceiptPageProps {
  params: Promise<{ id: string }>
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const { id } = await params
  
  let receipt
  try {
    receipt = await getReceipt(id)
  } catch {
    notFound()
  }

  const totalAmount = receipt.bill_items?.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0) || 0
  const publicLinkId = receipt.public_links?.[0]?.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-orange-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.08),transparent_50%)]" />
      
      <div className="relative z-10 container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-stone-800 to-stone-600 dark:from-stone-100 dark:to-stone-300 bg-clip-text text-transparent">
                {receipt.notes || 'Receipt Details'}
              </h1>
              <EditDate receiptId={id} currentDate={receipt.date} />
            </div>
          </div>
          
          <DeleteReceiptButton receiptId={id} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Receipt Image */}
          <Card className="border-stone-200/60 dark:border-stone-700/60 bg-white/80 dark:bg-stone-900/80 shadow-xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Receipt Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {receipt.image_url && (
                <div className="relative rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <Image
                    src={receipt.image_url}
                    alt="Receipt"
                    width={600}
                    height={800}
                    className="w-full h-auto max-h-[500px] object-contain"
                  />
                </div>
              )}
              <UploadImage receiptId={id} hasExistingImage={!!receipt.image_url} />
            </CardContent>
          </Card>

          {/* Bill Items */}
          <div className="space-y-6">
            <Card className="border-stone-200/60 dark:border-stone-700/60 bg-white/80 dark:bg-stone-900/80 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Who Owes What</CardTitle>
                <CardDescription>Add people and the amounts they owe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AddBillItemForm receiptId={id} />
                
                {receipt.bill_items && receipt.bill_items.length > 0 ? (
                  <div className="space-y-2 pt-4 border-t border-stone-200 dark:border-stone-700">
                    {receipt.bill_items.map((item: { id: string; person_name: string; amount: number; paid: boolean }) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between py-2 px-3 rounded-lg group transition-colors ${
                          item.paid 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20' 
                            : 'bg-stone-50 dark:bg-stone-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <TogglePaid itemId={item.id} receiptId={id} paid={item.paid} />
                          <span className={`font-medium ${
                            item.paid 
                              ? 'text-emerald-700 dark:text-emerald-300 line-through' 
                              : 'text-stone-700 dark:text-stone-200'
                          }`}>
                            {item.person_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-semibold ${
                            item.paid 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-stone-800 dark:text-stone-100'
                          }`}>
                            ${item.amount.toFixed(2)}
                          </span>
                          <DeleteBillItemButton itemId={item.id} receiptId={id} />
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-stone-300 dark:border-stone-600">
                      <span className="font-semibold text-stone-600 dark:text-stone-300">Total</span>
                      <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-stone-400 dark:text-stone-500 py-4">
                    No items yet. Add people above.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Public Link */}
            <PublicLinkSection receiptId={id} existingLinkId={publicLinkId} />

            {/* JSON Upload */}
            <JsonUpload receiptId={id} />
          </div>
        </div>
      </div>
    </div>
  )
}

