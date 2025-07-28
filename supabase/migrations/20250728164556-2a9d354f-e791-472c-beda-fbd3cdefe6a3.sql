-- Create notifications table for real-time alerts
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  category TEXT NOT NULL DEFAULT 'system', -- 'low_stock', 'system', 'inventory'
  item_id UUID NULL, -- Reference to inventory item for low stock alerts
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Create function to check low stock and create notifications
CREATE OR REPLACE FUNCTION public.check_low_stock_and_notify()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for low stock notifications
CREATE TRIGGER trigger_low_stock_notification
  AFTER UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.check_low_stock_and_notify();

-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.notifications 
  SET read = true, updated_at = now()
  WHERE id = notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;

-- Create function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS void AS $$
BEGIN
  UPDATE public.notifications 
  SET read = true, updated_at = now()
  WHERE user_id = auth.uid() AND read = false;
END;
$$ LANGUAGE plpgsql;