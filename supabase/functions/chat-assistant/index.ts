
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, inventory } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create inventory context for the AI
    const inventoryContext = inventory.map((item: any) => 
      `${item.name} - ${item.description} (Category: ${item.category}, Price: $${item.price}, Quantity: ${item.quantity}, SKU: ${item.sku})`
    ).join('\n');

    const systemPrompt = `You are an intelligent inventory assistant for a business. Your job is to help customers find items in their inventory based on their queries.

Current Inventory:
${inventoryContext}

Instructions:
- Help users find items based on names, categories, descriptions, or any other criteria
- Provide specific item details when found (name, price, quantity, location if available)
- If items are low in stock, mention it
- Be helpful and conversational
- If no exact matches, suggest similar items or alternatives
- You can search by category, price range, availability, or any other criteria
- Format responses clearly and highlight important information like prices and availability
- If asked about stock levels, be specific about quantities

Always be helpful, friendly, and provide actionable information.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
