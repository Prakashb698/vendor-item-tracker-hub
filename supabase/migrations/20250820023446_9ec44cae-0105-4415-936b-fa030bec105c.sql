-- Secure transactions table: restrict data visibility and ensure inserts are attributed to the current user

-- Ensure RLS is enabled (safe if already enabled)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 1) Trigger to automatically set user_id on insert if not provided
CREATE OR REPLACE FUNCTION public.set_transactions_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_transactions_user_id_trigger ON public.transactions;
CREATE TRIGGER set_transactions_user_id_trigger
BEFORE INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.set_transactions_user_id();

-- 2) Replace overly-permissive policies with least-privilege ones
DROP POLICY IF EXISTS "Users can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
CREATE POLICY "Users can insert their own transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());