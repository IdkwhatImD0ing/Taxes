'use client'

import { useState, useTransition } from 'react'
import { updateReceiptNotes } from '@/app/actions/receipts'
import { Button } from '@/components/ui/button'
import { Pencil, Check, X, StickyNote, Plus } from 'lucide-react'

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

  // Compact "Add note" button when no notes exist
  if (!currentNotes && !isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-full px-4 py-3 flex items-center gap-2 text-left border border-dashed border-stone-300 dark:border-stone-600 rounded-xl hover:border-amber-400 dark:hover:border-amber-500 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group"
      >
        <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors">
          <Plus className="w-4 h-4 text-stone-400 group-hover:text-amber-500 transition-colors" />
        </div>
        <span className="text-sm text-stone-500 dark:text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-300">
          Add a note
        </span>
      </button>
    )
  }

  // Editing mode
  if (isEditing) {
    return (
      <div className="border border-stone-200/60 dark:border-stone-700/60 bg-white/80 dark:bg-stone-900/80 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Note</span>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this receipt..."
          rows={3}
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
    )
  }

  // Display mode with existing notes
  return (
    <div className="border border-stone-200/60 dark:border-stone-700/60 bg-white/80 dark:bg-stone-900/80 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <StickyNote className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-stone-600 dark:text-stone-300 whitespace-pre-wrap break-words">
            {currentNotes}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 shrink-0 h-7 w-7 p-0"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}

