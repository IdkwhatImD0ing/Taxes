'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { addBillItem } from '@/app/actions/receipts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button 
      type="submit" 
      size="icon"
      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shrink-0"
      disabled={pending}
    >
      <Plus className="w-4 h-4" />
    </Button>
  )
}

export function AddBillItemForm({ receiptId }: { receiptId: string }) {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await addBillItem(receiptId, formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div className="space-y-2">
      <form action={handleSubmit} className="flex gap-2">
        <Input
          name="person_name"
          placeholder="Name"
          required
          className="border-stone-300 dark:border-stone-600"
        />
        <Input
          name="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="Amount"
          required
          className="w-28 border-stone-300 dark:border-stone-600"
        />
        <SubmitButton />
      </form>
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

