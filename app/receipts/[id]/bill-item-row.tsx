'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { TogglePaid } from './toggle-paid'
import { DeleteBillItemButton } from './delete-bill-item-button'
import type { BillItem, BillItemBreakdown } from '@/lib/types'

interface BillItemRowProps {
  item: BillItem
  receiptId: string
}

export function BillItemRow({ item, receiptId }: BillItemRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const breakdown = item.breakdown as BillItemBreakdown | null | undefined

  return (
    <div
      className={`rounded-xl transition-colors ${
        item.paid 
          ? 'bg-success/10 dark:bg-success/5' 
          : 'bg-muted/50'
      }`}
    >
      {/* Main row */}
      <div className="flex items-center justify-between py-2.5 px-3">
        <div className="flex items-center gap-2">
          {breakdown && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-0.5 hover:bg-stone-200 dark:hover:bg-stone-700 rounded transition-colors"
              aria-label={isExpanded ? 'Collapse breakdown' : 'Expand breakdown'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-stone-500" />
              )}
            </button>
          )}
          <TogglePaid itemId={item.id} receiptId={receiptId} paid={item.paid} />
          <span className={`font-medium ${
            item.paid 
              ? 'text-success line-through' 
              : 'text-foreground'
          }`}>
            {item.person_name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-semibold ${
            item.paid 
              ? 'text-success' 
              : 'text-foreground'
          }`}>
            ${item.amount.toFixed(2)}
          </span>
          <DeleteBillItemButton itemId={item.id} receiptId={receiptId} />
        </div>
      </div>

      {/* Breakdown dropdown */}
      {breakdown && isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/30 rounded-b-xl">
          <div className="space-y-2 text-xs">
            {/* Individual items */}
            {breakdown.items && breakdown.items.length > 0 && (
              <div className="space-y-1">
                <span className="font-medium text-stone-500 dark:text-stone-400">Items:</span>
                {breakdown.items.map((breakdownItem, i) => (
                  <div key={i} className="flex justify-between text-stone-600 dark:text-stone-300 pl-2">
                    <span>{breakdownItem.description}</span>
                    <span>${breakdownItem.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Shared items */}
            {breakdown.shared_items && breakdown.shared_items.length > 0 && (
              <div className="space-y-1">
                <span className="font-medium text-stone-500 dark:text-stone-400">Shared:</span>
                {breakdown.shared_items.map((sharedItem, i) => (
                  <div key={i} className="flex justify-between text-stone-600 dark:text-stone-300 pl-2">
                    <span>{sharedItem.description} (split with {sharedItem.split_with.join(', ')})</span>
                    <span>${sharedItem.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Subtotal */}
            <div className="flex justify-between text-stone-600 dark:text-stone-300 pt-1 border-t border-stone-200 dark:border-stone-600">
              <span>Subtotal</span>
              <span>${breakdown.subtotal.toFixed(2)}</span>
            </div>
            
            {/* Tax share */}
            {breakdown.tax_share !== undefined && breakdown.tax_share > 0 && (
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Tax</span>
                <span>${breakdown.tax_share.toFixed(2)}</span>
              </div>
            )}
            
            {/* Fee share */}
            {breakdown.fee_share !== undefined && breakdown.fee_share > 0 && (
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Fees</span>
                <span>${breakdown.fee_share.toFixed(2)}</span>
              </div>
            )}
            
            {/* Tip share */}
            {breakdown.tip_share !== undefined && breakdown.tip_share > 0 && (
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Tip</span>
                <span>${breakdown.tip_share.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
