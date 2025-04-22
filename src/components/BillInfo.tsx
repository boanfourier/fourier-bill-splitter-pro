
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BillInfoProps {
  totalPrice: number;
  finalPrice: string;
  discountPercentage: number;
}

export const BillInfo: React.FC<BillInfoProps> = ({ totalPrice, finalPrice, discountPercentage }) => {
  const finalPriceValue = parseFloat(finalPrice) || 0;
  const savings = totalPrice - finalPriceValue;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-blue-700">Total Original Price</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalPrice.toLocaleString()}</p>
          <p className="text-xs text-blue-600">Sum of all item prices</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-green-700">Final Price Paid</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{finalPriceValue.toLocaleString()}</p>
          <p className="text-xs text-green-600">After all discounts</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-purple-700">Your Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{savings > 0 ? savings.toLocaleString() : 0} <span className="text-sm">({discountPercentage}%)</span></p>
          <p className="text-xs text-purple-600">Total discount received</p>
        </CardContent>
      </Card>
    </div>
  );
};
