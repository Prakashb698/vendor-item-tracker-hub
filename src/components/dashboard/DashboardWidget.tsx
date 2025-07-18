import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Move, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  isCustomizable?: boolean;
  onRemove?: (id: string) => void;
  icon?: React.ReactNode;
}

export function DashboardWidget({ 
  id, 
  title, 
  children, 
  className,
  isCustomizable = false,
  onRemove,
  icon 
}: DashboardWidgetProps) {
  return (
    <Card className={cn("bg-card border shadow-sm group", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </div>
        
        {isCustomizable && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 cursor-move"
              title="Drag to reorder"
            >
              <Move className="h-3 w-3" />
            </Button>
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive"
                onClick={() => onRemove(id)}
                title="Remove widget"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}