
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Search, Filter, TrendingUp, TrendingDown, RotateCcw, ShoppingCart, Package } from "lucide-react";
import { useTransactionStore, TransactionType } from "@/store/transactionStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { format } from "date-fns";

const Transactions = () => {
  const { transactions, loading, error, fetchTransactions, clearError } = useTransactionStore();
  const { items } = useInventoryStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (error) {
      console.error('Transaction error:', error);
      setTimeout(() => clearError(), 5000);
    }
  }, [error, clearError]);

  const getItemName = (itemId: string) => {
    const item = items.find(item => item.id === itemId);
    return item ? item.name : `Item ${itemId}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'stock_in':
      case 'purchase':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'stock_out':
      case 'sale':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionBadge = (type: string) => {
    const variants = {
      stock_in: "bg-green-100 text-green-800",
      stock_out: "bg-red-100 text-red-800",
      adjustment: "bg-blue-100 text-blue-800",
      sale: "bg-purple-100 text-purple-800",
      purchase: "bg-orange-100 text-orange-800",
    };
    
    return (
      <Badge variant="secondary" className={variants[type as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {type.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = getItemName(transaction.item_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || transaction.transaction_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const totalTransactions = transactions.length;
  const recentTransactions = transactions.slice(0, 5);
  const transactionTypes = ['stock_in', 'stock_out', 'adjustment', 'sale', 'purchase'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-pulse" />
            <p className="text-gray-500">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Transaction History</h1>
          <p className="text-gray-600">Complete audit trail of all inventory movements</p>
        </div>
        <Button onClick={fetchTransactions} className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-red-800">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-gray-600">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock In</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter(t => t.transaction_type === 'stock_in' || t.transaction_type === 'purchase').length}
            </div>
            <p className="text-xs text-green-600">Inventory additions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Out</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter(t => t.transaction_type === 'stock_out' || t.transaction_type === 'sale').length}
            </div>
            <p className="text-xs text-red-600">Inventory reductions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adjustments</CardTitle>
            <RotateCcw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter(t => t.transaction_type === 'adjustment').length}
            </div>
            <p className="text-xs text-blue-600">Corrections made</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by item name, reference, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <label className="text-sm font-medium mb-2 block">Transaction Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {transactionTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg font-medium mb-2">No transactions found</p>
              <p className="text-gray-400">
                {searchTerm || filterType !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Transactions will appear here as you make inventory changes"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Previous</TableHead>
                    <TableHead className="text-right">New</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {getItemName(transaction.item_id)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.transaction_type)}
                          {getTransactionBadge(transaction.transaction_type)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <span className={transaction.quantity > 0 ? "text-green-600" : "text-red-600"}>
                          {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-gray-600">
                        {transaction.previous_quantity}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {transaction.new_quantity}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {transaction.unit_price ? `$${transaction.unit_price}` : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {transaction.reference_number || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-48 truncate">
                        {transaction.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
