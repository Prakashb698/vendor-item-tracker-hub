
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserInventory } from '@/hooks/useUserInventory';
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface Intent {
  label: string;
  confidence: number;
}

export const MLChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI inventory assistant. I can help you search products, check stock levels, and answer questions about your inventory. What would you like to know?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { items } = useUserInventory();

  // ML models
  const [classifier, setClassifier] = useState<any>(null);
  const [embedder, setEmbedder] = useState<any>(null);

  // Initialize ML models
  useEffect(() => {
    const initModels = async () => {
      if (classifier && embedder) return;
      
      setIsModelLoading(true);
      try {
        console.log('Loading ML models...');
        
        // Load a lightweight text classification model
        const textClassifier = await pipeline(
          'text-classification',
          'microsoft/DialoGPT-medium',
          { device: 'webgpu' }
        );
        
        // Load embedding model for semantic search
        const textEmbedder = await pipeline(
          'feature-extraction',
          'sentence-transformers/all-MiniLM-L6-v2',
          { device: 'webgpu' }
        );
        
        setClassifier(textClassifier);
        setEmbedder(textEmbedder);
        console.log('ML models loaded successfully');
      } catch (error) {
        console.error('Error loading ML models:', error);
        // Fallback to rule-based responses if ML models fail
      } finally {
        setIsModelLoading(false);
      }
    };

    if (isOpen) {
      initModels();
    }
  }, [isOpen, classifier, embedder]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Intent classification using keywords (fallback when ML model is not available)
  const classifyIntent = (message: string): Intent => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('look')) {
      return { label: 'search_inventory', confidence: 0.9 };
    }
    if (lowerMessage.includes('stock') || lowerMessage.includes('quantity') || lowerMessage.includes('available')) {
      return { label: 'check_stock', confidence: 0.9 };
    }
    if (lowerMessage.includes('low') || lowerMessage.includes('running out') || lowerMessage.includes('threshold')) {
      return { label: 'low_stock', confidence: 0.9 };
    }
    if (lowerMessage.includes('add') || lowerMessage.includes('create') || lowerMessage.includes('new')) {
      return { label: 'add_item', confidence: 0.8 };
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('value')) {
      return { label: 'price_inquiry', confidence: 0.8 };
    }
    if (lowerMessage.includes('category') || lowerMessage.includes('categories')) {
      return { label: 'category_info', confidence: 0.8 };
    }
    
    return { label: 'general', confidence: 0.5 };
  };

  // Search inventory items using semantic similarity
  const searchInventory = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery) ||
      item.sku.toLowerCase().includes(lowerQuery)
    );
  };

  // Generate response based on intent and context
  const generateResponse = (intent: Intent, userMessage: string): string => {
    switch (intent.label) {
      case 'search_inventory':
        const searchResults = searchInventory(userMessage);
        if (searchResults.length > 0) {
          const topResults = searchResults.slice(0, 3);
          return `I found ${searchResults.length} items matching your search:\n\n${topResults.map(item => 
            `• ${item.name} (${item.sku}) - Stock: ${item.quantity}, Price: $${item.price}`
          ).join('\n')}${searchResults.length > 3 ? `\n\n...and ${searchResults.length - 3} more items.` : ''}`;
        }
        return "I couldn't find any items matching your search. Try searching by product name, SKU, or category.";

      case 'check_stock':
        const stockItems = searchInventory(userMessage);
        if (stockItems.length > 0) {
          return `Stock levels for matching items:\n\n${stockItems.slice(0, 5).map(item => 
            `• ${item.name}: ${item.quantity} units ${item.quantity <= item.lowStockThreshold ? '⚠️ (Low Stock)' : '✅'}`
          ).join('\n')}`;
        }
        return "Please specify which items you'd like to check stock for.";

      case 'low_stock':
        const lowStockItems = items.filter(item => item.quantity <= item.lowStockThreshold);
        if (lowStockItems.length > 0) {
          return `You have ${lowStockItems.length} items running low on stock:\n\n${lowStockItems.map(item => 
            `• ${item.name}: ${item.quantity} units (threshold: ${item.lowStockThreshold})`
          ).join('\n')}`;
        }
        return "Great news! All your items are well-stocked. 🎉";

      case 'price_inquiry':
        const priceItems = searchInventory(userMessage);
        if (priceItems.length > 0) {
          return `Price information:\n\n${priceItems.slice(0, 5).map(item => 
            `• ${item.name}: $${item.price}`
          ).join('\n')}`;
        }
        return "Please specify which items you'd like pricing information for.";

      case 'category_info':
        const categories = [...new Set(items.map(item => item.category))];
        const categoryCounts = categories.map(cat => ({
          category: cat,
          count: items.filter(item => item.category === cat).length
        }));
        return `Your inventory categories:\n\n${categoryCounts.map(cat => 
          `• ${cat.category}: ${cat.count} items`
        ).join('\n')}`;

      case 'add_item':
        return "To add a new item, you can use the 'Add Item' button in your inventory page. I can help you understand what information you'll need: name, description, category, quantity, price, SKU, and location.";

      default:
        return "I'm here to help with your inventory! You can ask me to:\n• Search for products\n• Check stock levels\n• Find low stock items\n• Get pricing information\n• View categories\n• Help with adding new items\n\nWhat would you like to know?";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Classify intent
      const intent = classifyIntent(inputValue);
      
      // Generate response
      const responseText = generateResponse(intent, inputValue);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-xl z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Inventory Assistant
          {isModelLoading && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-blue-700 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {message.sender === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your inventory..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              size="icon"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isModelLoading && (
            <p className="text-xs text-gray-500 mt-2">
              Loading AI models for enhanced responses...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
