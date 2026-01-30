"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatPercent, calculateNetRevenue, calculateEtsyFees } from "@/lib/utils";
import { Calculator, DollarSign, TrendingUp, Receipt } from "lucide-react";

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
  const [price, setPrice] = useState(25);
  const [quantity, setQuantity] = useState(1);
  const [shipping, setShipping] = useState(5);

  const fees = calculateEtsyFees(price, quantity);
  const totalRevenue = price * quantity + shipping;
  const netAfterFees = totalRevenue - fees.totalFees;

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
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping">Shipping Collected ($)</Label>
            <Input
              id="shipping"
              type="number"
              min="0"
              step="0.01"
              value={shipping}
              onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fee Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <div>
                <p className="font-medium">Listing Fee</p>
                <p className="text-sm text-muted-foreground">$0.20 × {quantity} items</p>
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
            <div className="flex justify-between py-2 border-t-2 border-dashed">
              <p className="font-semibold">Total Fees</p>
              <p className="font-bold text-red-600">
                -{formatCurrency(fees.totalFees)}
              </p>
            </div>
            <div className="flex justify-between py-2">
              <p className="font-semibold">Gross Revenue</p>
              <p className="font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="flex justify-between py-2 bg-muted -mx-6 px-6 rounded-b-lg">
              <p className="font-semibold">Net After Fees</p>
              <p className="font-bold text-lg text-green-600">
                {formatCurrency(netAfterFees)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MarginCalculator() {
  const [price, setPrice] = useState(25);
  const [cost, setCost] = useState(8);
  const [shipping, setShipping] = useState(5);
  const [shippingCost, setShippingCost] = useState(4);

  const result = calculateNetRevenue(price, 1, shipping, cost + shippingCost);

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
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="itemCost">Item Cost ($)</Label>
            <Input
              id="itemCost"
              type="number"
              min="0"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
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
              value={shipping}
              onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="actualShipping">Actual Shipping Cost ($)</Label>
            <Input
              id="actualShipping"
              type="number"
              min="0"
              step="0.01"
              value={shippingCost}
              onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profit Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <p className="font-medium">Gross Revenue</p>
              <p className="font-semibold">{formatCurrency(result.grossRevenue)}</p>
            </div>
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
                -{formatCurrency(cost + shippingCost)}
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
        </CardContent>
      </Card>
    </div>
  );
}

function PriceSimulator() {
  const [cost, setCost] = useState(8);
  const [targetMargin, setTargetMargin] = useState(40);
  const [shipping, setShipping] = useState(5);
  const [shippingCost, setShippingCost] = useState(4);

  // Calculate price needed for target margin
  // profit = grossRevenue - fees - costs
  // margin = profit / grossRevenue * 100
  // We need to solve for price where margin = targetMargin

  const calculatePriceForMargin = () => {
    // Iterative approach to find the right price
    let testPrice = cost * 2; // Start with 2x cost

    for (let i = 0; i < 100; i++) {
      const result = calculateNetRevenue(testPrice, 1, shipping, cost + shippingCost);
      const difference = result.margin - targetMargin;

      if (Math.abs(difference) < 0.1) break;

      // Adjust price based on difference
      testPrice = testPrice * (1 + (difference > 0 ? -0.02 : 0.02));
    }

    return Math.ceil(testPrice * 100) / 100;
  };

  const suggestedPrice = calculatePriceForMargin();
  const priceResult = calculateNetRevenue(suggestedPrice, 1, shipping, cost + shippingCost);

  const pricePoints = [
    { price: suggestedPrice * 0.8, label: "Budget" },
    { price: suggestedPrice, label: "Target" },
    { price: suggestedPrice * 1.2, label: "Premium" },
  ];

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
              value={cost}
              onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="simMargin">Target Profit Margin (%)</Label>
            <Input
              id="simMargin"
              type="number"
              min="0"
              max="100"
              value={targetMargin}
              onChange={(e) => setTargetMargin(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="simShipping">Shipping to Charge ($)</Label>
            <Input
              id="simShipping"
              type="number"
              min="0"
              step="0.01"
              value={shipping}
              onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="simShipCost">Actual Shipping Cost ($)</Label>
            <Input
              id="simShipCost"
              type="number"
              min="0"
              step="0.01"
              value={shippingCost}
              onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
            />
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
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-primary">
                {formatCurrency(suggestedPrice)}
              </p>
              <p className="text-muted-foreground mt-2">
                For {formatPercent(targetMargin)} profit margin
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pricePoints.map(({ price, label }) => {
                const result = calculateNetRevenue(price, 1, shipping, cost + shippingCost);
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
                      <p className={`font-semibold ${result.margin >= targetMargin ? 'text-green-600' : 'text-yellow-600'}`}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
