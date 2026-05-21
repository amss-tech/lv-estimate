"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Layers } from "lucide-react";
import type { CatalogItem, Assembly } from "@/types/db";

interface Props {
  catalogItems: (CatalogItem & { category: { name: string } | null })[];
  assemblies: (Assembly & { components: any[] })[];
  onSelectItem: (item: CatalogItem) => void;
  onSelectAssembly: (assembly: Assembly & { components: any[] }) => void;
}

export function CatalogSearch({ catalogItems, assemblies, onSelectItem, onSelectAssembly }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"items" | "assemblies">("items");

  const filteredItems = catalogItems.filter(
    (i) => !query || i.name.toLowerCase().includes(query.toLowerCase()) ||
      i.sku?.toLowerCase().includes(query.toLowerCase()) ||
      i.manufacturer?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 50);

  const filteredAssemblies = assemblies.filter(
    (a) => !query || a.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 30);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<span />}>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" />Add Item
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[520px] p-0" align="start">
        <div className="flex border-b">
          <button
            onClick={() => setTab("items")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === "items" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Catalog Items
          </button>
          <button
            onClick={() => setTab("assemblies")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === "assemblies" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Assemblies
          </button>
        </div>

        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "items" ? "Search by name, SKU, manufacturer…" : "Search assemblies…"}
              className="pl-7 h-8 text-sm" autoFocus />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto">
          {tab === "items" && (
            <>
              {filteredItems.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">No items found</p>
              )}
              {filteredItems.map((item) => (
                <button key={item.id} onClick={() => { onSelectItem(item); setOpen(false); setQuery(""); }}
                  className="w-full text-left px-3 py-2 hover:bg-accent transition-colors border-b last:border-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[item.manufacturer, item.sku].filter(Boolean).join(" · ")}
                        {item.category && ` · ${item.category.name}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">${item.unit_cost.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{item.unit} · {item.labor_hours}hrs</p>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {tab === "assemblies" && (
            <>
              {filteredAssemblies.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">No assemblies found</p>
              )}
              {filteredAssemblies.map((assembly) => (
                <button key={assembly.id} onClick={() => { onSelectAssembly(assembly); setOpen(false); setQuery(""); }}
                  className="w-full text-left px-3 py-2 hover:bg-accent transition-colors border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{assembly.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {assembly.components.length} components
                        {assembly.description && ` · ${assembly.description}`}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
