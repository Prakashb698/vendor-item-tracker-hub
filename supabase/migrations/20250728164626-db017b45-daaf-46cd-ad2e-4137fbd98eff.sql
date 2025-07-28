-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.check_low_stock_and_notify()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if quantity dropped below threshold
  IF NEW.quantity <= NEW.low_stock_threshold AND (OLD.quantity IS NULL OR OLD.quantity > NEW.low_stock_threshold) THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      category,
      item_id
    ) VALUES (
      NEW.user_id,
      'Low Stock Alert',
      'Item "' || NEW.name || '" is running low. Current stock: ' || NEW.quantity || ', Threshold: ' || NEW.low_stock_threshold,
      'warning',
      'low_stock',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix mark_notification_read function
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notifications 
  SET read = true, updated_at = now()
  WHERE id = notification_id AND user_id = auth.uid();
END;
$$;

-- Fix mark_all_notifications_read function
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notifications 
  SET read = true, updated_at = now()
  WHERE user_id = auth.uid() AND read = false;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;