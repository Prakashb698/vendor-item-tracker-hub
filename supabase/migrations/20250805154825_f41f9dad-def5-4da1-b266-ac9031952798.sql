-- Create business_locations table for managing different branches/locations
CREATE TABLE public.business_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  address text,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on business_locations
ALTER TABLE public.business_locations ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_locations
CREATE POLICY "Users can view their own locations" 
ON public.business_locations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own locations" 
ON public.business_locations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locations" 
ON public.business_locations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locations" 
ON public.business_locations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add location_id to inventory_items table
ALTER TABLE public.inventory_items 
ADD COLUMN location_id uuid REFERENCES public.business_locations(id);

-- Create inventory_transfers table for tracking item movements between locations
CREATE TABLE public.inventory_transfers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  item_id uuid NOT NULL,
  from_location_id uuid REFERENCES public.business_locations(id),
  to_location_id uuid NOT NULL REFERENCES public.business_locations(id),
  quantity integer NOT NULL,
  reason text,
  transferred_by text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on inventory_transfers
ALTER TABLE public.inventory_transfers ENABLE ROW LEVEL SECURITY;

-- RLS policies for inventory_transfers
CREATE POLICY "Users can view their own transfers" 
ON public.inventory_transfers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transfers" 
ON public.inventory_transfers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add updated_at trigger for business_locations
CREATE TRIGGER update_business_locations_updated_at
BEFORE UPDATE ON public.business_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();