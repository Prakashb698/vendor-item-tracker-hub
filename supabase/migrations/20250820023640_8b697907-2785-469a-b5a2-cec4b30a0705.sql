-- Tighten subscribers RLS to prevent email-based data exposure

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Remove permissive/unsafe policies
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Allow authenticated users to read ONLY their own row by user_id
CREATE POLICY "Users can view their own subscription by user_id"
ON public.subscribers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Do not create INSERT/UPDATE policies so clients cannot write.
-- Edge functions use the service role key and bypass RLS for safe writes.