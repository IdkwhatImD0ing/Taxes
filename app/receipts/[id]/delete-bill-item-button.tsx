'use client'

import { useState } from 'react'
import { deleteBillItem } from '@/app/actions/receipts'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface DeleteBillItemButtonProps {
  itemId: string
  receiptId: string
}

export function DeleteBillItemButton({ itemId, receiptId }: DeleteBillItemButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    await deleteBillItem(itemId, receiptId)
    setIsDeleting(false)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
      className="w-6 h-6 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-opacity"
    >
      <X className="w-4 h-4" />
    </Button>
  )
}

