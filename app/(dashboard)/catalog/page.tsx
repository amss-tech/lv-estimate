import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import { CatalogItemForm } from "@/components/catalog/CatalogItemForm";
import { DeactivateCatalogItem } from "@/components/catalog/DeactivateCatalogItem";

export default async function CatalogPage() {
  const supabase = await createClient();
  const [{ data: items }, { data: categories }] = await Promise.all([
    supabase.from("catalog_items").select("*, category:catalog_categories(name)").eq("is_active", true).order("name"),
    supabase.from("catalog_categories").select("*").order("sort_order"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cost Catalog</h1>
        <CatalogItemForm categories={categories ?? []} trigger={
          <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Item</Button>
        } />
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Manufacturer</th>
              <th className="px-4 py-3 text-left font-medium">SKU</th>
              <th className="px-4 py-3 text-right font-medium">Unit Cost</th>
              <th className="px-4 py-3 text-center font-medium">Unit</th>
              <th className="px-4 py-3 text-right font-medium">Labor Hrs</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items?.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                No catalog items yet. Add your first item or import a CSV.
              </td></tr>
            )}
            {items?.map((item) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-4 py-2.5 font-medium">{item.name}</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {(item.category as { name: string } | null)?.name ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{item.manufacturer ?? "—"}</td>
                <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{item.sku ?? "—"}</td>
                <td className="px-4 py-2.5 text-right font-medium">${item.unit_cost.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-center"><Badge variant="outline">{item.unit}</Badge></td>
                <td className="px-4 py-2.5 text-right text-muted-foreground">{item.labor_hours}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1 justify-end">
                    <CatalogItemForm categories={categories ?? []} item={item as any} trigger={
                      <button className="p-1 text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                    } />
                    <DeactivateCatalogItem itemId={item.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
