-- Re-enable RLS on critical tables that were disabled
ALTER TABLE public.business_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Ensure proper RLS policies exist for business_locations
DROP POLICY IF EXISTS "Users can view their own locations" ON public.business_locations;
DROP POLICY IF EXISTS "Users can create their own locations" ON public.business_locations;
DROP POLICY IF EXISTS "Users can update their own locations" ON public.business_locations;
DROP POLICY IF EXISTS "Users can delete their own locations" ON public.business_locations;

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

-- Ensure proper RLS policies exist for inventory_items
DROP POLICY IF EXISTS "Users can view their own inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can create their own inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can update their own inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can delete their own inventory" ON public.inventory_items;

CREATE POLICY "Users can view their own inventory" 
ON public.inventory_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inventory" 
ON public.inventory_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory" 
ON public.inventory_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory" 
ON public.inventory_items 
FOR DELETE 
USING (auth.uid() = user_id);