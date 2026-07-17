# Database Schema Reference

## Tables

### `receipts`

| Column       | Type         | Constraints                    |
|-------------|--------------|--------------------------------|
| `id`        | UUID         | PK, default `gen_random_uuid()` |
| `created_at`| TIMESTAMPTZ  | default `NOW()`                |
| `image_url` | TEXT         | nullable; public URL from Storage |
| `name`      | TEXT         | NOT NULL; restaurant/receipt title |
| `date`      | DATE         | NOT NULL, default `CURRENT_DATE`; format `YYYY-MM-DD` |
| `notes`     | TEXT         | nullable; optional context     |

### `bill_items`

| Column        | Type           | Constraints                         |
|--------------|----------------|-------------------------------------|
| `id`         | UUID           | PK, default `gen_random_uuid()`     |
| `receipt_id` | UUID           | FK -> `receipts(id)` ON DELETE CASCADE |
| `person_name`| TEXT           | NOT NULL                            |
| `amount`     | DECIMAL(10,2)  | NOT NULL; final total the person owes |
| `paid`       | BOOLEAN        | NOT NULL, default `FALSE`           |
| `created_at` | TIMESTAMPTZ    | default `NOW()`                     |
| `breakdown`  | JSONB          | nullable; itemized split details    |

### `public_links`

| Column       | Type        | Constraints                          |
|-------------|-------------|--------------------------------------|
| `id`        | UUID        | PK; used in shareable URL            |
| `receipt_id`| UUID        | FK -> `receipts(id)`, UNIQUE         |
| `created_at`| TIMESTAMPTZ | default `NOW()`                      |

## TypeScript Types

From `lib/types.ts`:

```typescript
interface BillItemBreakdown {
  items: { description: string; amount: number }[]
  subtotal: number
  tax_share?: number
  tip_share?: number
  fee_share?: number
  shared_items?: { description: string; amount: number; split_with: string[] }[]
}
```

### Field semantics

- `items` -- dishes this person ordered alone. Each `amount` is the full menu price.
- `shared_items` -- dishes shared with others. `amount` is the **full menu price** (not per-person). `split_with` lists the **other** people (not this person).
- `subtotal` -- this person's food total (solo items at full price + their share of each shared item).
- `tax_share` -- this person's proportional share of the receipt tax.
- `tip_share` -- this person's proportional share of the tip.
- `fee_share` -- optional; for service fees or surcharges.

## Example: Person with Solo and Shared Items

Jay ordered pot stickers alone ($14.95) and shared three dishes with Dylan.

```json
{
  "items": [
    { "description": "Pork and Vegetable Pot Stickers (5Pcs)", "amount": 14.95 }
  ],
  "shared_items": [
    { "description": "Pork Dumpling w/ Sesame Sauce & Red Chili Oil (8Pcs)", "amount": 12.95, "split_with": ["Dylan"] },
    { "description": "Juicy Pork Bao (6Pcs)", "amount": 15.95, "split_with": ["Dylan"] },
    { "description": "Crab and Pork Xiao Long Bao", "amount": 28.95, "split_with": ["Dylan"] }
  ],
  "subtotal": 43.88,
  "tax_share": 3.79,
  "tip_share": 7.90
}
```

Jay's subtotal: 14.95 + (12.95/2) + (15.95/2) + (28.95/2) = 43.875, rounded to 43.88.
Jay's `amount` in `bill_items`: 43.88 + 3.79 + 7.90 = **55.57**.

## Example: Person with Only Shared Items

Dylan only had shared dishes with Jay -- no solo items.

```json
{
  "items": [],
  "shared_items": [
    { "description": "Pork Dumpling w/ Sesame Sauce & Red Chili Oil (8Pcs)", "amount": 12.95, "split_with": ["Jay"] },
    { "description": "Juicy Pork Bao (6Pcs)", "amount": 15.95, "split_with": ["Jay"] },
    { "description": "Crab and Pork Xiao Long Bao", "amount": 28.95, "split_with": ["Jay"] }
  ],
  "subtotal": 28.93,
  "tax_share": 2.50,
  "tip_share": 5.21
}
```

Dylan's subtotal: (12.95/2) + (15.95/2) + (28.95/2) = 28.925, rounded to 28.93.
Dylan's `amount` in `bill_items`: 28.93 + 2.50 + 5.21 = **36.63** (after rounding adjustment).

## Example: Person with Only Solo Items

Kyle ordered one dish, no sharing.

```json
{
  "items": [
    { "description": "Juicy Pork Bao (6Pcs)", "amount": 15.95 }
  ],
  "shared_items": [],
  "subtotal": 15.95,
  "tax_share": 1.38,
  "tip_share": 2.87
}
```

Kyle's `amount` in `bill_items`: 15.95 + 1.38 + 2.87 = **20.20**.

## Supabase Connection

Credentials are in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SECRET_KEY="sb_secret_xxxxx"
```

Create client:

```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);
```

Image storage bucket: `receipts` (public access, files get a public URL via `getPublicUrl`).
