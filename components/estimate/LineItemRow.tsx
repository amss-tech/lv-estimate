"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { EstimateLineItem } from "@/types/db";

interface Props {
  item: EstimateLineItem;
  onUpdate: (updates: Partial<EstimateLineItem>) => void;
  onDelete: () => void;
}

export function LineItemRow({ item, onUpdate, onDelete }: Props) {
  const [qty, setQty] = useState(item.quantity);
  const [unitCost, setUnitCost] = useState(item.unit_cost);
  const [unitPrice, setUnitPrice] = useState(item.unit_price);
  const [laborHours, setLaborHours] = useState(item.labor_hours);

  function commitQty(v: number) {
    const val = Math.max(0, v);
    setQty(val);
    onUpdate({ quantity: val });
  }

  function commitUnitCost(v: number) {
    setUnitCost(v);
    onUpdate({ unit_cost: v });
  }

  function commitUnitPrice(v: number) {
    setUnitPrice(v);
    onUpdate({ unit_price: v });
  }

  function commitLaborHours(v: number) {
    const val = Math.max(0, v);
    setLaborHours(val);
    onUpdate({ labor_hours: val });
  }

  const total = unitPrice * qty;

  return (
    <div className="grid grid-cols-[1fr_70px_80px_80px_80px_80px_32px] gap-1 px-3 py-1.5 border-b last:border-0 hover:bg-muted/30 items-center text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium">{item.name}</p>
        {item.description && <p className="truncate text-xs text-muted-foreground">{item.description}</p>}
      </div>

      <NumInput value={qty} onChange={commitQty} className="text-center" step={1} />
      <NumInput value={unitCost} onChange={commitUnitCost} className="text-right" prefix="$" />
      <NumInput value={unitPrice} onChange={commitUnitPrice} className="text-right" prefix="$" />
      <NumInput value={laborHours} onChange={commitLaborHours} className="text-right" step={0.25} />

      <span className="text-right font-medium">
        ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>

      <button onClick={onDelete}
        className="text-muted-foreground hover:text-destructive transition-colors justify-self-center">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function NumInput({ value, onChange, className = "", prefix, step = 0.01 }: {
  value: number; onChange: (v: number) => void; className?: string; prefix?: string; step?: number;
}) {
  return (
    <div className="relative">
      {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">{prefix}</span>}
      <Input
        type="number"
        defaultValue={value}
        step={step}
        onBlur={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={`h-7 text-xs ${prefix ? "pl-4" : ""} ${className}`}
      />
    </div>
  );
}
