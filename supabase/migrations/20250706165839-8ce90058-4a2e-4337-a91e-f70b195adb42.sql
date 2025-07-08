
-- Add barcode column to inventory_items table
ALTER TABLE public.inventory_items 
ADD COLUMN barcode TEXT;

-- Create unique index on barcode to ensure uniqueness (excluding null values)
CREATE UNIQUE INDEX idx_inventory_items_barcode_unique 
ON public.inventory_items (barcode) 
WHERE barcode IS NOT NULL;

-- Add comment to explain the barcode field
COMMENT ON COLUMN public.inventory_items.barcode IS 'Unique barcode identifier for the item, scanned by Zebra scanner';
