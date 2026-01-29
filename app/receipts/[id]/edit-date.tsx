'use client'

import { useState, useCallback } from 'react'
import { updateReceiptDate } from '@/app/actions/receipts'
import { useAsyncMutation } from '@/lib/hooks/use-async-action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Check, X } from 'lucide-react'
import { formatDatePST } from '@/lib/date'

interface EditDateProps {
  receiptId: string
  currentDate: string
}

export function EditDate({ receiptId, currentDate }: EditDateProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [date, setDate] = useState(currentDate)

  const { execute, isLoading } = useAsyncMutation(
    useCallback(
      async () => {
        const result = await updateReceiptDate(receiptId, date)
        if (result.error) {
          return { error: result.error }
        }
        setIsEditing(false)
      },
      [receiptId, date]
    )
  )

  function handleCancel() {
    setDate(currentDate)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Receipt date"
          className="w-40 h-8 text-sm border-stone-300 dark:border-stone-600"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => execute()}
          disabled={isLoading}
          aria-label="Save date"
          className="h-8 w-8 text-emerald-600 hover:text-emerald-700"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          disabled={isLoading}
          aria-label="Cancel editing"
          className="h-8 w-8 text-stone-400 hover:text-stone-600"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 group">
      <p className="text-sm text-stone-500 dark:text-stone-400">
        {formatDatePST(currentDate)}
      </p>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsEditing(true)}
        aria-label="Edit date"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-stone-600"
      >
        <Pencil className="w-3 h-3" />
      </Button>
    </div>
  )
}

