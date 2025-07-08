
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { useInventoryStore } from "@/store/inventoryStore";
import { useToast } from "@/hooks/use-toast";

interface ImportItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportItemsDialog = ({ open, onOpenChange }: ImportItemsDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const { addItem } = useInventoryStore();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    const text = await file.text();
    let rows: string[][];

    if (file.name.endsWith('.csv')) {
      rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
    } else {
      // Basic Excel parsing (TSV format)
      rows = text.split('\n').map(row => row.split('\t').map(cell => cell.trim()));
    }

    // Remove empty rows and header
    const dataRows = rows.slice(1).filter(row => row.some(cell => cell.length > 0));
    
    const parsedData = dataRows.map((row, index) => ({
      rowIndex: index + 1,
      name: row[0] || '',
      description: row[1] || '',
      category: row[2] || 'Uncategorized',
      quantity: parseInt(row[3]) || 0,
      price: parseFloat(row[4]) || 0,
      lowStockThreshold: parseInt(row[5]) || 10,
      sku: row[6] || `SKU-${Date.now()}-${index}`,
      location: row[7] || 'Not specified',
    }));

    setPreviewData(parsedData);
  };

  const handleImport = async () => {
    if (!previewData.length) return;

    setIsImporting(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      previewData.forEach((item) => {
        try {
          if (item.name && item.name.length > 0) {
            addItem({
              name: item.name,
              description: item.description,
              category: item.category,
              quantity: item.quantity,
              price: item.price,
              lowStockThreshold: item.lowStockThreshold,
              sku: item.sku,
              location: item.location,
            });
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      });

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} items${errorCount > 0 ? `. ${errorCount} items failed.` : '.'}`,
      });

      onOpenChange(false);
      setFile(null);
      setPreviewData([]);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "There was an error importing your items.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ['Name', 'Description', 'Category', 'Quantity', 'Price', 'Low Stock Threshold', 'SKU', 'Location'];
    const sampleData = [
      ['Premium Coffee Beans', 'High-quality arabica coffee beans', 'Beverages', '25', '15.99', '10', 'COF-001', 'A1-S2'],
      ['Organic Honey', 'Pure organic honey from local beekeepers', 'Food', '15', '12.50', '8', 'HON-001', 'B2-S1']
    ];
    
    const csvContent = [headers, ...sampleData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Items from Excel/CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="file-upload">Select CSV or Excel file</Label>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                Download Template
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="flex-1"
              />
              {file && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {file.name}
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">File Format Requirements:</p>
                  <ul className="mt-1 space-y-1 text-blue-700">
                    <li>• Columns: Name, Description, Category, Quantity, Price, Low Stock Threshold, SKU, Location</li>
                    <li>• First row should contain headers</li>
                    <li>• Name field is required for each item</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {previewData.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Preview ({previewData.length} items)</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left p-2 border-r">Name</th>
                        <th className="text-left p-2 border-r">Category</th>
                        <th className="text-left p-2 border-r">Quantity</th>
                        <th className="text-left p-2 border-r">Price</th>
                        <th className="text-left p-2 border-r">SKU</th>
                        <th className="text-left p-2">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 10).map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2 border-r font-medium">{item.name || '⚠️ Missing'}</td>
                          <td className="p-2 border-r">{item.category}</td>
                          <td className="p-2 border-r">{item.quantity}</td>
                          <td className="p-2 border-r">${item.price.toFixed(2)}</td>
                          <td className="p-2 border-r">{item.sku}</td>
                          <td className="p-2">{item.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.length > 10 && (
                  <div className="p-2 text-center text-sm text-gray-500 border-t">
                    ... and {previewData.length - 10} more items
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!previewData.length || isImporting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isImporting ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import {previewData.length} Items
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportItemsDialog;
