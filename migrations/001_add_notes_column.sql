-- Migration: Add separate notes column to receipts
-- The existing 'notes' column is actually used as the receipt name/title
-- This migration renames it and adds a proper notes column

-- Step 1: Rename the existing 'notes' column to 'name'
ALTER TABLE receipts RENAME COLUMN notes TO name;

-- Step 2: Add a new 'notes' column for actual notes (nullable)
ALTER TABLE receipts ADD COLUMN notes TEXT;

-- Step 3: Add a comment for clarity
COMMENT ON COLUMN receipts.name IS 'The title/name of the receipt (e.g., "Dinner at Joe''s Pizza")';
COMMENT ON COLUMN receipts.notes IS 'Optional additional notes or comments about the receipt';

