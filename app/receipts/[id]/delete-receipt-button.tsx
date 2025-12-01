'use client'

import { useState } from 'react'
import { deleteReceipt } from '@/app/actions/receipts'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export function DeleteReceiptButton({ receiptId }: { receiptId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    await deleteReceipt(receiptId)
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-stone-500">Delete?</span>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Yes'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
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
      className="text-stone-400 hover:text-red-500"
    >
      <Trash2 className="w-5 h-5" />
    </Button>
  )
}

