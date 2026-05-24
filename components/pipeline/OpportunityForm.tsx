"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Opportunity, OpportunityStage, Customer, Estimate } from "@/types/db";

const STAGES: { id: OpportunityStage; label: string }[] = [
  { id: "lead", label: "Lead" },
  { id: "proposal_sent", label: "Proposal Sent" },
  { id: "negotiation", label: "Negotiation" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (opp: Opportunity & { customer: { name: string } | null }) => void;
  onDeleted?: (id: string) => void;
  defaultStage?: OpportunityStage;
  opportunity?: Opportunity & { customer: { name: string } | null };
  customers: Pick<Customer, "id" | "name">[];
  estimates: Pick<Estimate, "id" | "name" | "customer_id">[];
}

export function OpportunityForm({ open, onClose, onSaved, onDeleted, defaultStage = "lead", opportunity, customers, estimates }: Props) {
  const [form, setForm] = useState({
    name: opportunity?.name ?? "",
    customer_id: opportunity?.customer_id ?? "",
    estimate_id: opportunity?.estimate_id ?? "",
    value: opportunity?.value?.toString() ?? "",
    stage: opportunity?.stage ?? defaultStage,
    probability: opportunity?.probability?.toString() ?? "",
    expected_close: opportunity?.expected_close ?? "",
    assigned_to: opportunity?.assigned_to ?? "",
    notes: opportunity?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const filteredEstimates = form.customer_id
    ? estimates.filter((e) => e.customer_id === form.customer_id)
    : estimates;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: form.name.trim(),
      customer_id: form.customer_id || null,
      estimate_id: form.estimate_id || null,
      value: form.value ? parseFloat(form.value) : null,
      stage: form.stage,
      probability: form.probability ? parseInt(form.probability) : null,
      expected_close: form.expected_close || null,
      assigned_to: form.assigned_to.trim() || null,
      notes: form.notes.trim() || null,
    };

    if (opportunity) {
      const { data, error: err } = await supabase.from("opportunities").update(payload).eq("id", opportunity.id)
        .select("*, customer:customers(name)").single();
      setSaving(false);
      if (err) { setError(err.message); return; }
      if (data) { setError(null); onSaved(data as any); onClose(); }
    } else {
      const { data, error: err } = await supabase.from("opportunities").insert(payload)
        .select("*, customer:customers(name)").single();
      setSaving(false);
      if (err) { setError(err.message); return; }
      if (data) { setError(null); onSaved(data as any); onClose(); }
    }
  }

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    const supabase = createClient();
    const { error } = await supabase.from("opportunities").delete().eq("id", opportunity!.id);
    if (error) { alert(error.message); return; }
    onDeleted?.(opportunity!.id);
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{opportunity ? "Edit Opportunity" : "New Opportunity"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} required autoFocus />
          </div>
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select value={form.customer_id} onValueChange={(v) => { set("customer_id", v === "none" ? "" : (v ?? "")); set("estimate_id", ""); }}>
              <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— No customer —</SelectItem>
                {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Estimate</Label>
            <Select value={form.estimate_id} onValueChange={(v) => set("estimate_id", v === "none" ? "" : (v ?? ""))}>
              <SelectTrigger><SelectValue placeholder="Link an estimate (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— No estimate —</SelectItem>
                {filteredEstimates.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Value ($)</Label>
              <Input type="number" min={0} step={100} value={form.value} onChange={(e) => set("value", e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Probability (%)</Label>
              <Input type="number" min={0} max={100} value={form.probability} onChange={(e) => set("probability", e.target.value)} placeholder="50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select value={form.stage} onValueChange={(v) => v && set("stage", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Expected Close</Label>
              <Input type="date" value={form.expected_close} onChange={(e) => set("expected_close", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Assigned To</Label>
            <Input value={form.assigned_to} onChange={(e) => set("assigned_to", e.target.value)} placeholder="Name or initials" />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-between gap-2 pt-2">
            <div>
              {opportunity && (
                <Button type="button" variant="destructive" size="sm" onClick={handleDelete} onBlur={() => setConfirming(false)}>
                  {confirming ? "Confirm Delete" : "Delete"}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
