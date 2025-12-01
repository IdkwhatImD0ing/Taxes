'use client'

import { useState } from 'react'
import { toggleBillItemPaid } from '@/app/actions/receipts'
import { Checkbox } from '@/components/ui/checkbox'

interface TogglePaidProps {
  itemId: string
  receiptId: string
  paid: boolean
}

export function TogglePaid({ itemId, receiptId, paid }: TogglePaidProps) {
  const [isPaid, setIsPaid] = useState(paid)
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleToggle(checked: boolean) {
    setIsUpdating(true)
    setIsPaid(checked)
    
    const result = await toggleBillItemPaid(itemId, receiptId, checked)
    
    if (result.error) {
      // Revert on error
      setIsPaid(!checked)
    }
    
    setIsUpdating(false)
  }

  return (
    <Checkbox
      checked={isPaid}
      onCheckedChange={handleToggle}
      disabled={isUpdating}
      className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
    />
  )
}

