// Shared types for Receipt Split application

export interface BillItem {
  id: string
  person_name: string
  amount: number
  paid: boolean
}

export interface PublicLink {
  id: string
}

export interface Receipt {
  id: string
  name: string | null
  date: string
  image_url: string | null
  notes: string | null
  bill_items?: BillItem[]
  public_links?: PublicLink[]
}

// Type for creating a new receipt
export interface CreateReceiptInput {
  name: string
  date: string
  image_url?: string | null
  notes?: string
}

// Type for bulk adding bill items
export interface BulkBillItemInput {
  name: string
  amount: number
}

