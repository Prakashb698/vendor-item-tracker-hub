
import { useState } from 'react';
import { ShoppingCart as ShoppingCartIcon, Plus, Minus, X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCartStore } from '@/store/cartStore';
import PaymentButton from './PaymentButton';

interface ShoppingCartProps {
  showLabel?: boolean;
  className?: string;
}

const ShoppingCart = ({ showLabel = false, className }: ShoppingCartProps) => {
  const { items, totalItems, totalValue, updateQuantity, removeItem, clearCart } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);

  const handlePlaceOrder = () => {
    console.log('Placing order:', items);
    alert('Order placed successfully! (This is a demo - order would be sent to backend)');
    clearCart();
    setIsOpen(false);
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className={`relative ${showLabel ? 'w-full justify-start' : ''} ${className || ''}`}>
          <ShoppingCartIcon className="h-4 w-4" />
          {showLabel && <span className="ml-2">View Shopping Cart</span>}
          {totalItems > 0 && (
            <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5" />
            Shopping Cart ({totalItems} items)
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Your cart is empty</p>
                <p className="text-sm text-gray-400">Add items from the inventory</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((cartItem) => (
                  <Card key={cartItem.id} className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{cartItem.inventoryItem.name}</h4>
                          <p className="text-sm text-gray-500">{cartItem.inventoryItem.sku}</p>
                          <Badge variant="secondary" className="mt-1">
                            {cartItem.inventoryItem.category}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(cartItem.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                            disabled={cartItem.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-2 font-medium">{cartItem.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                            disabled={cartItem.quantity >= cartItem.inventoryItem.quantity}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(cartItem.inventoryItem.price * cartItem.quantity).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">${cartItem.inventoryItem.price.toFixed(2)} each</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {items.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-bold text-blue-600">${totalValue.toFixed(2)}</span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="flex-1"
                >
                  Clear Cart
                </Button>
                <PaymentButton 
                  onSuccess={handlePaymentSuccess}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Checkout
                </PaymentButton>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCart;
