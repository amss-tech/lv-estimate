"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { EstimateLineItem } from "@/types/db";

interface Props {
  lineItems: EstimateLineItem[];
  overheadPct: number;
  profitPct: number;
  laborRate: number;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function fmtHrs(n: number) {
  return `${n.toFixed(1)} hrs`;
}

export function CostSummary({ lineItems, overheadPct, profitPct, laborRate }: Props) {
  const materialCost = lineItems
    .filter((l) => l.type !== "labor")
    .reduce((sum, l) => sum + l.unit_cost * l.quantity, 0);

  const laborHours = lineItems.reduce((sum, l) => sum + l.labor_hours, 0);
  const laborCost = laborHours * laborRate;

  const directCost = materialCost + laborCost;
  const overhead = directCost * (overheadPct / 100);
  const subtotal = directCost + overhead;
  const profit = subtotal * (profitPct / 100);
  const sellPrice = subtotal + profit;

  const marginPct = sellPrice > 0 ? (profit / sellPrice) * 100 : 0;

  const rows = [
    { label: "Material Cost", value: fmt(materialCost) },
    { label: "Labor Cost", value: fmt(laborCost), sub: fmtHrs(laborHours) },
    { label: "Direct Cost", value: fmt(directCost), bold: true },
    { label: `Overhead (${overheadPct}%)`, value: fmt(overhead) },
    { label: "Subtotal", value: fmt(subtotal) },
    { label: `Profit (${profitPct}%)`, value: fmt(profit) },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Cost Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {rows.map(({ label, value, sub, bold }) => (
          <div key={label} className={`flex justify-between ${bold ? "font-semibold" : "text-muted-foreground"}`}>
            <span>{label}</span>
            <span className={bold ? "" : "text-foreground"}>{value}
              {sub && <span className="ml-1 text-xs text-muted-foreground">({sub})</span>}
            </span>
          </div>
        ))}
        <Separator className="my-2" />
        <div className="flex justify-between font-bold text-base">
          <span>Sell Price</span>
          <span>{fmt(sellPrice)}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Gross Margin</span>
          <span>{marginPct.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Labor Hours</span>
          <span>{fmtHrs(laborHours)}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Line Items</span>
          <span>{lineItems.length}</span>
        </div>
      </CardContent>
    </Card>
  );
}
