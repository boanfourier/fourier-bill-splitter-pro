
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Calculator, HelpCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { BillInfo } from "@/components/BillInfo";
import { EmptyState } from "@/components/EmptyState";
import { InfoTooltip } from "@/components/InfoTooltip";

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

  // We'll start with empty state and let user add rows
  useEffect(() => {
    // No auto-initialization anymore
  }, []);

  // Calculate totals whenever items change
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
          
          // Calculate discounted price if price or discount has changed
          if (field === 'price' || field === 'discount') {
            const price = parseFloat(updatedItem.price) || 0;
            const discount = parseFloat(updatedItem.discount) || 0;
            updatedItem.discountedPrice = price - discount;
            updatedItem.roundedPrice = Math.round(updatedItem.discountedPrice / 1000) * 1000;
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

  const calculate = () => {
    // Force recalculation
    calculateTotals();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <Card className="shadow-xl border-t-4 border-t-blue-500 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle className="text-2xl font-bold text-center text-gray-800">Split Bill MK 2</CardTitle>
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
                        <th className="pb-2 w-1/5">
                          Item <span className="text-red-500">*</span>
                        </th>
                        <th className="pb-2">
                          Price <span className="text-red-500">*</span>
                        </th>
                        <th className="pb-2">
                          Discount
                          <InfoTooltip content="Enter the discount amount for this item" />
                        </th>
                        <th className="pb-2">
                          Discounted Price
                          <InfoTooltip content="Original price minus discount" />
                        </th>
                        <th className="pb-2">
                          Rounded Price
                          <InfoTooltip content="Discounted price rounded to nearest 1000" />
                        </th>
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
                          <td className="py-3 pr-2">
                            <Input
                              value={item.discountedPrice || ""}
                              readOnly
                              className="bg-gray-50"
                            />
                          </td>
                          <td className="py-3">
                            <Input
                              value={item.roundedPrice || ""}
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
                <div className="flex">
                  <Input
                    type="number"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                    placeholder="Enter final amount paid"
                    className="bg-blue-50"
                  />
                  <Button 
                    className="ml-2 bg-blue-500 hover:bg-blue-600" 
                    onClick={calculate}
                  >
                    <Calculator size={18} /> Calculate
                  </Button>
                </div>
              </div>
              
              <BillInfo 
                totalPrice={totalPrice} 
                finalPrice={finalPrice} 
                discountPercentage={discountPercentage} 
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center py-6 text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Fourier Project | Bill Splitter Pro</p>
          <p className="mt-1">Made with ♥ by Fourier Project team</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
