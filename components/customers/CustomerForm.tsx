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
import type { Customer } from "@/types/db";

interface Props {
  trigger: React.ReactNode;
  customer?: Customer;
}

export function CustomerForm({ trigger, customer }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: customer?.name ?? "",
    type: customer?.type ?? "commercial",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    address: customer?.address ?? "",
    city: customer?.city ?? "",
    state: customer?.state ?? "",
    zip: customer?.zip ?? "",
    notes: customer?.notes ?? "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const payload = { ...form, email: form.email || null, phone: form.phone || null,
      address: form.address || null, city: form.city || null, state: form.state || null,
      zip: form.zip || null, notes: form.notes || null };

    if (customer) {
      await supabase.from("customers").update(payload).eq("id", customer.id);
    } else {
      await supabase.from("customers").insert(payload);
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
          <SheetTitle>{customer ? "Edit Customer" : "New Customer"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Company Name *</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => v && set("type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["commercial","residential","government","industrial"].map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => set("state", e.target.value)} maxLength={2} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Zip</Label>
            <Input value={form.zip} onChange={(e) => set("zip", e.target.value)} className="w-32" />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
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
