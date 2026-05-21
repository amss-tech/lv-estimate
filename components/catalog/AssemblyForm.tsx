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
import { Plus, Trash2 } from "lucide-react";
import type { Assembly, AssemblyComponent, CatalogCategory, CatalogItem } from "@/types/db";

interface ComponentDraft {
  id?: string;
  type: "material" | "labor";
  catalog_item_id: string;
  labor_description: string;
  quantity: number;
  override_unit_cost: string;
}

interface Props {
  trigger: React.ReactNode;
  categories: CatalogCategory[];
  catalogItems: Pick<CatalogItem, "id" | "name" | "unit" | "unit_cost" | "labor_hours">[];
  assembly?: Assembly & { components: (AssemblyComponent & { catalog_item: any })[] };
}

export function AssemblyForm({ trigger, categories, catalogItems, assembly }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(assembly?.name ?? "");
  const [description, setDescription] = useState(assembly?.description ?? "");
  const [categoryId, setCategoryId] = useState(assembly?.category_id ?? "");
  const [components, setComponents] = useState<ComponentDraft[]>(
    assembly?.components.map((c) => ({
      id: c.id,
      type: c.type,
      catalog_item_id: c.catalog_item_id ?? "",
      labor_description: c.labor_description ?? "",
      quantity: c.quantity,
      override_unit_cost: c.override_unit_cost?.toString() ?? "",
    })) ?? []
  );

  function addComponent(type: "material" | "labor") {
    setComponents((c) => [...c, { type, catalog_item_id: "", labor_description: "", quantity: 1, override_unit_cost: "" }]);
  }

  function updateComponent(idx: number, field: string, value: unknown) {
    setComponents((cs) => cs.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  }

  function removeComponent(idx: number) {
    setComponents((cs) => cs.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const assemblyPayload = {
      name, description: description || null,
      category_id: categoryId || null,
    };

    let assemblyId = assembly?.id;
    if (assembly) {
      await supabase.from("assemblies").update(assemblyPayload).eq("id", assembly.id);
      await supabase.from("assembly_components").delete().eq("assembly_id", assembly.id);
    } else {
      const { data } = await supabase.from("assemblies").insert(assemblyPayload).select("id").single();
      assemblyId = data?.id;
    }

    if (assemblyId && components.length > 0) {
      await supabase.from("assembly_components").insert(
        components.map((c, i) => ({
          assembly_id: assemblyId!,
          type: c.type,
          catalog_item_id: c.type === "material" ? c.catalog_item_id || null : null,
          labor_description: c.type === "labor" ? c.labor_description || null : null,
          quantity: Number(c.quantity),
          override_unit_cost: c.override_unit_cost ? Number(c.override_unit_cost) : null,
          sort_order: i,
        }))
      );
    }

    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger as React.ReactElement}></SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{assembly ? "Edit Assembly" : "New Assembly"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Assembly Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Components</Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => addComponent("material")}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Material
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addComponent("labor")}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Labor
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {components.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Add material or labor rows above.</p>
              )}
              {components.map((c, i) => (
                <div key={i} className="flex gap-2 items-start border rounded-md p-2">
                  <div className="flex-1 space-y-2">
                    {c.type === "material" ? (
                      <Select value={c.catalog_item_id} onValueChange={(v) => v && updateComponent(i, "catalog_item_id", v)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select item" /></SelectTrigger>
                        <SelectContent>
                          {catalogItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input placeholder="Labor description" value={c.labor_description}
                        onChange={(e) => updateComponent(i, "labor_description", e.target.value)}
                        className="h-8 text-sm" />
                    )}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input type="number" step="0.25" min="0" placeholder="Qty"
                          value={c.quantity} onChange={(e) => updateComponent(i, "quantity", e.target.value)}
                          className="h-7 text-xs" />
                      </div>
                      <div className="flex-1">
                        <Input type="number" step="0.01" placeholder="Override cost"
                          value={c.override_unit_cost} onChange={(e) => updateComponent(i, "override_unit_cost", e.target.value)}
                          className="h-7 text-xs" />
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeComponent(i)}
                    className="text-muted-foreground hover:text-destructive mt-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Assembly"}</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
