import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus, Layers } from "lucide-react";
import { AssemblyForm } from "@/components/catalog/AssemblyForm";

export default async function AssembliesPage() {
  const supabase = await createClient();
  const [{ data: assemblies }, { data: categories }, { data: catalogItems }] = await Promise.all([
    supabase.from("assemblies").select("*, components:assembly_components(*, catalog_item:catalog_items(name,unit,unit_cost,labor_hours))").eq("is_active", true).order("name"),
    supabase.from("catalog_categories").select("*").order("sort_order"),
    supabase.from("catalog_items").select("id,name,unit,unit_cost,labor_hours,category_id").eq("is_active", true).order("name"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assemblies</h1>
        <AssemblyForm categories={categories ?? []} catalogItems={catalogItems ?? []} trigger={
          <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Assembly</Button>
        } />
      </div>

      <div className="grid gap-3">
        {assemblies?.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No assemblies yet. Create your first to bundle common materials + labor into one click.
          </p>
        )}
        {assemblies?.map((a) => {
          const matCost = a.components.filter((c: any) => c.type === "material")
            .reduce((sum: number, c: any) => sum + (c.override_unit_cost ?? c.catalog_item?.unit_cost ?? 0) * c.quantity, 0);
          const laborHrs = a.components.reduce((sum: number, c: any) =>
            sum + (c.type === "labor" ? c.quantity : (c.catalog_item?.labor_hours ?? 0) * c.quantity), 0);

          return (
            <div key={a.id} className="rounded-md border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{a.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Mat: ${matCost.toFixed(2)}</span>
                  <span>Labor: {laborHrs.toFixed(2)} hrs</span>
                  <AssemblyForm categories={categories ?? []} catalogItems={catalogItems ?? []} assembly={a as any} trigger={
                    <Button variant="outline" size="sm">Edit</Button>
                  } />
                </div>
              </div>
              {a.description && <p className="text-sm text-muted-foreground mb-2">{a.description}</p>}
              <div className="space-y-1">
                {a.components.map((c: any) => (
                  <div key={c.id} className="text-xs text-muted-foreground flex gap-3">
                    <span className="w-16 shrink-0 uppercase font-mono">{c.type}</span>
                    <span>{c.type === "labor" ? c.labor_description : c.catalog_item?.name ?? "—"}</span>
                    <span className="ml-auto">× {c.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
