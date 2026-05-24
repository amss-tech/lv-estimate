"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SectionBlock } from "./SectionBlock";
import { CostSummary } from "./CostSummary";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { Plus, Save, FileText } from "lucide-react";
import type { Estimate, EstimateSection, EstimateLineItem, Customer, CatalogItem, Assembly, CustomerLocation } from "@/types/db";

interface Props {
  estimate: Estimate & { customer: { id: string; name: string } | null };
  sections: EstimateSection[];
  lineItems: EstimateLineItem[];
  customers: Pick<Customer, "id" | "name">[];
  catalogItems: (CatalogItem & { category: { name: string } | null })[];
  assemblies: (Assembly & { components: any[] })[];
  siteLocations: Pick<CustomerLocation, "id" | "label" | "type" | "city">[];
  laborRate: number;
}

export function EstimateBuilder({ estimate, sections: initSections, lineItems: initItems, customers, catalogItems, assemblies, siteLocations, laborRate }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(estimate.name);
  const [customerId, setCustomerId] = useState(estimate.customer_id ?? "");
  const [siteLocationId, setSiteLocationId] = useState<string>(estimate.site_location_id ?? "");
  const [overheadPct, setOverheadPct] = useState(estimate.overhead_pct);
  const [profitPct, setProfitPct] = useState(estimate.profit_pct);
  const [status, setStatus] = useState(estimate.status);
  const [sections, setSections] = useState<EstimateSection[]>(initSections);
  const [lineItems, setLineItems] = useState<EstimateLineItem[]>(initItems);
  const [saving, setSaving] = useState(false);

  // Proposal sheet state
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalTitle, setProposalTitle] = useState(estimate.name);
  const [proposalValidUntil, setProposalValidUntil] = useState("");
  const [proposalTerms, setProposalTerms] = useState("");
  const [proposalSaving, setProposalSaving] = useState(false);

  async function saveHeader() {
    setSaving(true);
    await supabase.from("estimates").update({
      name,
      customer_id: customerId || null,
      site_location_id: siteLocationId || null,
      overhead_pct: overheadPct,
      profit_pct: profitPct,
      status,
    }).eq("id", estimate.id);
    setSaving(false);
    router.refresh();
  }

  async function handleGenerateProposal(e: React.FormEvent) {
    e.preventDefault();
    setProposalSaving(true);
    const { data } = await supabase.from("proposals").insert({
      estimate_id: estimate.id,
      customer_id: customerId || null,
      title: proposalTitle.trim(),
      status: "draft",
      valid_until: proposalValidUntil || null,
      terms: proposalTerms.trim() || null,
    }).select("id").single();
    setProposalSaving(false);
    setProposalOpen(false);
    if (data) router.push(`/proposals/${data.id}`);
  }

  async function addSection() {
    const { data } = await supabase.from("estimate_sections")
      .insert({ estimate_id: estimate.id, name: "New Section", sort_order: sections.length })
      .select().single();
    if (data) setSections((s) => [...s, data]);
  }

  const addLineItemFromCatalog = useCallback(async (item: CatalogItem, sectionId?: string) => {
    const unitPrice = item.unit_cost * (1 + (overheadPct + profitPct) / 100);
    const { data } = await supabase.from("estimate_line_items").insert({
      estimate_id: estimate.id,
      section_id: sectionId ?? null,
      type: "catalog_item",
      catalog_item_id: item.id,
      name: item.name,
      description: item.description ?? null,
      quantity: 1,
      unit: item.unit,
      unit_cost: item.unit_cost,
      unit_price: unitPrice,
      labor_hours: item.labor_hours,
      sort_order: lineItems.filter((l) => l.section_id === sectionId).length,
    }).select().single();
    if (data) setLineItems((l) => [...l, data]);
  }, [estimate.id, overheadPct, profitPct, lineItems, supabase]);

  const addAssembly = useCallback(async (assembly: Assembly & { components: any[] }, sectionId?: string) => {
    const rows = assembly.components.map((c, i) => {
      const unitCost = c.override_unit_cost ?? c.catalog_item?.unit_cost ?? 0;
      const unitPrice = unitCost * (1 + (overheadPct + profitPct) / 100);
      const laborHours = c.type === "labor" ? c.quantity : (c.catalog_item?.labor_hours ?? 0) * c.quantity;
      return {
        estimate_id: estimate.id,
        section_id: sectionId ?? null,
        type: c.type === "labor" ? "labor" : "catalog_item",
        catalog_item_id: c.catalog_item_id ?? null,
        assembly_id: assembly.id,
        name: c.type === "labor" ? (c.labor_description ?? "Labor") : (c.catalog_item?.name ?? "Item"),
        quantity: c.quantity,
        unit: c.type === "labor" ? "hr" : (c.catalog_item?.unit ?? "each"),
        unit_cost: unitCost,
        unit_price: unitPrice,
        labor_hours: laborHours,
        sort_order: lineItems.filter((l) => l.section_id === sectionId).length + i,
      };
    });
    const { data } = await supabase.from("estimate_line_items").insert(rows).select();
    if (data) setLineItems((l) => [...l, ...data]);
  }, [estimate.id, overheadPct, profitPct, lineItems, supabase]);

  async function duplicateLineItem(id: string) {
    const src = lineItems.find((l) => l.id === id);
    if (!src) return;
    const { id: _id, created_at: _ca, ...rest } = src;
    const { data } = await supabase.from("estimate_line_items").insert({
      ...rest,
      sort_order: src.sort_order + 1,
    }).select().single();
    if (data) setLineItems((l) => {
      const idx = l.findIndex((li) => li.id === id);
      const next = [...l];
      next.splice(idx + 1, 0, data);
      return next;
    });
  }

  async function updateLineItem(id: string, updates: Partial<EstimateLineItem>) {
    setLineItems((items) => items.map((l) => l.id === id ? { ...l, ...updates } : l));
    await supabase.from("estimate_line_items").update(updates).eq("id", id);
  }

  async function deleteLineItem(id: string) {
    setLineItems((items) => items.filter((l) => l.id !== id));
    await supabase.from("estimate_line_items").delete().eq("id", id);
  }

  async function updateSection(id: string, sectionName: string) {
    setSections((s) => s.map((sec) => sec.id === id ? { ...sec, name: sectionName } : sec));
    await supabase.from("estimate_sections").update({ name: sectionName }).eq("id", id);
  }

  async function deleteSection(id: string) {
    setSections((s) => s.filter((sec) => sec.id !== id));
    setLineItems((l) => l.filter((li) => li.section_id !== id));
    await supabase.from("estimate_sections").delete().eq("id", id);
  }

  const unsectionedItems = lineItems.filter((l) => !l.section_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <Input value={name} onChange={(e) => setName(e.target.value)}
            className="text-xl font-bold border-none p-0 h-auto focus-visible:ring-0 bg-transparent" />
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={customerId} onValueChange={(v) => v && setCustomerId(v)}>
              <SelectTrigger className="w-52 h-8 text-sm">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {siteLocations.length > 0 && (
              <Select value={siteLocationId} onValueChange={(v) => setSiteLocationId(v === "none" ? "" : (v ?? ""))}>
                <SelectTrigger className="w-48 h-8 text-sm">
                  <SelectValue placeholder="Job site (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific site</SelectItem>
                  {siteLocations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.label || loc.type}{loc.city ? ` — ${loc.city}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={status} onValueChange={(v) => v && setStatus(v as any)}>
              <SelectTrigger className="w-32 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["draft","review","approved","won","lost"].map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Overhead</span>
            <Input type="number" value={overheadPct} onChange={(e) => setOverheadPct(Number(e.target.value))}
              className="w-16 h-8 text-sm" min={0} max={100} />
            <span>%</span>
            <span className="ml-2">Profit</span>
            <Input type="number" value={profitPct} onChange={(e) => setProfitPct(Number(e.target.value))}
              className="w-16 h-8 text-sm" min={0} max={100} />
            <span>%</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => setProposalOpen(true)}>
            <FileText className="h-4 w-4 mr-1" />Proposal
          </Button>
          <Sheet open={proposalOpen} onOpenChange={setProposalOpen}>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader className="mb-4">
                <SheetTitle>Generate Proposal</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleGenerateProposal} className="space-y-4">
                <div className="space-y-2">
                  <Label>Proposal Title *</Label>
                  <Input value={proposalTitle} onChange={(e) => setProposalTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Valid Until</Label>
                  <Input type="date" value={proposalValidUntil} onChange={(e) => setProposalValidUntil(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Terms & Conditions</Label>
                  <Textarea value={proposalTerms} onChange={(e) => setProposalTerms(e.target.value)}
                    placeholder="Payment terms, warranty, exclusions…" rows={5} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setProposalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={proposalSaving}>
                    {proposalSaving ? "Creating…" : "Create & Open"}
                  </Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>
          <Button size="sm" onClick={saveHeader} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />{saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-4">
          {/* Unsectioned items */}
          {unsectionedItems.length > 0 && (
            <SectionBlock name="General" items={unsectionedItems} sectionId={null}
              onUpdateItem={updateLineItem} onDeleteItem={deleteLineItem} onDuplicateItem={duplicateLineItem}
              onAddFromCatalog={(item) => addLineItemFromCatalog(item)}
              onAddAssembly={(a) => addAssembly(a)}
              catalogItems={catalogItems} assemblies={assemblies} />
          )}

          {/* Named sections */}
          {sections.map((section) => (
            <SectionBlock key={section.id}
              name={section.name}
              sectionId={section.id}
              items={lineItems.filter((l) => l.section_id === section.id)}
              onUpdateItem={updateLineItem}
              onDeleteItem={deleteLineItem}
              onDuplicateItem={duplicateLineItem}
              onUpdateName={(n) => updateSection(section.id, n)}
              onDelete={() => deleteSection(section.id)}
              onAddFromCatalog={(item) => addLineItemFromCatalog(item, section.id)}
              onAddAssembly={(a) => addAssembly(a, section.id)}
              catalogItems={catalogItems}
              assemblies={assemblies}
            />
          ))}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addSection}>
              <Plus className="h-4 w-4 mr-1" />Add Section
            </Button>
            {sections.length === 0 && (
              <CatalogSearch catalogItems={catalogItems} assemblies={assemblies}
                onSelectItem={(item) => addLineItemFromCatalog(item)}
                onSelectAssembly={(a) => addAssembly(a)}
              />
            )}
          </div>
        </div>

        {/* Cost summary sidebar */}
        <div className="sticky top-6">
          <CostSummary lineItems={lineItems} overheadPct={overheadPct} profitPct={profitPct} laborRate={laborRate} />
        </div>
      </div>
    </div>
  );
}
