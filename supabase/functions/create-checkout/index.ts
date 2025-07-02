
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { priceId, mode = "subscription", tier = "Basic", userEmail } = await req.json();
    
    if (!userEmail) {
      throw new Error("User email is required");
    }
    
    logStep("User email provided", { email: userEmail });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });
    
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }
    logStep("Customer lookup", { customerId });

    // Create different checkout sessions based on mode
    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-cancelled`,
      mode,
    };

    if (mode === "subscription") {
      // Subscription checkout
      sessionConfig.line_items = [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `${tier} Subscription`,
              description: `${tier} tier subscription plan`
            },
            unit_amount: tier === "Basic" ? 999 : tier === "Premium" ? 2999 : 7999, // $9.99, $29.99, $79.99
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ];
    } else {
      // One-time payment checkout
      sessionConfig.line_items = [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: "One-time Purchase",
              description: "Single payment for products"
            },
            unit_amount: priceId || 4999, // Default $49.99 or custom amount
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
