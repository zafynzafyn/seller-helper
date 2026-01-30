"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatPercent, calculateNetRevenue, calculateEtsyFees } from "@/lib/utils";
import { Calculator, DollarSign, TrendingUp, Receipt } from "lucide-react";

// Helper to parse input value, returns 0 for empty/invalid
const parseValue = (value: string): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// Helper to parse integer value, returns 1 for empty/invalid (for quantity)
const parseIntValue = (value: string, defaultVal: number = 0): number => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultVal : parsed;
};

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pricing Tools</h1>
        <p className="text-muted-foreground">
          Calculate fees, margins, and optimize your pricing strategy
        </p>
      </div>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calculator">Fee Calculator</TabsTrigger>
          <TabsTrigger value="margin">Margin Calculator</TabsTrigger>
          <TabsTrigger value="simulator">Price Simulator</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <FeeCalculator />
        </TabsContent>

        <TabsContent value="margin">
          <MarginCalculator />
        </TabsContent>

        <TabsContent value="simulator">
          <PriceSimulator />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FeeCalculator() {
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [shipping, setShipping] = useState("");
  const [discount, setDiscount] = useState("");

  const priceNum = parseValue(price);
  const quantityNum = parseIntValue(quantity, 1) || 1;
  const shippingNum = parseValue(shipping);
  const discountNum = parseValue(discount);

  const fees = calculateEtsyFees(priceNum, quantityNum, discountNum);
  const totalRevenue = (priceNum * quantityNum) + shippingNum - discountNum;
  const effectiveRevenue = Math.max(0, totalRevenue);
  const netAfterFees = effectiveRevenue - fees.totalFees;

  const hasValues = priceNum > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Etsy Fee Calculator
          </CardTitle>
          <CardDescription>
            Calculate exact fees for any listing price
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price">Item Price ($)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 25.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="e.g. 1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping">Shipping Collected ($)</Label>
            <Input
              id="shipping"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 5.00"
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount">Discount ($)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 2.00"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Coupon or sale discount applied
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fee Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasValues ? (
            <div className="text-center py-8 text-muted-foreground">
              Enter a price to see the fee breakdown
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <div>
                  <p className="font-medium">Listing Fee</p>
                  <p className="text-sm text-muted-foreground">$0.20 × {quantityNum} items</p>
                </div>
                <p className="font-semibold text-red-600">
                  -{formatCurrency(fees.listingFee)}
                </p>
              </div>
              <div className="flex justify-between py-2 border-b">
                <div>
                  <p className="font-medium">Transaction Fee</p>
                  <p className="text-sm text-muted-foreground">6.5% of item total</p>
                </div>
                <p className="font-semibold text-red-600">
                  -{formatCurrency(fees.transactionFee)}
                </p>
              </div>
              <div className="flex justify-between py-2 border-b">
                <div>
                  <p className="font-medium">Payment Processing</p>
                  <p className="text-sm text-muted-foreground">3% + $0.25</p>
                </div>
                <p className="font-semibold text-red-600">
                  -{formatCurrency(fees.processingFee)}
                </p>
              </div>
              {discountNum > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Discount Applied</p>
                    <p className="text-sm text-muted-foreground">Coupon/sale</p>
                  </div>
                  <p className="font-semibold text-orange-600">
                    -{formatCurrency(discountNum)}
                  </p>
                </div>
              )}
              <div className="flex justify-between py-2 border-t-2 border-dashed">
                <p className="font-semibold">Total Fees</p>
                <p className="font-bold text-red-600">
                  -{formatCurrency(fees.totalFees)}
                </p>
              </div>
              <div className="flex justify-between py-2">
                <p className="font-semibold">Gross Revenue</p>
                <p className="font-bold">{formatCurrency(effectiveRevenue)}</p>
              </div>
              <div className="flex justify-between py-2 bg-muted -mx-6 px-6 rounded-b-lg">
                <p className="font-semibold">Net After Fees</p>
                <p className="font-bold text-lg text-green-600">
                  {formatCurrency(netAfterFees)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MarginCalculator() {
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [shipping, setShipping] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [discount, setDiscount] = useState("");

  const priceNum = parseValue(price);
  const costNum = parseValue(cost);
  const shippingNum = parseValue(shipping);
  const shippingCostNum = parseValue(shippingCost);
  const discountNum = parseValue(discount);

  const result = calculateNetRevenue(priceNum, 1, shippingNum, costNum + shippingCostNum, discountNum);

  const hasValues = priceNum > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Profit Margin Calculator
          </CardTitle>
          <CardDescription>
            Calculate your true profit after all costs and fees
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sellPrice">Selling Price ($)</Label>
            <Input
              id="sellPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 25.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="itemCost">Item Cost ($)</Label>
            <Input
              id="itemCost"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 8.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Materials, labor, packaging, etc.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingCharge">Shipping Charged ($)</Label>
            <Input
              id="shippingCharge"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 5.00"
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="actualShipping">Actual Shipping Cost ($)</Label>
            <Input
              id="actualShipping"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 4.00"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marginDiscount">Discount ($)</Label>
            <Input
              id="marginDiscount"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 2.00"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Coupon or sale discount applied
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profit Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasValues ? (
            <div className="text-center py-8 text-muted-foreground">
              Enter a selling price to see profit analysis
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <p className="font-medium">Gross Revenue</p>
                <p className="font-semibold">{formatCurrency(result.grossRevenue)}</p>
              </div>
              {discountNum > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <p className="font-medium">Discount Applied</p>
                  <p className="font-semibold text-orange-600">
                    -{formatCurrency(discountNum)}
                  </p>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <p className="font-medium">Etsy Fees</p>
                <p className="font-semibold text-red-600">
                  -{formatCurrency(result.fees.totalFees)}
                </p>
              </div>
              <div className="flex justify-between py-2 border-b">
                <p className="font-medium">Net After Fees</p>
                <p className="font-semibold">{formatCurrency(result.netRevenue)}</p>
              </div>
              <div className="flex justify-between py-2 border-b">
                <p className="font-medium">Product + Shipping Cost</p>
                <p className="font-semibold text-red-600">
                  -{formatCurrency(costNum + shippingCostNum)}
                </p>
              </div>
              <div className="flex justify-between py-2 bg-muted -mx-6 px-6">
                <p className="font-semibold">Profit</p>
                <p className={`font-bold text-lg ${result.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(result.profit)}
                </p>
              </div>
              <div className="flex justify-between py-2 bg-muted -mx-6 px-6 rounded-b-lg">
                <p className="font-semibold">Profit Margin</p>
                <p className={`font-bold text-lg ${result.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(result.margin)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PriceSimulator() {
  const [cost, setCost] = useState("");
  const [targetMargin, setTargetMargin] = useState("");
  const [shipping, setShipping] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [discount, setDiscount] = useState("");

  const costNum = parseValue(cost);
  const targetMarginNum = parseValue(targetMargin);
  const shippingNum = parseValue(shipping);
  const shippingCostNum = parseValue(shippingCost);
  const discountNum = parseValue(discount);

  // Calculate price needed for target margin
  const calculatePriceForMargin = () => {
    if (costNum <= 0 || targetMarginNum <= 0) return 0;

    // Iterative approach to find the right price
    let testPrice = costNum * 2; // Start with 2x cost

    for (let i = 0; i < 100; i++) {
      const result = calculateNetRevenue(testPrice, 1, shippingNum, costNum + shippingCostNum, discountNum);
      const difference = result.margin - targetMarginNum;

      if (Math.abs(difference) < 0.1) break;

      // Adjust price based on difference
      testPrice = testPrice * (1 + (difference > 0 ? -0.02 : 0.02));
    }

    return Math.ceil(testPrice * 100) / 100;
  };

  const suggestedPrice = calculatePriceForMargin();
  const priceResult = calculateNetRevenue(suggestedPrice, 1, shippingNum, costNum + shippingCostNum, discountNum);

  const pricePoints = suggestedPrice > 0 ? [
    { price: suggestedPrice * 0.8, label: "Budget" },
    { price: suggestedPrice, label: "Target" },
    { price: suggestedPrice * 1.2, label: "Premium" },
  ] : [];

  const hasValues = costNum > 0 && targetMarginNum > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Price Simulator
          </CardTitle>
          <CardDescription>
            Find the optimal price for your target profit margin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="simCost">Product Cost ($)</Label>
            <Input
              id="simCost"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 8.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="simMargin">Target Profit Margin (%)</Label>
            <Input
              id="simMargin"
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 40"
              value={targetMargin}
              onChange={(e) => setTargetMargin(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="simShipping">Shipping to Charge ($)</Label>
            <Input
              id="simShipping"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 5.00"
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="simShipCost">Actual Shipping Cost ($)</Label>
            <Input
              id="simShipCost"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 4.00"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="simDiscount">Expected Discount ($)</Label>
            <Input
              id="simDiscount"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 2.00"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Average discount you expect to offer
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Recommended Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasValues ? (
              <div className="text-center py-8 text-muted-foreground">
                Enter product cost and target margin to get a price recommendation
              </div>
            ) : (
              <>
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-primary">
                    {formatCurrency(suggestedPrice)}
                  </p>
                  <p className="text-muted-foreground mt-2">
                    For {formatPercent(targetMarginNum)} profit margin
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expected Profit</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(priceResult.profit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Etsy Fees</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(priceResult.fees.totalFees)}
                    </span>
                  </div>
                  {discountNum > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-orange-600">
                        -{formatCurrency(discountNum)}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            {!hasValues ? (
              <div className="text-center py-8 text-muted-foreground">
                Enter values to compare price points
              </div>
            ) : (
              <div className="space-y-4">
                {pricePoints.map(({ price, label }) => {
                  const result = calculateNetRevenue(price, 1, shippingNum, costNum + shippingCostNum, discountNum);
                  return (
                    <div
                      key={label}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        label === "Target" ? "bg-primary/10 border border-primary" : "bg-muted"
                      }`}
                    >
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${result.margin >= targetMarginNum ? 'text-green-600' : 'text-yellow-600'}`}>
                          {formatPercent(result.margin)} margin
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(result.profit)} profit
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
