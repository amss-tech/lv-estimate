"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface Props {
  customerId: string;
  customerName: string;
}

export function NewEstimateFromCustomer({ customerId, customerName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("estimates")
      .insert({ name: name.trim(), customer_id: customerId, status: "draft", overhead_pct: 10, profit_pct: 15 })
      .select("id")
      .single();
    setSaving(false);
    if (err) { setError(err.message); return; }
    setError(null);
    setOpen(false);
    if (data) router.push(`/estimates/${data.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="h-4 w-4 mr-1" />New Estimate
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Estimate for {customerName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Estimate Name *</Label>
            <Input placeholder="e.g. Camera System Phase 1"
              value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? "Creating…" : "Create & Open"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
