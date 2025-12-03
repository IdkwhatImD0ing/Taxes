'use client'

import { useState, useRef } from 'react'
import { bulkAddBillItems } from '@/app/actions/receipts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileJson, Check, ClipboardPaste, Copy } from 'lucide-react'

interface JsonUploadProps {
  receiptId: string
}

const EXAMPLE_JSON = `[
  { "name": "John", "amount": 25.50 },
  { "name": "Jane", "amount": 30.00 }
]`

export function JsonUpload({ receiptId }: JsonUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pasteText, setPasteText] = useState('')
  const [showPasteArea, setShowPasteArea] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function processJsonData(jsonText: string) {
    setError(null)
    setSuccess(null)
    setIsProcessing(true)

    try {
      const data = JSON.parse(jsonText)

      // Validate the JSON structure
      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array')
      }

      const items = data.map((item: unknown, index: number) => {
        if (typeof item !== 'object' || item === null) {
          throw new Error(`Item ${index + 1} is not an object`)
        }
        
        const obj = item as Record<string, unknown>
        const name = obj.name || obj.person_name || obj.person
        const amount = obj.amount || obj.value || obj.total

        if (!name || typeof name !== 'string') {
          throw new Error(`Item ${index + 1} missing valid name`)
        }

        const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount
        if (typeof parsedAmount !== 'number' || isNaN(parsedAmount)) {
          throw new Error(`Item ${index + 1} missing valid amount`)
        }

        return { name: name.trim(), amount: parsedAmount }
      })

      if (items.length === 0) {
        throw new Error('No valid items found in JSON')
      }

      const result = await bulkAddBillItems(receiptId, items)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(`Added ${result.count} ${result.count === 1 ? 'person' : 'people'}`)
        setPasteText('')
        setShowPasteArea(false)
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to parse JSON')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      await processJsonData(text)
    } finally {
      e.target.value = ''
    }
  }

  async function handlePasteSubmit() {
    if (!pasteText.trim()) {
      setError('Please paste some JSON data first')
      return
    }
    await processJsonData(pasteText)
  }

  async function handlePasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText()
      setPasteText(text)
      textareaRef.current?.focus()
    } catch {
      setError('Could not read from clipboard. Please paste manually.')
    }
  }

  function copyExample() {
    navigator.clipboard.writeText(EXAMPLE_JSON)
  }

  return (
    <Card className="border-stone-200/60 dark:border-stone-700/60 bg-white/60 dark:bg-stone-900/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileJson className="w-5 h-5 text-amber-500" />
          Bulk Import
        </CardTitle>
        <CardDescription>
          Upload a JSON file or paste JSON data to add multiple people at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* File Upload */}
        <div className="relative">
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <Button 
            variant="outline" 
            className="w-full border-dashed"
            disabled={isProcessing}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Upload JSON File'}
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 py-1">
          <div className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
          <span className="text-xs text-stone-400 dark:text-stone-500">or</span>
          <div className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
        </div>

        {/* Paste Toggle */}
        {!showPasteArea ? (
          <Button 
            variant="outline" 
            className="w-full"
            disabled={isProcessing}
            onClick={() => setShowPasteArea(true)}
          >
            <ClipboardPaste className="w-4 h-4 mr-2" />
            Paste JSON Data
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Paste your JSON:
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handlePasteFromClipboard}
                disabled={isProcessing}
              >
                <ClipboardPaste className="w-3 h-3 mr-1" />
                Paste from clipboard
              </Button>
            </div>
            <textarea
              ref={textareaRef}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={EXAMPLE_JSON}
              disabled={isProcessing}
              className="w-full h-32 px-3 py-2 text-sm font-mono bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 disabled:opacity-50"
            />
            <div className="flex gap-2">
              <Button
                onClick={handlePasteSubmit}
                disabled={isProcessing || !pasteText.trim()}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {isProcessing ? 'Processing...' : 'Import'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowPasteArea(false)
                  setPasteText('')
                  setError(null)
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-md flex items-center gap-2">
            <Check className="w-4 h-4" />
            {success}
          </p>
        )}

        {/* Expected Format Example */}
        <div className="text-xs text-stone-400 dark:text-stone-500 space-y-1">
          <div className="flex items-center justify-between">
            <p className="font-medium">Expected format:</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2 hover:text-amber-600"
              onClick={copyExample}
              title="Copy example"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
          </div>
          <pre className="bg-stone-100 dark:bg-stone-800 p-2 rounded text-[10px] overflow-x-auto">
{EXAMPLE_JSON}
          </pre>
          <p className="text-[10px] mt-1 text-stone-400">
            Also accepts: <code className="bg-stone-100 dark:bg-stone-800 px-1 rounded">person_name</code>, <code className="bg-stone-100 dark:bg-stone-800 px-1 rounded">person</code> for name; <code className="bg-stone-100 dark:bg-stone-800 px-1 rounded">value</code>, <code className="bg-stone-100 dark:bg-stone-800 px-1 rounded">total</code> for amount
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

