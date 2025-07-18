import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PrintButtonProps {
  printId?: string;
  title?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function PrintButton({ 
  printId = "printable-content", 
  title = "Print",
  variant = "outline",
  size = "default"
}: PrintButtonProps) {
  const { toast } = useToast();

  const handlePrint = () => {
    try {
      const printContent = document.getElementById(printId);
      if (!printContent) {
        toast({
          title: "Print Error",
          description: "Content not found for printing",
          variant: "destructive",
        });
        return;
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Print Error", 
          description: "Please allow popups to enable printing",
          variant: "destructive",
        });
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print - ${title}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.4; 
                color: #000;
                background: #fff;
              }
              .print-header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #000;
              }
              .print-date {
                text-align: right;
                font-size: 12px;
                margin-bottom: 10px;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 10px 0;
              }
              th, td { 
                border: 1px solid #000; 
                padding: 8px; 
                text-align: left; 
              }
              th { background-color: #f0f0f0; }
              .card { 
                border: 1px solid #000; 
                margin: 10px 0; 
                padding: 10px; 
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            <div class="print-date">
              Printed on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
            </div>
            <div class="print-header">
              <h1>${title}</h1>
            </div>
            ${printContent.innerHTML}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();

      toast({
        title: "Print Initiated",
        description: "Print dialog opened successfully",
      });
    } catch (error) {
      toast({
        title: "Print Error",
        description: "Failed to initiate printing",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handlePrint} 
      variant={variant} 
      size={size}
      className="no-print"
    >
      <Printer className="h-4 w-4 mr-2" />
      {size !== "icon" && "Print"}
    </Button>
  );
}