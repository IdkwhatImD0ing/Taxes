---
name: adding-receipts
description: >
  Use this skill when the user wants to add a receipt, split a bill among
  friends, or divide restaurant costs. Applies when the user provides a
  receipt image and describes who ordered what, mentions shared dishes, asks
  to calculate each person's share of tax and tip, or wants to record a
  group meal. Also use when the user describes a dinner, lunch, or meal
  outing with others -- even if they don't explicitly say "receipt" or
  "split."
---

# Adding Receipts

Split a restaurant bill among multiple people with itemized breakdowns, proportional tax/tip, and insert the result into the app's Supabase database.

## Workflow

Copy this checklist and track progress:

```
Progress:
- [ ] Step 1: Read receipt and gather item assignments
- [ ] Step 2: Verify all items assigned (plan-validate)
- [ ] Step 3: Calculate splits (tax, tip, rounding)
- [ ] Step 4: Insert receipt + bill items into Supabase
- [ ] Step 5: Validate totals match receipt
- [ ] Step 6: Present summary to user
```

## Step 1: Information Gathering

### From the receipt image

Extract:
- Restaurant name and address
- Date
- Every line item with quantity, description, and price
- Subtotal, tax, total
- Suggested tip amounts (if shown)

### From the user

Ask for:
1. **Who was there** -- list of names
2. **Who ordered what** -- which items each person had
3. **Shared items** -- which items were split, and between whom
4. **Tip** -- amount or percentage (and whether it's on pre-tax subtotal or total)

If the user says "Me" for themselves, use `"Me"` as the `person_name`.

## Step 2: Verify All Items Assigned

Before any calculation, build a verification table mapping every receipt line item to its assigned person(s). Present it to the user:

```
| # | Receipt Item           | Price  | Assigned To          |
|---|------------------------|--------|----------------------|
| 1 | Juicy Pork Bao (6Pcs)  | $15.95 | Jay + Dylan (shared) |
| 2 | Pot Stickers (5Pcs)    | $14.95 | Jay                  |
| ...                                                        |
```

**Every item must be assigned.** If any item is unaccounted for, ask the user before proceeding. Do not guess.

## Step 3: Calculate Splits

### Personal items

Each person's solo items sum to their food subtotal.

### Shared items

For an item with price P shared among N people: each person's share = P / N.

Store the **full price** in the breakdown's `shared_items[].amount` field (not the split portion). The `split_with` array lists the **other** people sharing (not the current person).

### Tax (proportional)

```
person_tax = (person_food_subtotal / receipt_subtotal) * receipt_tax
```

### Tip (proportional)

```
person_tip = (person_food_subtotal / receipt_subtotal) * tip_amount
```

Tip is usually calculated on the pre-tax subtotal. Confirm with the user if unclear.

### Rounding

1. Round each person's total to 2 decimal places using `parseFloat(value.toFixed(2))`
2. Sum all rounded totals
3. If the sum differs from the expected grand total, adjust the person with the largest share by the difference (typically +/- $0.01)

## Step 4: Insert into Supabase

Generate and run a Node.js script that uses `@supabase/supabase-js` (already installed in the project). Read credentials from `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

The script should:

1. **Upload the receipt image** to Storage bucket `receipts`:

```javascript
const imageBuffer = fs.readFileSync(imagePath);
const fileName = 'restaurant-name-' + Date.now() + '.png';
await supabase.storage.from('receipts').upload(fileName, imageBuffer, {
  contentType: 'image/png', upsert: false
});
const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
```

2. **Insert the receipt** record:

```javascript
const { data: receipt } = await supabase
  .from('receipts')
  .insert({
    name: 'Restaurant Name',
    date: '2026-03-10',       // YYYY-MM-DD from receipt
    image_url: urlData.publicUrl,
    notes: 'Optional context'  // e.g. who was there, occasion
  })
  .select().single();
```

3. **Insert bill_items** with breakdowns:

```javascript
const billItems = [
  {
    receipt_id: receipt.id,
    person_name: 'PersonName',
    amount: 55.57,             // final total (food + tax + tip)
    breakdown: {
      items: [
        { description: 'Pot Stickers (5Pcs)', amount: 14.95 }
      ],
      shared_items: [
        { description: 'Juicy Pork Bao (6Pcs)', amount: 15.95,
          split_with: ['OtherPerson'] }
      ],
      subtotal: 43.88,
      tax_share: 3.79,
      tip_share: 7.90
    }
  },
  // ... one entry per person
];
await supabase.from('bill_items').insert(billItems);
```

For full schema details and field types, see [references/schema.md](references/schema.md).

## Step 5: Validate Totals

After insertion, query back all bill_items and verify:

```javascript
const { data: items } = await supabase
  .from('bill_items')
  .select('person_name, amount')
  .eq('receipt_id', receipt.id);

let sum = 0;
items.forEach(i => { sum += parseFloat(i.amount); });
console.log('Total: $' + sum.toFixed(2));
```

Compare the sum to the expected grand total (subtotal + tax + tip). If off by more than $0.01, update the person with the largest share to reconcile. Only proceed once validated.

## Step 6: Present Summary

Show the user a table with the final split:

```
| Person  | Food    | Tax   | Tip   | Total     |
|---------|---------|-------|-------|-----------|
| Jay     | $43.88  | $3.79 | $7.90 | **$55.57**|
| Dylan   | $28.93  | $2.50 | $5.21 | **$36.63**|
| Kyle    | $15.95  | $1.38 | $2.87 | **$20.20**|
| Me      | $48.85  | $4.22 | $8.79 | **$61.86**|
|         |         |       | Total | **$174.26**|
```

Include a breakdown summary noting who shared what with whom.

## Gotchas

- **Floating point arithmetic**: `43.875 + 3.79` in JavaScript may produce `47.664999...` not `47.665`. Always wrap final amounts with `parseFloat((...).toFixed(2))`.
- **Env var name**: The key is `SUPABASE_SECRET_KEY`, not `SUPABASE_SERVICE_ROLE_KEY`.
- **Storage bucket**: Named `receipts` (lowercase, no prefix).
- **`shared_items` semantics**: The `amount` field stores the **full item price**, not the per-person split. The `split_with` array lists the **other** people (not the current person).
- **Tip base**: Restaurant tip suggestions are usually on the pre-tax subtotal. Confirm with the user what base they tipped on before calculating.
- **"Me" convention**: The app owner uses `"Me"` as their `person_name` in bill_items.
- **Date format**: Supabase expects `YYYY-MM-DD` for the date column.
- **Image path**: If the user provides an image, it will be saved to the workspace assets. Use `fs.readFileSync()` with the full path to read it for upload.
