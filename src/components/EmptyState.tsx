
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  onAddRow: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAddRow }) => {
  return (
    <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
      <CardContent className="flex flex-col items-center justify-center p-10 text-center">
        <div className="rounded-full bg-blue-100 p-3 mb-4">
          <Plus size={24} className="text-blue-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">No items added yet</h3>
        <p className="text-gray-500 mb-4">Add your first bill item to get started</p>
        <Button onClick={onAddRow}>
          <Plus size={16} className="mr-2" /> Add First Item
        </Button>
      </CardContent>
    </Card>
  );
};
