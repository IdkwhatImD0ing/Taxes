'use client'

import { useState, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { createReceipt } from '@/app/actions/receipts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, X, ImageIcon } from 'lucide-react'
import { getTodayPST } from '@/lib/date'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" disabled={pending}>
      {pending ? 'Creating...' : 'Create Receipt'}
    </Button>
  )
}

export default function NewReceiptPage() {
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(file: File | null) {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      if (fileInputRef.current) {
        const dt = new DataTransfer()
        dt.items.add(file)
        fileInputRef.current.files = dt.files
      }
      handleFileChange(file)
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createReceipt(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-orange-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.08),transparent_50%)]" />
      
      <div className="relative z-10 container mx-auto py-8 px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-stone-800 to-stone-600 dark:from-stone-100 dark:to-stone-300 bg-clip-text text-transparent">
            New Receipt
          </h1>
        </div>

        <Card className="border-stone-200/60 dark:border-stone-700/60 bg-white/80 dark:bg-stone-900/80 shadow-xl">
          <CardHeader>
            <CardTitle>Create Receipt</CardTitle>
            <CardDescription>
              Give it a name, optionally upload an image, then add people on the next page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              {/* Name (Required) */}
              <div className="space-y-2">
                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Dinner at Joe's Pizza"
                  required
                  autoFocus
                  className="border-stone-300 dark:border-stone-600"
                />
              </div>

              {/* Date (Required) */}
              <div className="space-y-2">
                <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  required
                  defaultValue={getTodayPST()}
                  className="border-stone-300 dark:border-stone-600"
                />
              </div>

              {/* Image Upload (Optional) */}
              <div className="space-y-2">
                <Label>Receipt Image <span className="text-stone-400 text-sm font-normal">(optional)</span></Label>
                <div
                  className={`
                    relative border-2 border-dashed rounded-lg transition-all cursor-pointer
                    ${isDragging 
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' 
                      : 'border-stone-300 dark:border-stone-600 hover:border-amber-400 dark:hover:border-amber-500'
                    }
                    ${preview ? 'p-2' : 'p-8'}
                  `}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="image"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  />
                  
                  {preview ? (
                    <div className="relative">
                      <Image
                        src={preview}
                        alt="Receipt preview"
                        width={600}
                        height={800}
                        className="w-full h-auto max-h-96 object-contain rounded"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-2 rounded-full shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreview(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-stone-500">
                      <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                        {isDragging ? (
                          <Upload className="w-8 h-8 text-amber-500" />
                        ) : (
                          <ImageIcon className="w-8 h-8" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="font-medium">Drag and drop or click to upload</p>
                        <p className="text-sm text-stone-400">PNG, JPG, WEBP up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}

              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
