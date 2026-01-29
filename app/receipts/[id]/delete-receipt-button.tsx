'use client'

import { useState, useCallback } from 'react'
import { deleteReceipt } from '@/app/actions/receipts'
import { useAsyncMutation } from '@/lib/hooks/use-async-action'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export function DeleteReceiptButton({ receiptId }: { receiptId: string }) {
  const [showConfirm, setShowConfirm] = useState(false)

  const { execute, isLoading } = useAsyncMutation(
    useCallback(
      async () => {
        await deleteReceipt(receiptId)
      },
      [receiptId]
    )
  )

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2" role="alertdialog" aria-label="Confirm delete receipt">
        <span className="text-sm text-stone-500">Delete?</span>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => execute()}
          disabled={isLoading}
          aria-label="Confirm delete"
        >
          {isLoading ? 'Deleting...' : 'Yes'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isLoading}
          aria-label="Cancel delete"
        >
          No
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setShowConfirm(true)}
      aria-label="Delete receipt"
      className="text-stone-400 hover:text-red-500"
    >
      <Trash2 className="w-5 h-5" />
    </Button>
  )
}

