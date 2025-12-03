import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getReceipt } from '@/app/actions/receipts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Receipt } from 'lucide-react'
import { AddBillItemForm } from './add-bill-item-form'
import { ShareButton } from './share-button'
import { DeleteReceiptButton } from './delete-receipt-button'
import { DeleteBillItemButton } from './delete-bill-item-button'
import { EditDate } from './edit-date'
import { EditNotes } from './edit-notes'
import { JsonUpload } from './json-upload'
import { TogglePaid } from './toggle-paid'
import { UploadImage } from './upload-image'
import { formatDatePST } from '@/lib/date'
import type { Metadata } from 'next'

interface ReceiptPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: ReceiptPageProps
): Promise<Metadata> {
  const { id } = await params
  
  try {
    const receipt = await getReceipt(id)
    const title = receipt.name || 'Receipt Details'
    const totalAmount = receipt.bill_items?.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0) || 0
    const peopleCount = receipt.bill_items?.length || 0
    const formattedDate = formatDatePST(receipt.date)
    
    const description = `Managing ${title} - $${totalAmount.toFixed(2)} split between ${peopleCount} ${peopleCount === 1 ? 'person' : 'people'} on ${formattedDate}`
    
    return {
      title,
      description,
      robots: {
        index: false, // This is a private page, don't index
        follow: false,
      },
    }
  } catch {
    return {
      title: 'Receipt Not Found',
      description: 'This receipt could not be found.',
    }
  }
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
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-background to-brand-100/50 dark:from-background dark:via-brand-50/5 dark:to-background">
      <div className="absolute inset-0 bg-receipt-pattern" />
      
      <div className="relative z-10 container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-brand-100 dark:hover:bg-brand-50/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gradient-brand">
                {receipt.name || 'Receipt Details'}
              </h1>
              <EditDate receiptId={id} currentDate={receipt.date} />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ShareButton receiptId={id} existingLinkId={publicLinkId} />
            <DeleteReceiptButton receiptId={id} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Receipt Image */}
          <Card className="card-receipt overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Receipt Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {receipt.image_url && (
                <div className="relative rounded-xl overflow-hidden bg-muted">
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
          <div className="space-y-4">
            <Card className="card-receipt">
              <CardHeader>
                <CardTitle className="text-lg">Who Owes What</CardTitle>
                <CardDescription>Add people and the amounts they owe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AddBillItemForm receiptId={id} />
                
                {receipt.bill_items && receipt.bill_items.length > 0 ? (
                  <div className="space-y-2 pt-4 border-t border-border">
                    {receipt.bill_items.map((item: { id: string; person_name: string; amount: number; paid: boolean }) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between py-2.5 px-3 rounded-xl group transition-colors ${
                          item.paid 
                            ? 'bg-success/10 dark:bg-success/5' 
                            : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <TogglePaid itemId={item.id} receiptId={id} paid={item.paid} />
                          <span className={`font-medium ${
                            item.paid 
                              ? 'text-success line-through' 
                              : 'text-foreground'
                          }`}>
                            {item.person_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-semibold ${
                            item.paid 
                              ? 'text-success' 
                              : 'text-foreground'
                          }`}>
                            ${item.amount.toFixed(2)}
                          </span>
                          <DeleteBillItemButton itemId={item.id} receiptId={id} />
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex items-center justify-between pt-4 border-t-2 border-brand-200/50 dark:border-brand-400/20">
                      <span className="font-semibold text-muted-foreground">Total</span>
                      <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No items yet. Add people above.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <EditNotes receiptId={id} currentNotes={receipt.notes} />

            {/* JSON Upload */}
            <JsonUpload receiptId={id} />
          </div>
        </div>
      </div>
    </div>
  )
}
