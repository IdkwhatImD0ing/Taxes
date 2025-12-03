'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface CopyZelleButtonProps {
  zelleNumber: string
}

export function CopyZelleButton({ zelleNumber }: CopyZelleButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(zelleNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Format phone number for display: (408) 585-8267
  const formattedNumber = `(${zelleNumber.slice(0, 3)}) ${zelleNumber.slice(3, 6)}-${zelleNumber.slice(6)}`

  return (
    <button
      onClick={handleCopy}
      className={`
        group flex items-center gap-3 px-5 py-3 rounded-xl font-mono text-xl font-semibold
        transition-all duration-200 ease-out
        ${copied 
          ? 'bg-success/15 text-success border-2 border-success/30' 
          : 'bg-[#6D1ED4]/10 text-[#6D1ED4] dark:text-[#9D5BD2] border-2 border-[#6D1ED4]/20 hover:border-[#6D1ED4]/40 hover:bg-[#6D1ED4]/15 active:scale-[0.98]'
        }
      `}
    >
      <span>{formattedNumber}</span>
      {copied ? (
        <Check className="w-5 h-5 text-success" />
      ) : (
        <Copy className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  )
}

