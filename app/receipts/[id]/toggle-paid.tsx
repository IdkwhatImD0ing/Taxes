'use client'

import { useState, useCallback } from 'react'
import { toggleBillItemPaid } from '@/app/actions/receipts'
import { useAsyncMutation } from '@/lib/hooks/use-async-action'
import { Checkbox } from '@/components/ui/checkbox'

interface TogglePaidProps {
  itemId: string
  receiptId: string
  paid: boolean
}

export function TogglePaid({ itemId, receiptId, paid }: TogglePaidProps) {
  const [isPaid, setIsPaid] = useState(paid)

  const { execute, isLoading } = useAsyncMutation(
    useCallback(
      async (checked: boolean) => {
        const result = await toggleBillItemPaid(itemId, receiptId, checked)
        if (result.error) {
          // Revert on error
          setIsPaid(!checked)
          return { error: result.error }
        }
      },
      [itemId, receiptId]
    )
  )

  async function handleToggle(checked: boolean | 'indeterminate') {
    if (checked === 'indeterminate') return
    setIsPaid(checked) // Optimistic update
    await execute(checked)
  }

  return (
    <Checkbox
      checked={isPaid}
      onCheckedChange={handleToggle}
      disabled={isLoading}
      className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
    />
  )
}

