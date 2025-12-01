'use client'

import { useState } from 'react'
import { generatePublicLink } from '@/app/actions/receipts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Link, Copy, Check, ExternalLink } from 'lucide-react'

interface PublicLinkSectionProps {
  receiptId: string
  existingLinkId?: string
}

export function PublicLinkSection({ receiptId, existingLinkId }: PublicLinkSectionProps) {
  const [linkId, setLinkId] = useState<string | null>(existingLinkId || null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const publicUrl = linkId 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/bill/${linkId}`
    : null

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
    <Card className="border-stone-200/60 dark:border-stone-700/60 bg-white/80 dark:bg-stone-900/80 shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Link className="w-5 h-5 text-amber-500" />
          Share Bill
        </CardTitle>
        <CardDescription>Generate a public link to share with friends</CardDescription>
      </CardHeader>
      <CardContent>
        {linkId && publicUrl ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={publicUrl}
                readOnly
                className="font-mono text-sm border-stone-300 dark:border-stone-600"
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
              className="inline-flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Open in new tab
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={handleGenerateLink}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {isGenerating ? 'Generating...' : 'Generate Public Link'}
            </Button>
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

