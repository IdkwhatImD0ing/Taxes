'use client'

import { useCallback } from 'react'
import { deleteBillItem } from '@/app/actions/receipts'
import { useAsyncMutation } from '@/lib/hooks/use-async-action'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface DeleteBillItemButtonProps {
  itemId: string
  receiptId: string
}

export function DeleteBillItemButton({ itemId, receiptId }: DeleteBillItemButtonProps) {
  const { execute, isLoading } = useAsyncMutation(
    useCallback(
      async () => {
        await deleteBillItem(itemId, receiptId)
      },
      [itemId, receiptId]
    )
  )

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => execute()}
      disabled={isLoading}
      aria-label="Delete bill item"
      className="w-6 h-6 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-opacity"
    >
      <X className="w-4 h-4" />
    </Button>
  )
}

