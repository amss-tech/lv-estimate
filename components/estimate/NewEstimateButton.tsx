"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function NewEstimateButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("estimates")
      .insert({ name: name.trim(), status: "draft", overhead_pct: 10, profit_pct: 15 })
      .select("id")
      .single();
    setSaving(false);
    setOpen(false);
    if (data) router.push(`/estimates/${data.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<span />}>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Estimate</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Estimate</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Estimate Name *</Label>
            <Input placeholder="e.g. Acme Corp — Camera System" value={name}
              onChange={(e) => setName(e.target.value)} autoFocus required />
          </div>
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
