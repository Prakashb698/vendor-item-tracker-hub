
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, TrendingUp, DollarSign, Settings, Grid3X3 } from "lucide-react";
import { useInventoryStore } from "@/store/inventoryStore";
import { DashboardWidget } from "@/components/dashboard/DashboardWidget";
import { PrintButton } from "@/components/PrintButton";

const Dashboard = () => {
  const { items } = useInventoryStore();
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [widgets, setWidgets] = useState([
    { id: 'total-items', title: 'Total Items', visible: true },
    { id: 'low-stock', title: 'Low Stock Alert', visible: true },
    { id: 'inventory-value', title: 'Inventory Value', visible: true },
    { id: 'categories', title: 'Categories', visible: true },
    { id: 'low-stock-list', title: 'Low Stock Items', visible: true },
  ]);

  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.quantity <= item.lowStockThreshold).length;
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const categoriesCount = new Set(items.map(item => item.category)).size;

  const recentLowStock = items
    .filter(item => item.quantity <= item.lowStockThreshold)
    .slice(0, 5);

  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.map(w => w.id === widgetId ? { ...w, visible: false } : w));
  };

  const restoreWidget = (widgetId: string) => {
    setWidgets(widgets.map(w => w.id === widgetId ? { ...w, visible: true } : w));
  };

  return (
    <div className="space-y-6" id="printable-content">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your inventory and business metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomizable(!isCustomizable)}
          >
            {isCustomizable ? <Grid3X3 className="h-4 w-4 mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
            {isCustomizable ? 'Done' : 'Customize'}
          </Button>
          <PrintButton title="Dashboard Report" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgets.find(w => w.id === 'total-items')?.visible && (
          <DashboardWidget
            id="total-items"
            title="Total Items"
            icon={<Package className="h-4 w-4 text-primary" />}
            isCustomizable={isCustomizable}
            onRemove={removeWidget}
          >
            <div className="text-2xl font-bold foreground">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Active inventory items</p>
          </DashboardWidget>
        )}

        {widgets.find(w => w.id === 'low-stock')?.visible && (
          <DashboardWidget
            id="low-stock"
            title="Low Stock Alert"
            icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
            isCustomizable={isCustomizable}
            onRemove={removeWidget}
          >
            <div className="text-2xl font-bold foreground">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </DashboardWidget>
        )}

        {widgets.find(w => w.id === 'inventory-value')?.visible && (
          <DashboardWidget
            id="inventory-value"
            title="Inventory Value"
            icon={<DollarSign className="h-4 w-4 text-green-600" />}
            isCustomizable={isCustomizable}
            onRemove={removeWidget}
          >
            <div className="text-2xl font-bold foreground">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total stock value</p>
          </DashboardWidget>
        )}

        {widgets.find(w => w.id === 'categories')?.visible && (
          <DashboardWidget
            id="categories"
            title="Categories"
            icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
            isCustomizable={isCustomizable}
            onRemove={removeWidget}
          >
            <div className="text-2xl font-bold foreground">{categoriesCount}</div>
            <p className="text-xs text-muted-foreground">Product categories</p>
          </DashboardWidget>
        )}
      </div>

      {/* Low Stock Items */}
      {widgets.find(w => w.id === 'low-stock-list')?.visible && (
        <DashboardWidget
          id="low-stock-list"
          title="Low Stock Items"
          icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
          isCustomizable={isCustomizable}
          onRemove={removeWidget}
          className="col-span-full"
        >
          {recentLowStock.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">All items are well stocked! 🎉</p>
          ) : (
            <div className="space-y-3">
              {recentLowStock.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-destructive/20 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <h4 className="font-medium foreground">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="mb-1">
                      {item.quantity} left
                    </Badge>
                    <p className="text-xs text-muted-foreground">Min: {item.lowStockThreshold}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardWidget>
      )}

      {/* Restore Widget Options */}
      {isCustomizable && widgets.some(w => !w.visible) && (
        <Card className="border-dashed">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium mb-3">Restore Widgets</h3>
            <div className="flex flex-wrap gap-2">
              {widgets.filter(w => !w.visible).map((widget) => (
                <Button
                  key={widget.id}
                  variant="outline"
                  size="sm"
                  onClick={() => restoreWidget(widget.id)}
                >
                  + {widget.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
