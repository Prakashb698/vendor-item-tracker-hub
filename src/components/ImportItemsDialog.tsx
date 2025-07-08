
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInventoryStore } from "@/store/inventoryStore";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, FileText } from "lucide-react";

interface ImportItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportItemsDialog = ({ open, onOpenChange }: ImportItemsDialogProps) => {
  const { addItem } = useInventoryStore();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const items = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const item: any = {};
      
      headers.forEach((header, index) => {
        item[header.toLowerCase().replace(/\s+/g, '')] = values[index] || '';
      });
      
      items.push(item);
    }
    
    return items;
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV or Excel file to import.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      const text = await file.text();
      const items = parseCSV(text);
      
      let importedCount = 0;
      
      for (const item of items) {
        if (item.name && item.price) {
          addItem({
            name: item.name || 'Unknown Item',
            description: item.description || '',
            category: item.category || 'Uncategorized',
            quantity: parseInt(item.quantity) || 0,
            price: parseFloat(item.price) || 0,
            lowStockThreshold: parseInt(item.lowstockthreshold || item.threshold) || 5,
            sku: item.sku || `SKU-${Date.now()}-${importedCount}`,
            location: item.location || 'Not specified',
            vendor: item.vendor || 'Not specified',
            barcode: item.barcode || item.barcodenumber || '',
          });
          importedCount++;
        }
      }

      toast({
        title: "Import Successful",
        description: `Successfully imported ${importedCount} items.`,
      });

      setFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import items. Please check your file format.",
        variant: "destructive",
      });
    }

    setIsImporting(false);
  };

  const downloadTemplate = () => {
    const headers = [
      'name',
      'description', 
      'category',
      'quantity',
      'price',
      'lowStockThreshold',
      'sku',
      'location',
      'vendor',
      'barcode'
    ];
    
    const sampleRow = [
      'Sample Product',
      'Sample description',
      'Electronics',
      '10',
      '99.99',
      '5',
      'SKU-001',
      'A1-B2',
      'Sample Vendor',
      '1234567890123'
    ];

    const csvContent = [
      headers.join(','),
      sampleRow.join(',')
    ].join('\n');

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
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Import Items</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Supported formats: CSV files</p>
                <p>Your CSV should include columns: name, description, category, quantity, price, lowStockThreshold, sku, location, vendor, barcode</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="file" className="text-sm font-medium text-gray-700">
                Select File
              </Label>
              <Input
                id="file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="mt-1"
              />
              {file && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={downloadTemplate}
                variant="outline"
                className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!file || isImporting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Importing...' : 'Import Items'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportItemsDialog;
