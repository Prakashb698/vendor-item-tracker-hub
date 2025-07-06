
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useAddInventoryItem } from "@/hooks/useInventoryItems";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedItem {
  rowIndex: number;
  name: string;
  description: string;
  category: string;
  quantity: number;
  price: number;
  lowStockThreshold: number;
  sku: string;
  barcode: string;
  location: string;
  vendor: string;
  isValid: boolean;
  missingFields: string[];
}

const ImportItemsDialog = ({ open, onOpenChange }: ImportItemsDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<ParsedItem[]>([]);
  const [validationResults, setValidationResults] = useState<{
    validItems: number;
    invalidItems: number;
    totalItems: number;
  }>({ validItems: 0, invalidItems: 0, totalItems: 0 });
  
  const addItemMutation = useAddInventoryItem();

  const validateItem = (item: Omit<ParsedItem, 'isValid' | 'missingFields'>): { isValid: boolean; missingFields: string[] } => {
    const requiredFields = [
      { field: 'name', value: item.name },
      { field: 'category', value: item.category },
      { field: 'sku', value: item.sku },
    ];

    const missingFields: string[] = [];

    requiredFields.forEach(({ field, value }) => {
      if (!value || value.toString().trim() === '') {
        missingFields.push(field);
      }
    });

    // Check for numeric fields that should be >= 0
    if (item.quantity < 0) {
      missingFields.push('quantity (must be >= 0)');
    }
    if (item.price < 0) {
      missingFields.push('price (must be >= 0)');
    }

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

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
    
    const parsedData: ParsedItem[] = dataRows.map((row, index) => {
      const baseItem = {
        rowIndex: index + 2, // +2 because we start from row 1 and skip header
        name: row[0] || '',
        description: row[1] || '',
        category: row[2] || '',
        quantity: parseInt(row[3]) || 0,
        price: parseFloat(row[4]) || 0,
        lowStockThreshold: parseInt(row[5]) || 10,
        sku: row[6] || '',
        barcode: row[7] || '',
        location: row[8] || '',
        vendor: row[9] || '',
      };

      const validation = validateItem(baseItem);
      
      return {
        ...baseItem,
        isValid: validation.isValid,
        missingFields: validation.missingFields
      };
    });

    const validItems = parsedData.filter(item => item.isValid).length;
    const invalidItems = parsedData.filter(item => !item.isValid).length;

    setValidationResults({
      validItems,
      invalidItems,
      totalItems: parsedData.length
    });

    setPreviewData(parsedData);
  };

  const handleImport = async () => {
    const validItems = previewData.filter(item => item.isValid);
    
    if (validItems.length === 0) {
      toast({
        title: "No Valid Items",
        description: "All items have validation errors. Please fix the issues before importing.",
        variant: "destructive",
      });
      return;
    }

    if (validationResults.invalidItems > 0) {
      const proceed = window.confirm(
        `${validationResults.invalidItems} items have validation errors and will be skipped. Do you want to import only the ${validationResults.validItems} valid items?`
      );
      if (!proceed) return;
    }

    setIsImporting(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const item of validItems) {
        try {
          await addItemMutation.mutateAsync({
            name: item.name,
            description: item.description || null,
            category: item.category,
            quantity: item.quantity,
            price: item.price,
            low_stock_threshold: item.lowStockThreshold,
            sku: item.sku,
            barcode: item.barcode || null,
            location: item.location || null,
            vendor: item.vendor || null,
          });
          successCount++;
        } catch (error) {
          console.error(`Error importing item on row ${item.rowIndex}:`, error);
          errorCount++;
        }
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} items${errorCount > 0 ? `. ${errorCount} items failed due to errors.` : '.'}`,
      });

      onOpenChange(false);
      setFile(null);
      setPreviewData([]);
      setValidationResults({ validItems: 0, invalidItems: 0, totalItems: 0 });
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
    const headers = ['Name*', 'Description', 'Category*', 'Quantity', 'Price', 'Low Stock Threshold', 'SKU*', 'Barcode', 'Location', 'Vendor'];
    const sampleData = [
      ['Premium Coffee Beans', 'High-quality arabica coffee beans', 'Beverages', '25', '15.99', '10', 'COF-001', '1234567890123', 'A1-S2', 'Coffee Co'],
      ['Organic Honey', 'Pure organic honey from local beekeepers', 'Food', '15', '12.50', '8', 'HON-001', '1234567890124', 'B2-S1', 'Honey Farm']
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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
                    <li>• Columns: Name*, Description, Category*, Quantity, Price, Low Stock Threshold, SKU*, Barcode, Location, Vendor</li>
                    <li>• Fields marked with * are required</li>
                    <li>• First row should contain headers</li>
                    <li>• SKU and Barcode must be unique if provided</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Summary */}
          {previewData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Validation Results</h3>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    {validationResults.validItems} Valid
                  </div>
                  {validationResults.invalidItems > 0 && (
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-4 w-4" />
                      {validationResults.invalidItems} Invalid
                    </div>
                  )}
                </div>
              </div>

              {validationResults.invalidItems > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {validationResults.invalidItems} items have validation errors and will be skipped during import.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Preview Section */}
          {previewData.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Preview ({previewData.length} items)</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left p-2 border-r">Status</th>
                        <th className="text-left p-2 border-r">Row</th>
                        <th className="text-left p-2 border-r">Name</th>
                        <th className="text-left p-2 border-r">Category</th>
                        <th className="text-left p-2 border-r">SKU</th>
                        <th className="text-left p-2 border-r">Price</th>
                        <th className="text-left p-2">Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 20).map((item, index) => (
                        <tr key={index} className={`border-t ${!item.isValid ? 'bg-red-50' : ''}`}>
                          <td className="p-2 border-r">
                            {item.isValid ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </td>
                          <td className="p-2 border-r text-gray-500">{item.rowIndex}</td>
                          <td className="p-2 border-r font-medium">{item.name || '⚠️ Missing'}</td>
                          <td className="p-2 border-r">{item.category || '⚠️ Missing'}</td>
                          <td className="p-2 border-r">{item.sku || '⚠️ Missing'}</td>
                          <td className="p-2 border-r">${item.price.toFixed(2)}</td>
                          <td className="p-2">
                            {!item.isValid && (
                              <span className="text-red-600 text-xs">
                                Missing: {item.missingFields.join(', ')}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.length > 20 && (
                  <div className="p-2 text-center text-sm text-gray-500 border-t">
                    ... and {previewData.length - 20} more items
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
              disabled={!previewData.length || validationResults.validItems === 0 || isImporting}
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
                  Import {validationResults.validItems} Valid Items
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
