
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
    console.log('Chat assistant function called');
    
    const { message, inventory } = await req.json();
    console.log('Received message:', message);
    console.log('Inventory items count:', inventory?.length || 0);

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    if (!message) {
      throw new Error('Message is required');
    }

    // Create inventory context for the AI
    const inventoryContext = inventory && inventory.length > 0 
      ? inventory.map((item: any) => 
          `${item.name} - ${item.description || 'No description'} (Category: ${item.category}, Price: $${item.price}, Quantity: ${item.quantity}, SKU: ${item.sku})`
        ).join('\n')
      : 'No inventory items available';

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
- Keep responses concise but informative
- Always be helpful, friendly, and provide actionable information`;

    console.log('Making OpenAI API call');
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

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
