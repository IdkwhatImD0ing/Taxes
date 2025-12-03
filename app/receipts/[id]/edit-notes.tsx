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
        className="w-full px-4 py-3 flex items-center gap-2 text-left border border-dashed border-border rounded-xl hover:border-brand-400 dark:hover:border-brand-400/50 hover:bg-muted/50 transition-colors group"
      >
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-500/10 transition-colors">
          <Plus className="w-4 h-4 text-muted-foreground group-hover:text-brand-500 transition-colors" />
        </div>
        <span className="text-sm text-muted-foreground group-hover:text-foreground">
          Add a note
        </span>
      </button>
    )
  }

  // Editing mode
  if (isEditing) {
    return (
      <div className="border border-border/60 bg-card/90 backdrop-blur-sm rounded-xl p-4 space-y-3 shadow-lg shadow-brand-500/5">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-brand-500" />
          <span className="text-sm font-medium text-foreground">Note</span>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this receipt..."
          rows={3}
          disabled={isPending}
          className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 disabled:opacity-50 resize-none transition-colors"
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
            className="btn-brand"
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
    <div className="border border-border/60 bg-card/90 backdrop-blur-sm rounded-xl p-4 shadow-lg shadow-brand-500/5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <StickyNote className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
          <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words">
            {currentNotes}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="text-muted-foreground hover:text-foreground shrink-0 h-7 w-7 p-0"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
