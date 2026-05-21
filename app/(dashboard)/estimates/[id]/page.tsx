import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EstimateBuilder } from "@/components/estimate/EstimateBuilder";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EstimatePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: estimate },
    { data: sections },
    { data: lineItems },
    { data: customers },
    { data: catalogItems },
    { data: assemblies },
  ] = await Promise.all([
    supabase.from("estimates").select("*, customer:customers(id,name)").eq("id", id).single(),
    supabase.from("estimate_sections").select("*").eq("estimate_id", id).order("sort_order"),
    supabase.from("estimate_line_items").select("*").eq("estimate_id", id).order("sort_order"),
    supabase.from("customers").select("id, name").order("name"),
    supabase.from("catalog_items").select("*, category:catalog_categories(name)").eq("is_active", true).order("name"),
    supabase.from("assemblies").select("*, components:assembly_components(*, catalog_item:catalog_items(name,unit_cost,labor_hours))").eq("is_active", true).order("name"),
  ]);

  if (!estimate) notFound();

  return (
    <EstimateBuilder
      estimate={estimate as any}
      sections={sections ?? []}
      lineItems={lineItems ?? []}
      customers={customers ?? []}
      catalogItems={catalogItems as any ?? []}
      assemblies={assemblies as any ?? []}
    />
  );
}
