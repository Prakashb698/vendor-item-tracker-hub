
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, TrendingUp, DollarSign, BarChart3, PieChart as LucidePieChart, Activity, ShoppingCart, Wallet } from "lucide-react";
import { useUserInventory } from "@/hooks/useUserInventory";
import { usePurchaseQueueStore } from "@/store/purchaseQueueStore";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Cell, Pie } from "recharts";

const Dashboard = () => {
  const { items } = useUserInventory();
  const { totalItems: queueItems, totalValue: queueValue } = usePurchaseQueueStore();

  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.quantity <= item.lowStockThreshold).length;
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const categoriesCount = new Set(items.map(item => item.category)).size;
  
  // Calculate monthly savings (estimate based on bulk purchasing)
  const estimatedMonthlySavings = queueValue * 0.15; // Assuming 15% savings from bulk purchases

  const recentLowStock = items
    .filter(item => item.quantity <= item.lowStockThreshold)
    .slice(0, 5);

  // Analytics calculations
  const categoryData: Record<string, number> = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + (item.quantity * item.price);
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData).map(([name, value], index) => ({
    name,
    value,
    fill: `hsl(${index * 45}, 70%, 60%)`
  }));

  // Mock trend data (in real app, this would come from transaction history)
  const trendData = [
    { month: 'Jan', sales: 4500, inventory: 12000, profit: 1800 },
    { month: 'Feb', sales: 5200, inventory: 11500, profit: 2100 },
    { month: 'Mar', sales: 4800, inventory: 11800, profit: 1950 },
    { month: 'Apr', sales: 6100, inventory: 10900, profit: 2400 },
    { month: 'May', sales: 5800, inventory: 11200, profit: 2200 },
    { month: 'Jun', sales: 6500, inventory: 10500, profit: 2600 }
  ];

  // Inventory turnover calculation
  const averageInventoryValue = totalValue;
  const estimatedMonthlySales = 5500; // Mock value
  const inventoryTurnover = averageInventoryValue > 0 ? (estimatedMonthlySales * 12) / averageInventoryValue : 0;
  
  // Profit margin calculation
  const averageMargin = items.length > 0 ? 
    items.reduce((sum, item) => sum + (item.price * 0.35), 0) / items.length : 0; // Assuming 35% margin

  const chartConfig = {
    sales: { label: "Sales", color: "hsl(var(--chart-1))" },
    inventory: { label: "Inventory", color: "hsl(var(--chart-2))" },
    profit: { label: "Profit", color: "hsl(var(--chart-3))" }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your inventory and business metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Queue Items</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{queueItems}</div>
            <p className="text-xs text-gray-500">Items in purchase queue</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{lowStockItems}</div>
            <p className="text-xs text-gray-500">Items need restocking</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Queue Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${queueValue.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Purchase queue value</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Savings</CardTitle>
            <Wallet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${estimatedMonthlySavings.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Estimated bulk savings</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales & Profit Trends */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Sales & Profit Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="sales" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  <Line type="monotone" dataKey="profit" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <LucidePieChart className="h-5 w-5 text-purple-600" />
              Category Value Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Key Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Inventory Turnover</span>
              <span className="text-lg font-bold text-gray-900">{inventoryTurnover.toFixed(1)}x</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg. Profit Margin</span>
              <span className="text-lg font-bold text-gray-900">${averageMargin.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Monthly Sales Est.</span>
              <span className="text-lg font-bold text-gray-900">${estimatedMonthlySales.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low Stock Alert</span>
              <span className="text-lg font-bold text-red-600">{lowStockItems} items</span>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Performance */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Inventory Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(categoryData).slice(0, 4).map(([name, value]) => ({ name, value }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <LucidePieChart className="h-5 w-5 text-purple-600" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryData)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([category, value]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate">{category}</span>
                  <span className="text-sm font-medium text-gray-900">${(value as number).toFixed(0)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
