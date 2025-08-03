
import { Users, Package, BarChart3, Settings, Shield, Activity, TrendingUp, PieChart as LucidePieChart, ShoppingCart, Wallet, AlertTriangle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useInventoryStore } from "@/store/inventoryStore";
import { usePurchaseQueueStore } from "@/store/purchaseQueueStore";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Cell, Pie } from "recharts";

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const { items } = useInventoryStore();
  const { totalItems: queueItems, totalValue: queueValue } = usePurchaseQueueStore();

  const lowStockItems = items.filter(item => item.quantity <= item.lowStockThreshold).length;
  const estimatedMonthlySavings = queueValue * 0.15; // Assuming 15% savings from bulk purchases

  const adminStats = [
    {
      title: 'Queue Items',
      value: queueItems.toString(),
      change: 'Items in queue',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Low Stock Alert',
      value: lowStockItems.toString(),
      change: 'Need restocking',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Queue Value',
      value: `$${queueValue.toFixed(2)}`,
      change: 'Purchase queue value',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Monthly Savings',
      value: `$${estimatedMonthlySavings.toFixed(2)}`,
      change: 'Estimated bulk savings',
      icon: Wallet,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  // Analytics data for charts
  const analyticsData = [
    { month: 'Jan', users: 950, revenue: 38000, businesses: 720 },
    { month: 'Feb', users: 1050, revenue: 42000, businesses: 780 },
    { month: 'Mar', users: 1150, revenue: 45000, businesses: 820 },
    { month: 'Apr', users: 1200, revenue: 44000, businesses: 840 },
    { month: 'May', users: 1220, revenue: 46000, businesses: 850 },
    { month: 'Jun', users: 1234, revenue: 45678, businesses: 856 }
  ];

  const platformData = [
    { name: 'Web App', value: 45, fill: 'hsl(220, 70%, 60%)' },
    { name: 'Mobile', value: 30, fill: 'hsl(160, 70%, 60%)' },
    { name: 'API', value: 25, fill: 'hsl(290, 70%, 60%)' }
  ];

  const chartConfig = {
    users: { label: "Users", color: "hsl(var(--chart-1))" },
    revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
    businesses: { label: "Businesses", color: "hsl(var(--chart-3))" }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {profile?.display_name || user?.email?.split('@')[0] || 'Admin'}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Shield className="h-4 w-4" />
          <span>Administrator Access</span>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Growth Analytics
            </CardTitle>
            <CardDescription>
              Track user growth, revenue, and business registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  <Line type="monotone" dataKey="businesses" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Platform Usage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LucidePieChart className="h-5 w-5" />
              Platform Usage Distribution
            </CardTitle>
            <CardDescription>
              How users access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
