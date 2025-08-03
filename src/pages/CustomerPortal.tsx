
import { Package, ShoppingCart, FileText, CreditCard, User, Bell, TrendingUp, BarChart3, AlertTriangle, DollarSign, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useInventoryStore } from "@/store/inventoryStore";
import { usePurchaseQueueStore } from '@/store/purchaseQueueStore';
import { useNavigate } from 'react-router-dom';
import PurchaseQueueComponent from '@/components/PurchaseQueue';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useRef } from 'react';

const CustomerPortal = () => {
  const { user, profile } = useAuth();
  const { items } = useInventoryStore();
  const { totalItems, totalValue } = usePurchaseQueueStore();
  const navigate = useNavigate();
  const purchaseQueueRef = useRef<{ open: () => void }>(null);

  const lowStockItems = items.filter(item => item.quantity <= item.lowStockThreshold).length;
  const estimatedMonthlySavings = totalValue * 0.15; // Assuming 15% savings from bulk purchases

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'inventory':
        navigate('/inventory');
        break;
      case 'queue':
        // The PurchaseQueue component will handle its own opening state
        // We just need to render it normally and let it handle the trigger
        console.log('Queue action triggered - PurchaseQueue component will handle display');
        break;
      case 'reports':
        navigate('/reports');
        break;
      case 'pricing':
        navigate('/pricing');
        break;
      default:
        console.log(`Action ${action} not implemented yet`);
    }
  };

  const handleStatClick = (statType: string) => {
    switch (statType) {
      case 'queue-items':
      case 'queue-value':
        // Open purchase queue modal
        purchaseQueueRef.current?.open();
        break;
      case 'low-stock':
        // Navigate to inventory with low stock filter
        navigate('/inventory');
        break;
      case 'savings':
        navigate('/reports');
        break;
    }
  };

  const customerStats = [
    {
      title: 'Queue Items',
      value: totalItems.toString(),
      description: 'Items in purchase queue',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      action: 'queue-items',
    },
    {
      title: 'Low Stock Alert',
      value: lowStockItems.toString(),
      description: 'Items need restocking',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      action: 'low-stock',
    },
    {
      title: 'Queue Value',
      value: `$${totalValue.toFixed(2)}`,
      description: 'Purchase queue value',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      action: 'queue-value',
    },
    {
      title: 'Monthly Savings',
      value: `$${estimatedMonthlySavings.toFixed(2)}`,
      description: 'Estimated bulk savings',
      icon: Wallet,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      action: 'savings',
    },
  ];

  // Analytics data for customer insights
  const purchaseAnalytics = [
    { month: 'Jan', purchases: 1200, queueSize: 15, savings: 240 },
    { month: 'Feb', purchases: 1450, queueSize: 18, savings: 290 },
    { month: 'Mar', purchases: 1380, queueSize: 22, savings: 276 },
    { month: 'Apr', purchases: 1650, queueSize: 20, savings: 330 },
    { month: 'May', purchases: 1520, queueSize: 25, savings: 304 },
    { month: 'Jun', purchases: 1780, queueSize: 28, savings: 356 }
  ];

  const categoryData = [
    { name: 'Electronics', value: 4500, trend: '+12%' },
    { name: 'Office Supplies', value: 3200, trend: '+8%' },
    { name: 'Furniture', value: 2800, trend: '+5%' },
    { name: 'Software', value: 1900, trend: '+15%' }
  ];

  const chartConfig = {
    purchases: { label: "Purchases", color: "hsl(var(--chart-1))" },
    queueSize: { label: "Queue Size", color: "hsl(var(--chart-2))" },
    savings: { label: "Savings", color: "hsl(var(--chart-3))" }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
           <p className="text-gray-600">Welcome back, {profile?.display_name || user?.email?.split('@')[0] || 'User'}</p>
           <p className="text-sm text-gray-500">{profile?.business_name || 'My Business'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline" size="sm">
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
          {/* Add Purchase Queue Button in Header */}
          <PurchaseQueueComponent ref={purchaseQueueRef} />
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {customerStats.map((stat, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => handleStatClick(stat.action)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center transition-transform hover:scale-110 duration-200`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customer Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleQuickAction('inventory')}
            >
              <Package className="h-4 w-4 mr-2" />
              View Inventory
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => purchaseQueueRef.current?.open()}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Purchase Queue
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleQuickAction('reports')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleQuickAction('pricing')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Billing & Payments
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Purchase Analytics
            </CardTitle>
            <CardDescription>
              Track your purchasing trends and savings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={purchaseAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="purchases" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  <Line type="monotone" dataKey="savings" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Queue Performance
            </CardTitle>
            <CardDescription>
              Monthly queue usage and efficiency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={purchaseAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="queueSize" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Key Insights
            </CardTitle>
            <CardDescription>
              Your performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div>
                <p className="font-medium text-gray-900">Total Savings</p>
                <p className="text-sm text-gray-600">This year</p>
              </div>
              <span className="text-2xl font-bold text-blue-600">$1,796</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div>
                <p className="font-medium text-gray-900">Avg. Queue Size</p>
                <p className="text-sm text-gray-600">Last 6 months</p>
              </div>
              <span className="text-2xl font-bold text-green-600">21</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div>
                <p className="font-medium text-gray-900">Purchase Growth</p>
                <p className="text-sm text-gray-600">Month over month</p>
              </div>
              <span className="text-2xl font-bold text-purple-600">+17%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Category Performance
          </CardTitle>
          <CardDescription>
            Your top spending categories and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{category.name}</p>
                  <p className="text-sm text-gray-600">${category.value.toLocaleString()} spent</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-600">{category.trend}</span>
                  <p className="text-xs text-gray-500">vs last month</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerPortal;
