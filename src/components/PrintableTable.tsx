
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface BillItem {
  id: string;
  name: string;
  price: string;
  discount: string;
  discountedPrice: number;
  roundedPrice: number;
}

interface PrintableTableProps {
  items: BillItem[];
  totalPrice: number;
  finalPrice: string;
  discountPercentage: number;
}

export const PrintableTable = React.forwardRef<HTMLDivElement, PrintableTableProps>(
  ({ items, totalPrice, finalPrice, discountPercentage }, ref) => {
    const formatToRupiah = (amount: number | string) => {
      const number = typeof amount === 'string' ? parseFloat(amount) : amount;
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(number);
    };

    return (
      <div ref={ref} className="p-8 bg-white">
        <h2 className="text-2xl font-bold mb-4 text-center">Bill Details</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Original Price</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Discounted Price</TableHead>
              <TableHead>Rounded Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{formatToRupiah(item.price)}</TableCell>
                <TableCell>{formatToRupiah(item.discount)}</TableCell>
                <TableCell>{formatToRupiah(item.discountedPrice)}</TableCell>
                <TableCell>{formatToRupiah(item.roundedPrice)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 text-right">
          <p className="font-semibold">Total Price: {formatToRupiah(totalPrice)}</p>
          <p className="font-semibold">Final Price: {formatToRupiah(finalPrice)}</p>
          <p className="font-semibold">Discount: {discountPercentage}%</p>
        </div>
      </div>
    );
  }
);

PrintableTable.displayName = 'PrintableTable';
