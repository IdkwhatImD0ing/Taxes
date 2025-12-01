'use client'

import { useState, useRef } from 'react'
import { updateReceiptImage } from '@/app/actions/receipts'
import { uploadImage } from '@/lib/upload'
import { Button } from '@/components/ui/button'
import { Upload, ImageIcon } from 'lucide-react'

interface UploadImageProps {
  receiptId: string
  hasExistingImage: boolean
}

export function UploadImage({ receiptId, hasExistingImage }: UploadImageProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    setError(null)
    setIsUploading(true)
    setProgress('Getting upload URL...')

    try {
      // Upload directly to Supabase from client
      setProgress('Uploading image...')
      const { publicUrl } = await uploadImage(file)

      // Update the receipt record
      setProgress('Saving...')
      const result = await updateReceiptImage(receiptId, publicUrl)

      if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      setProgress(null)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-2">
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-all cursor-pointer p-6
          ${isDragging 
            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' 
            : 'border-stone-300 dark:border-stone-600 hover:border-amber-400 dark:hover:border-amber-500'
          }
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center gap-2 text-stone-500">
          {isUploading ? (
            <>
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center animate-pulse">
                <Upload className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-sm">{progress || 'Uploading...'}</span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                {isDragging ? (
                  <Upload className="w-5 h-5 text-amber-500" />
                ) : (
                  <ImageIcon className="w-5 h-5" />
                )}
              </div>
              <span className="text-sm font-medium">
                {hasExistingImage ? 'Replace image' : 'Upload receipt image'}
              </span>
              <span className="text-xs text-stone-400">Click or drag & drop</span>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md">
          {error}
        </p>
      )}
    </div>
  )
}
