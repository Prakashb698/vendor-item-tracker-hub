
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCartStore } from '@/store/cartStore';
import { toast } from '@/hooks/use-toast';

interface PaymentButtonProps {
  amount?: number;
  items?: any[];
  onSuccess?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const PaymentButton = ({ 
  amount, 
  items, 
  onSuccess, 
  className = "",
  children 
}: PaymentButtonProps) => {
  const { user } = useAuth();
  const { items: cartItems, totalValue, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a purchase",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const paymentAmount = amount || Math.round(totalValue * 100); // Convert to cents
      const paymentItems = items || cartItems.map(item => ({
        id: item.inventoryItem.id,
        name: item.inventoryItem.name,
        quantity: item.quantity,
        price: item.inventoryItem.price
      }));

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          amount: paymentAmount,
          items: paymentItems
        }
      });
      
      if (error) throw error;
      
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Redirecting to payment",
        description: "Please complete your payment in the new tab"
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Payment Error",
        description: "Failed to create payment session",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={loading || !user}
      className={className}
    >
      <CreditCard className="h-4 w-4 mr-2" />
      {children || `Pay ${amount ? `$${(amount / 100).toFixed(2)}` : `$${totalValue.toFixed(2)}`}`}
    </Button>
  );
};

export default PaymentButton;
