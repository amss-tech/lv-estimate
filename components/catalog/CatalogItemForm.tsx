"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { CatalogCategory, CatalogItem } from "@/types/db";

interface Props {
  trigger: React.ReactNode;
  categories: CatalogCategory[];
  item?: CatalogItem;
}

export function CatalogItemForm({ trigger, categories, item }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: item?.name ?? "",
    sku: item?.sku ?? "",
    manufacturer: item?.manufacturer ?? "",
    model_number: item?.model_number ?? "",
    description: item?.description ?? "",
    category_id: item?.category_id ?? "",
    unit: item?.unit ?? "each",
    unit_cost: item?.unit_cost ?? 0,
    list_price: item?.list_price ?? "",
    labor_hours: item?.labor_hours ?? 0,
  });

  function set(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: form.name,
      sku: form.sku || null,
      manufacturer: form.manufacturer || null,
      model_number: form.model_number || null,
      description: form.description || null,
      category_id: form.category_id || null,
      unit: form.unit as any,
      unit_cost: Number(form.unit_cost),
      list_price: form.list_price ? Number(form.list_price) : null,
      labor_hours: Number(form.labor_hours),
    };
    if (item) {
      await supabase.from("catalog_items").update(payload).eq("id", item.id);
    } else {
      await supabase.from("catalog_items").insert(payload);
    }
    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger as React.ReactElement}></SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{item ? "Edit Item" : "New Catalog Item"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} required autoFocus />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category_id} onValueChange={(v) => v && set("category_id", v)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Manufacturer</Label>
              <Input value={form.manufacturer} onChange={(e) => set("manufacturer", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Model Number</Label>
              <Input value={form.model_number} onChange={(e) => set("model_number", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>SKU</Label>
            <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={form.unit} onValueChange={(v) => v && set("unit", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["each","ft","sqft","hr","lot","pr"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unit Cost ($)</Label>
              <Input type="number" step="0.01" value={form.unit_cost}
                onChange={(e) => set("unit_cost", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>List Price ($)</Label>
              <Input type="number" step="0.01" value={form.list_price}
                onChange={(e) => set("list_price", e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Default Labor Hours (per unit)</Label>
            <Input type="number" step="0.25" min="0" value={form.labor_hours}
              onChange={(e) => set("labor_hours", e.target.value)} className="w-32" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
