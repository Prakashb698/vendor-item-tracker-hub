
-- Add barcode and vendor columns to inventory_items table
ALTER TABLE public.inventory_items 
ADD COLUMN IF NOT EXISTS vendor TEXT,
ADD COLUMN IF NOT EXISTS barcode_number TEXT;

-- Create an index on barcode_number for faster scanning lookups
CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode 
ON public.inventory_items(barcode_number) 
WHERE barcode_number IS NOT NULL;
