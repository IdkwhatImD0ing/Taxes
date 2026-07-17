-- Add breakdown column to bill_items for storing itemized cost breakdown
-- This column stores the detailed breakdown of how each person's total was calculated
-- Backwards compatible: existing rows will have NULL breakdown

ALTER TABLE bill_items ADD COLUMN breakdown JSONB;

-- Add a comment explaining the expected structure
COMMENT ON COLUMN bill_items.breakdown IS 'JSON breakdown of the bill item: {items: [{description, amount}], subtotal, tax_share?, tip_share?, shared_items?: [{description, amount, split_with}]}';
