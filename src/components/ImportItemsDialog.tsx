
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInventoryStore } from "@/store/inventoryStore";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, FileText, AlertCircle } from "lucide-react";

interface ImportItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportItemsDialog = ({ open, onOpenChange }: ImportItemsDialogProps) => {
  const { addItem } = useInventoryStore();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [previewItems, setPreviewItems] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setShowPreview(false);
      setPreviewItems([]);
    }
  };

  const parseCSV = (text: string) => {
    console.log("Raw CSV text:", text);
    
    const lines = text.trim().split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      throw new Error("CSV file must have at least a header row and one data row");
    }

    // Parse headers - handle quoted values and commas
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map(h => 
      h.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/['"]/g, '')
    );
    
    console.log("Parsed headers:", headers);

    const items = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        const item: any = {};
        
        // Map each header to its corresponding value
        headers.forEach((header, index) => {
          const value = values[index] || '';
          item[header] = value.replace(/['"]/g, '').trim();
        });
        
        console.log(`Parsed item ${i}:`, item);
        items.push(item);
      } catch (error) {
        console.error(`Error parsing line ${i + 1}:`, error);
        // Continue with other lines
      }
    }
    
    return items;
  };

  // Enhanced CSV line parser that handles quoted fields with commas
  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };

  const validateAndMapItem = (item: any) => {
    console.log("Validating item:", item);
    
    // Map common field variations to our expected fields
    const fieldMappings = {
      name: ['name', 'productname', 'product', 'title', 'itemname'],
      description: ['description', 'desc', 'details'],
      category: ['category', 'cat', 'type'],
      quantity: ['quantity', 'qty', 'stock', 'amount'],
      price: ['price', 'cost', 'unitprice'],
      lowstockthreshold: ['lowstockthreshold', 'threshold', 'minstock', 'reorderpoint'],
      sku: ['sku', 'code', 'productcode', 'itemcode'],
      location: ['location', 'loc', 'warehouse', 'shelf'],
      vendor: ['vendor', 'supplier', 'manufacturer'],
      barcode: ['barcode', 'barcodenumber', 'upc', 'ean']
    };

    const mappedItem: any = {};

    // Map fields using the field mappings
    Object.keys(fieldMappings).forEach(targetField => {
      const possibleFields = fieldMappings[targetField as keyof typeof fieldMappings];
      
      for (const field of possibleFields) {
        if (item[field] !== undefined && item[field] !== '') {
          mappedItem[targetField] = item[field];
          break;
        }
      }
    });

    console.log("Mapped item:", mappedItem);

    // Validate required fields
    if (!mappedItem.name || mappedItem.name.trim() === '') {
      throw new Error("Item name is required");
    }

    // Set defaults for missing fields
    return {
      name: mappedItem.name.trim(),
      description: mappedItem.description || '',
      category: mappedItem.category || 'Uncategorized',
      quantity: parseInt(mappedItem.quantity) || 0,
      price: parseFloat(mappedItem.price) || 0,
      lowStockThreshold: parseInt(mappedItem.lowstockthreshold) || 5,
      sku: mappedItem.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      location: mappedItem.location || 'Not specified',
      vendor: mappedItem.vendor || 'Not specified',
      barcode: mappedItem.barcode || '',
    };
  };

  const handlePreview = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to preview.",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      const rawItems = parseCSV(text);
      
      const validatedItems = [];
      const errors = [];

      for (let i = 0; i < rawItems.length; i++) {
        try {
          const validatedItem = validateAndMapItem(rawItems[i]);
          validatedItems.push(validatedItem);
        } catch (error) {
          errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (errors.length > 0) {
        console.log("Validation errors:", errors);
        toast({
          title: "Some Items Have Issues",
          description: `${errors.length} items have validation errors. Check the preview.`,
          variant: "destructive",
        });
      }

      setPreviewItems(validatedItems);
      setShowPreview(true);
      
      toast({
        title: "Preview Ready",
        description: `${validatedItems.length} items ready for import.`,
      });

    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: "Preview Failed",
        description: error instanceof Error ? error.message : "Failed to preview items. Please check your file format.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (previewItems.length === 0) {
      toast({
        title: "No Items to Import",
        description: "Please preview your file first.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      let importedCount = 0;
      
      for (const item of previewItems) {
        console.log("Importing item:", item);
        addItem(item);
        importedCount++;
      }

      toast({
        title: "Import Successful",
        description: `Successfully imported ${importedCount} items.`,
      });

      setFile(null);
      setPreviewItems([]);
      setShowPreview(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import items. Please try again.",
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
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[80vh] overflow-y-auto">
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
                accept=".csv"
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
              
              <Button
                onClick={handlePreview}
                disabled={!file}
                variant="outline"
                className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Preview Items
              </Button>
            </div>
          </div>

          {showPreview && previewItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Preview ({previewItems.length} items)</h3>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                {previewItems.slice(0, 5).map((item, index) => (
                  <div key={index} className="text-sm mb-2 p-2 bg-white rounded border">
                    <strong>{item.name}</strong> - {item.category} - ${item.price} - Qty: {item.quantity}
                  </div>
                ))}
                {previewItems.length > 5 && (
                  <p className="text-sm text-gray-600">...and {previewItems.length - 5} more items</p>
                )}
              </div>
            </div>
          )}

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
              disabled={previewItems.length === 0 || isImporting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Importing...' : `Import ${previewItems.length} Items`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportItemsDialog;
