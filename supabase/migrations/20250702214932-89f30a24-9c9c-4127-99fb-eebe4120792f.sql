
-- Create transactions table to track all inventory movements
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT NOT NULL, -- References inventory item ID
  transaction_type TEXT NOT NULL, -- 'stock_in', 'stock_out', 'adjustment', 'sale', 'purchase'
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2),
  total_value DECIMAL(10,2),
  reference_number TEXT, -- PO number, invoice number, etc.
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transactions
CREATE POLICY "Users can view all transactions" ON public.transactions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert transactions" ON public.transactions
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_transactions_item_id ON public.transactions(item_id);
CREATE INDEX idx_transactions_type ON public.transactions(transaction_type);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON public.transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
