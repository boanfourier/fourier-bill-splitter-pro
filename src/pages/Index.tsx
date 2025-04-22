
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Calculator, Download, HelpCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { BillInfo } from "@/components/BillInfo";
import { EmptyState } from "@/components/EmptyState";
import { InfoTooltip } from "@/components/InfoTooltip";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PrintableTable } from "@/components/PrintableTable";
import * as htmlToImage from 'html-to-image';

interface BillItem {
  id: string;
  name: string;
  price: string;
  discount: string;
  discountedPrice: number;
  roundedPrice: number;
}

const Index = () => {
  const [items, setItems] = useState<BillItem[]>([]);
  const [finalPrice, setFinalPrice] = useState<string>("");
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const printableRef = useRef<HTMLDivElement>(null);

  const formatToRupiah = (amount: number | string) => {
    const number = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  useEffect(() => {
    calculateTotals();
  }, [items, finalPrice]);

  const addNewRow = () => {
    const newItem: BillItem = {
      id: Date.now().toString(),
      name: "",
      price: "",
      discount: "",
      discountedPrice: 0,
      roundedPrice: 0,
    };
    setItems((prevItems) => [...prevItems, newItem]);
  };

  const deleteRow = (id: string) => {
    if (items.length > 1) {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof BillItem, value: string) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          if (field === 'price' || field === 'discount') {
            const price = parseFloat(updatedItem.price) || 0;
            const discount = parseFloat(updatedItem.discount) || 0;
            const discountedAmount = price - discount;
            updatedItem.discountedPrice = Math.ceil(discountedAmount / 100) * 100;
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  const calculateTotals = () => {
    const total = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    setTotalPrice(total);
    
    const finalPriceValue = parseFloat(finalPrice) || 0;
    if (total > 0 && finalPriceValue > 0) {
      const discPercentage = ((total - finalPriceValue) / total) * 100;
      setDiscountPercentage(parseFloat(discPercentage.toFixed(2)));
    } else {
      setDiscountPercentage(0);
    }
  };

  const calculate = async () => {
    if (items.length === 0) {
      toast({
        title: "No items added",
        description: "Please add at least one item to calculate",
        variant: "destructive",
      });
      return;
    }

    const invalidItems = items.filter(item => !item.name || !item.price);
    if (invalidItems.length > 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all item names and prices",
        variant: "destructive",
      });
      return;
    }

    if (!finalPrice || parseFloat(finalPrice) <= 0) {
      toast({
        title: "Missing final price",
        description: "Please enter the final amount paid",
        variant: "destructive",
      });
      return;
    }

    const total = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    const finalPriceValue = parseFloat(finalPrice);
    const discountRatio = finalPriceValue / total;

    const updatedItems = items.map(item => {
      const originalPrice = parseFloat(item.price) || 0;
      const proportionalPrice = originalPrice * discountRatio;
      const discount = originalPrice - proportionalPrice;
      
      return {
        ...item,
        discount: discount.toFixed(2),
        discountedPrice: proportionalPrice,
        roundedPrice: Math.round(proportionalPrice / 1000) * 1000
      };
    });

    setItems(updatedItems);
    calculateTotals();
    
    try {
      setIsSaving(true);

      const { data: billData, error: billError } = await supabase
        .from('bills')
        .insert({
          total_price: totalPrice,
          final_price: parseFloat(finalPrice) || 0,
          discount_percentage: discountPercentage
        })
        .select()
        .single();

      if (billError) throw billError;

      const billItems = updatedItems.map(item => ({
        bill_id: billData.id,
        name: item.name,
        price: parseFloat(item.price) || 0,
        discount: parseFloat(item.discount) || 0,
        discounted_price: item.discountedPrice,
        rounded_price: item.roundedPrice
      }));

      const { error: itemsError } = await supabase
        .from('bill_items')
        .insert(billItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Bill saved automatically",
        description: `Discount applied: ${discountPercentage.toFixed(2)}%`,
      });

    } catch (error) {
      console.error("Error saving bill:", error);
      toast({
        title: "Failed to save bill",
        description: "There was an error saving your bill",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageDownload = async () => {
    if (printableRef.current) {
      try {
        // Add a short delay to ensure the printable content is fully rendered
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Optimize image generation settings
        const dataUrl = await htmlToImage.toPng(printableRef.current, {
          quality: 1.0,
          backgroundColor: 'white',
          pixelRatio: 2,
          skipAutoScale: true,
          canvasWidth: printableRef.current.offsetWidth * 2,
          canvasHeight: printableRef.current.offsetHeight * 2,
          style: {
            margin: '0',
            padding: '20px',
          }
        });
        
        // Create and trigger download
        const link = document.createElement('a');
        link.download = `bill-details-${Date.now()}.png`;
        link.href = dataUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Success",
          description: "Bill image has been downloaded",
        });
      } catch (error) {
        console.error('Error generating image:', error);
        toast({
          title: "Download Error",
          description: "Failed to download bill image. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <Card className="shadow-xl border-t-4 border-t-blue-500 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-gray-800">Split Bill Machaa Pro</CardTitle>
              <Button
                variant="outline"
                onClick={handleImageDownload}
                className="flex items-center gap-2"
              >
                <Download size={18} /> Save as Image
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {items.length === 0 ? (
              <EmptyState onAddRow={addNewRow} />
            ) : (
              <>
                <div className="mb-6">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2 hover:bg-blue-50 border-dashed border-2 h-12" 
                    onClick={addNewRow}
                  >
                    <Plus size={18} /> Add Row
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-2 w-[120px]"></th>
                        <th className="pb-2 w-1/5">Item <span className="text-red-500">*</span></th>
                        <th className="pb-2">Price <span className="text-red-500">*</span></th>
                        <th className="pb-2">Discount</th>
                        <th className="pb-2">Final Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3 pr-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full"
                              onClick={() => deleteRow(item.id)}
                            >
                              <Trash2 size={16} /> Delete Row
                            </Button>
                          </td>
                          <td className="py-3 pr-2">
                            <Input
                              className="bg-blue-50"
                              value={item.name}
                              onChange={(e) => updateItem(item.id, "name", e.target.value)}
                              placeholder="Enter item name"
                            />
                          </td>
                          <td className="py-3 pr-2">
                            <Input
                              className="bg-blue-50"
                              type="number"
                              value={item.price}
                              onChange={(e) => updateItem(item.id, "price", e.target.value)}
                              placeholder="0"
                            />
                          </td>
                          <td className="py-3 pr-2">
                            <Input
                              value={item.discount}
                              onChange={(e) => updateItem(item.id, "discount", e.target.value)}
                              placeholder="0"
                              type="number"
                            />
                          </td>
                          <td className="py-3">
                            <Input
                              value={formatToRupiah(item.discountedPrice)}
                              readOnly
                              className="bg-gray-50"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="mt-8">
              <div className="flex flex-col max-w-sm mb-6">
                <label className="mb-2 text-sm font-medium flex items-center">
                  Final Price <span className="text-red-500">*</span>
                  <InfoTooltip content="Enter the final amount paid (after all discounts were applied)" />
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                    placeholder="Enter final amount paid"
                    className="bg-blue-50"
                  />
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600" 
                    onClick={calculate}
                  >
                    <Calculator size={18} className="mr-2" /> Calculate
                  </Button>
                </div>
              </div>
              
              <BillInfo 
                totalPrice={formatToRupiah(totalPrice)} 
                finalPrice={formatToRupiah(parseFloat(finalPrice) || 0)} 
                discountPercentage={discountPercentage} 
              />
            </div>
          </CardContent>
        </Card>
        
        <div style={{ display: 'none' }}>
          <PrintableTable
            ref={printableRef}
            items={items}
            totalPrice={totalPrice}
            finalPrice={finalPrice}
            discountPercentage={discountPercentage}
          />
        </div>
        
        <div className="text-center py-6 text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Fourier Project | Bill Splitter Pro</p>
          <p className="mt-1">Made with ♥ by Fourier Project team</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
