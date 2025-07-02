
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

const SubscriptionManager = () => {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      name: "Basic",
      price: "$9.99",
      description: "Perfect for small businesses",
      features: [
        "Up to 100 products",
        "Basic inventory tracking",
        "Standard reports",
        "Email support"
      ],
      icon: Zap,
      popular: false
    },
    {
      name: "Premium",
      price: "$29.99",
      description: "Ideal for growing businesses",
      features: [
        "Up to 1,000 products",
        "Advanced inventory tracking",
        "Custom reports & analytics",
        "Priority support",
        "Low stock alerts",
        "Barcode scanning"
      ],
      icon: Crown,
      popular: true
    },
    {
      name: "Enterprise",
      price: "$79.99",
      description: "For large businesses",
      features: [
        "Unlimited products",
        "Advanced inventory management",
        "Custom dashboards",
        "24/7 support",
        "Real-time alerts",
        "API access",
        "Multi-location support"
      ],
      icon: Star,
      popular: false
    }
  ];

  const checkSubscription = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { userEmail: user.email }
      });
      if (error) throw error;
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { mode: 'subscription', tier, userEmail: user.email }
      });
      if (error) throw error;
      
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: { userEmail: user.email }
      });
      if (error) throw error;
      
      // Open Stripe customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Please log in to view subscription options</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {subscriptionData && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Your current plan and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Status: {subscriptionData.subscribed ? (
                    <Badge className="ml-2 bg-green-600">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="ml-2">No Active Subscription</Badge>
                  )}
                </p>
                {subscriptionData.subscription_tier && (
                  <p className="text-sm text-gray-600 mt-1">
                    Plan: {subscriptionData.subscription_tier}
                  </p>
                )}
                {subscriptionData.subscription_end && (
                  <p className="text-sm text-gray-600">
                    Renews: {new Date(subscriptionData.subscription_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={checkSubscription} disabled={loading}>
                  Refresh Status
                </Button>
                {subscriptionData.subscribed && (
                  <Button onClick={handleManageSubscription} disabled={loading}>
                    Manage Subscription
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <Card 
            key={index} 
            className={`relative ${
              plan.popular ? 'border-blue-500 border-2 shadow-lg' : 'border-gray-200'
            } ${
              subscriptionData?.subscription_tier === plan.name ? 'bg-green-50 border-green-500' : ''
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Most Popular
              </Badge>
            )}
            {subscriptionData?.subscription_tier === plan.name && (
              <Badge className="absolute -top-3 right-4 bg-green-600">
                Your Plan
              </Badge>
            )}
            
            <CardHeader className="text-center pb-6">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                <plan.icon className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-gray-600 mb-4">
                {plan.description}
              </CardDescription>
              <div className="flex items-baseline justify-center">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600 ml-1">/month</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Features:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                className={`w-full ${
                  plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''
                } ${
                  subscriptionData?.subscription_tier === plan.name ? 'bg-green-600 hover:bg-green-700' : ''
                }`}
                onClick={() => handleSubscribe(plan.name)}
                disabled={loading || subscriptionData?.subscription_tier === plan.name}
              >
                {subscriptionData?.subscription_tier === plan.name 
                  ? 'Current Plan' 
                  : `Subscribe to ${plan.name}`
                }
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionManager;
