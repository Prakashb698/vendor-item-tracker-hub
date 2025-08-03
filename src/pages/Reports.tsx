import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { FileText, Download, TrendingUp, TrendingDown, Package, AlertTriangle, Calendar, DollarSign, BarChart3 } from "lucide-react";
import { useUserInventory } from "@/hooks/useUserInventory";
import { toast } from "@/hooks/use-toast";

const Reports = () => {
  const { items } = useUserInventory();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [reportGenerated, setReportGenerated] = useState(false);

  // Generate mock data for demonstration - in a real app, this would come from your database
  const generateReportData = () => {
    const currentDate = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    
    if (selectedPeriod === "monthly") {
      return months.map((month, index) => ({
        period: month,
        stockValue: Math.floor(Math.random() * 50000) + 20000,
        itemsAdded: Math.floor(Math.random() * 20) + 5,
        itemsSold: Math.floor(Math.random() * 30) + 10,
        lowStockAlerts: Math.floor(Math.random() * 8) + 1,
      }));
    } else {
      return quarters.map((quarter, index) => ({
        period: quarter,
        stockValue: Math.floor(Math.random() * 150000) + 60000,
        itemsAdded: Math.floor(Math.random() * 60) + 15,
        itemsSold: Math.floor(Math.random() * 90) + 30,
        lowStockAlerts: Math.floor(Math.random() * 25) + 5,
      }));
    }
  };

  const handleGetReport = () => {
    setReportGenerated(true);
    toast({
      title: "Report Generated",
      description: `${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} report for ${selectedYear} has been generated successfully.`,
    });
  };

  const reportData = generateReportData();
  const currentData = reportData[reportData.length - 1];
  const previousData = reportData[reportData.length - 2];

  // Category breakdown
  const categoryData: Record<string, number> = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData).map(([name, value], index) => ({
    name,
    value,
    fill: `hsl(${index * 45}, 70%, 60%)`
  }));

  // Current inventory stats
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const lowStockItems = items.filter(item => item.quantity <= item.lowStockThreshold).length;
  const totalItems = items.length;

  const chartConfig = {
    stockValue: {
      label: "Stock Value",
      color: "hsl(var(--chart-1))",
    },
    itemsAdded: {
      label: "Items Added",
      color: "hsl(var(--chart-2))",
    },
    itemsSold: {
      label: "Items Sold",
      color: "hsl(var(--chart-3))",
    },
    lowStockAlerts: {
      label: "Low Stock Alerts",
      color: "hsl(var(--chart-4))",
    },
  };

  const exportReport = () => {
    const reportContent = {
      period: selectedPeriod,
      year: selectedYear,
      generatedAt: new Date().toISOString(),
      summary: {
        totalItems,
        totalValue,
        lowStockItems,
        categories: Object.keys(categoryData).length
      },
      trends: reportData,
      categoryBreakdown: categoryChartData
    };

    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${selectedPeriod}-${selectedYear}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive inventory reports and business insights</p>
        </div>
        <Button onClick={exportReport} className="flex items-center gap-2" disabled={!reportGenerated}>
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Report Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Period</label>
              <Select value={selectedPeriod} onValueChange={(value) => {
                setSelectedPeriod(value);
                setReportGenerated(false);
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear} onValueChange={(value) => {
                setSelectedYear(value);
                setReportGenerated(false);
              }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGetReport} className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Get Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {!reportGenerated && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Select Time Period and Generate Report</p>
              <p className="text-sm">Choose your preferred report period and year, then click "Get Report" to view analytics.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {reportGenerated && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Stock Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5% from last period
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                  <Package className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalItems}</div>
                  <div className="flex items-center text-xs text-blue-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8 from last period
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{lowStockItems}</div>
                  <div className="flex items-center text-xs text-red-600">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -2 from last period
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <FileText className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Object.keys(categoryData).length}</div>
                  <div className="flex items-center text-xs text-gray-600">
                    Active product categories
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stock Value Trend</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Increasing
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Inventory Turnover</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Stable
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stock Health</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Good
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Categories by Quantity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(categoryData)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([category, quantity]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{category}</span>
                          <Badge variant="outline">{quantity as number} items</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Value Trends ({selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)})</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <LineChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="stockValue" stroke="var(--color-stockValue)" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Activity Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <BarChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="itemsAdded" fill="var(--color-itemsAdded)" />
                    <Bar dataKey="itemsSold" fill="var(--color-itemsSold)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(categoryData).map(([category, quantity]) => {
                    const categoryItems = items.filter(item => item.category === category);
                    const categoryValue = categoryItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                    const lowStockInCategory = categoryItems.filter(item => item.quantity <= item.lowStockThreshold).length;
                    
                    return (
                        <div key={category} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{category}</h4>
                            <Badge variant="outline">{quantity as number} items</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>Total Value: ${categoryValue.toFixed(2)}</div>
                          <div>Low Stock: {lowStockInCategory} items</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <LineChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="lowStockAlerts" stroke="var(--color-lowStockAlerts)" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Stock Turnover</span>
                    <span className="font-semibold">2.3x per month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stock Accuracy</span>
                    <span className="font-semibold">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fill Rate</span>
                    <span className="font-semibold">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Days of Supply</span>
                    <span className="font-semibold">45 days</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-sm font-medium text-yellow-800">Stock Optimization</p>
                    <p className="text-xs text-yellow-700">Consider reordering {lowStockItems} items that are below threshold</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm font-medium text-blue-800">Inventory Balance</p>
                    <p className="text-xs text-blue-700">Your stock levels are well-balanced across categories</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <p className="text-sm font-medium text-green-800">Growth Opportunity</p>
                    <p className="text-xs text-green-700">Stock value has increased 12.5% - consider expanding popular categories</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Reports;
