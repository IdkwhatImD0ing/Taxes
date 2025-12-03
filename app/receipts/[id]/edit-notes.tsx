'use client'

import { useState, useTransition } from 'react'
import { updateReceiptNotes } from '@/app/actions/receipts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Pencil, Check, X, StickyNote } from 'lucide-react'

interface EditNotesProps {
  receiptId: string
  currentNotes: string | null
}

export function EditNotes({ receiptId, currentNotes }: EditNotesProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(currentNotes || '')
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateReceiptNotes(receiptId, notes)
      if (!result.error) {
        setIsEditing(false)
      }
    })
  }

  const handleCancel = () => {
    setNotes(currentNotes || '')
    setIsEditing(false)
  }

  return (
    <Card className="border-stone-200/60 dark:border-stone-700/60 bg-white/80 dark:bg-stone-900/80 shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-lg">Notes</CardTitle>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
            >
              <Pencil className="w-4 h-4 mr-1" />
              {currentNotes ? 'Edit' : 'Add'}
            </Button>
          )}
        </div>
        <CardDescription>
          Additional notes or comments about this receipt
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this receipt..."
              rows={4}
              disabled={isPending}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 disabled:opacity-50 resize-none"
              autoFocus
            />
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isPending}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isPending}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Check className="w-4 h-4 mr-1" />
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-h-[60px]">
            {currentNotes ? (
              <p className="text-stone-600 dark:text-stone-300 whitespace-pre-wrap">
                {currentNotes}
              </p>
            ) : (
              <p className="text-stone-400 dark:text-stone-500 italic">
                No notes added yet. Click "Add" to add notes.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

