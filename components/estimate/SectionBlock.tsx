"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineItemRow } from "./LineItemRow";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { ChevronDown, ChevronRight, Trash2, Plus } from "lucide-react";
import type { EstimateLineItem, CatalogItem, Assembly } from "@/types/db";

interface Props {
  name: string;
  sectionId: string | null;
  items: EstimateLineItem[];
  catalogItems: (CatalogItem & { category: { name: string } | null })[];
  assemblies: (Assembly & { components: any[] })[];
  onUpdateItem: (id: string, updates: Partial<EstimateLineItem>) => void;
  onDeleteItem: (id: string) => void;
  onUpdateName?: (name: string) => void;
  onDelete?: () => void;
  onAddFromCatalog: (item: CatalogItem) => void;
  onAddAssembly: (assembly: Assembly & { components: any[] }) => void;
}

export function SectionBlock({
  name, sectionId, items, catalogItems, assemblies,
  onUpdateItem, onDeleteItem, onUpdateName, onDelete,
  onAddFromCatalog, onAddAssembly,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);

  const sectionTotal = items.reduce((sum, l) => sum + l.unit_price * l.quantity, 0);
  const sectionHours = items.reduce((sum, l) => sum + l.labor_hours, 0);

  function commitName() {
    setEditing(false);
    if (editName.trim() && editName !== name) onUpdateName?.(editName.trim());
  }

  return (
    <div className="rounded-md border">
      {/* Section header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b">
        <button onClick={() => setCollapsed((c) => !c)} className="text-muted-foreground hover:text-foreground">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {editing ? (
          <Input value={editName} onChange={(e) => setEditName(e.target.value)}
            onBlur={commitName} onKeyDown={(e) => e.key === "Enter" && commitName()}
            className="h-7 text-sm font-medium flex-1" autoFocus />
        ) : (
          <span className="flex-1 text-sm font-semibold cursor-pointer" onDoubleClick={() => setEditing(true)}>
            {name}
          </span>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {sectionHours > 0 && `${sectionHours.toFixed(1)} hrs · `}
          ${sectionTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        {onDelete && (
          <button onClick={onDelete} className="text-muted-foreground hover:text-destructive ml-1">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {!collapsed && (
        <div>
          {/* Column headers */}
          {items.length > 0 && (
            <div className="grid grid-cols-[1fr_70px_80px_80px_80px_80px_32px] gap-1 px-3 py-1 text-xs text-muted-foreground border-b bg-muted/20">
              <span>Item</span><span className="text-center">Qty</span>
              <span className="text-right">Unit Cost</span>
              <span className="text-right">Unit Price</span>
              <span className="text-right">Labor Hrs</span>
              <span className="text-right">Total</span>
              <span />
            </div>
          )}

          {items.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground italic">
              No items. Search catalog below to add.
            </p>
          )}

          {items.map((item) => (
            <LineItemRow key={item.id} item={item}
              onUpdate={(updates) => onUpdateItem(item.id, updates)}
              onDelete={() => onDeleteItem(item.id)} />
          ))}

          {/* Add controls */}
          <div className="px-3 py-2 border-t bg-muted/20">
            <CatalogSearch catalogItems={catalogItems} assemblies={assemblies}
              onSelectItem={onAddFromCatalog} onSelectAssembly={onAddAssembly} />
          </div>
        </div>
      )}
    </div>
  );
}
