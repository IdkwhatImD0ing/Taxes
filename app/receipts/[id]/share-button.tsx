'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { generatePublicLink } from '@/app/actions/receipts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Share2, Copy, Check, ExternalLink, X } from 'lucide-react'

interface ShareButtonProps {
  receiptId: string
  existingLinkId?: string
}

export function ShareButton({ receiptId, existingLinkId }: ShareButtonProps) {
  const [linkId, setLinkId] = useState<string | null>(existingLinkId || null)
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const publicUrl = linkId 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/bill/${linkId}`
    : null

  // Close dropdown
  const closeDropdown = useCallback(() => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }, [])

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return
      
      if (event.key === 'Escape') {
        event.preventDefault()
        closeDropdown()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeDropdown])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  async function handleGenerateLink() {
    setIsGenerating(true)
    setError(null)
    
    const result = await generatePublicLink(receiptId)
    
    if (result.error) {
      setError(result.error)
    } else if (result.id) {
      setLinkId(result.id)
    }
    
    setIsGenerating(false)
  }

  async function handleCopy() {
    if (publicUrl) {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        ref={triggerRef}
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={linkId ? 'Share settings (shared)' : 'Share this receipt'}
        className={`gap-2 ${linkId ? 'border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300' : ''}`}
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">{linkId ? 'Shared' : 'Share'}</span>
      </Button>

      {isOpen && (
        <div 
          role="dialog"
          aria-label="Share bill"
          className="absolute right-0 top-full mt-2 w-80 p-4 bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700 z-50"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-stone-800 dark:text-stone-200">Share Bill</h3>
            <button 
              onClick={closeDropdown}
              aria-label="Close share dialog"
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {linkId && publicUrl ? (
            <div className="space-y-3">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Anyone with this link can view the bill
              </p>
              <div className="flex gap-2">
                <Input
                  value={publicUrl}
                  readOnly
                  className="font-mono text-xs border-stone-300 dark:border-stone-600"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Open in new tab
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Generate a public link to share with friends
              </p>
              <Button
                onClick={handleGenerateLink}
                disabled={isGenerating}
                size="sm"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {isGenerating ? 'Generating...' : 'Generate Link'}
              </Button>
              {error && (
                <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

