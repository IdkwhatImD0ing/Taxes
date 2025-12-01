'use client'

import { useState } from 'react'
import { bulkAddBillItems } from '@/app/actions/receipts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileJson, Check } from 'lucide-react'

interface JsonUploadProps {
  receiptId: string
}

export function JsonUpload({ receiptId }: JsonUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccess(null)
    setIsUploading(true)

    try {
      const text = await file.text()
      const data = JSON.parse(text)

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
      setIsUploading(false)
      // Reset the input so the same file can be uploaded again
      e.target.value = ''
    }
  }

  return (
    <Card className="border-stone-200/60 dark:border-stone-700/60 bg-white/60 dark:bg-stone-900/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileJson className="w-5 h-5 text-amber-500" />
          Bulk Import
        </CardTitle>
        <CardDescription>
          Upload a JSON file to add multiple people at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <Button 
            variant="outline" 
            className="w-full border-dashed"
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Processing...' : 'Upload JSON File'}
          </Button>
        </div>

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

        <div className="text-xs text-stone-400 dark:text-stone-500 space-y-1">
          <p className="font-medium">Expected format:</p>
          <pre className="bg-stone-100 dark:bg-stone-800 p-2 rounded text-[10px] overflow-x-auto">
{`[
  { "name": "John", "amount": 25.50 },
  { "name": "Jane", "amount": 30.00 }
]`}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

