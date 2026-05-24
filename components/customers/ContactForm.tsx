"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Contact, CustomerLocation } from "@/types/db";

interface Props {
  trigger: React.ReactElement;
  customerId: string;
  locations: CustomerLocation[];
  contact?: Contact;
}

export function ContactForm({ trigger, customerId, locations, contact }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: contact?.name ?? "",
    title: contact?.title ?? "",
    email: contact?.email ?? "",
    phone: contact?.phone ?? "",
    location_id: contact?.location_id ?? "",
    is_primary: contact?.is_primary ?? false,
  });

  function set(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    if (form.is_primary) {
      const { error: e1 } = await supabase.from("contacts")
        .update({ is_primary: false })
        .eq("customer_id", customerId);
      if (e1) { setError(e1.message); setSaving(false); return; }
    }

    const payload = {
      customer_id: customerId,
      name: form.name,
      title: form.title || null,
      email: form.email || null,
      phone: form.phone || null,
      location_id: form.location_id || null,
      is_primary: form.is_primary,
    };

    const { error: e2 } = contact
      ? await supabase.from("contacts").update(payload).eq("id", contact.id)
      : await supabase.from("contacts").insert(payload);
    setSaving(false);
    if (e2) { setError(e2.message); return; }
    setError(null);
    setOpen(false);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger}></SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{contact ? "Edit Contact" : "Add Contact"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} required autoFocus />
          </div>
          <div className="space-y-2">
            <Label>Title / Role</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Project Manager, Facilities Director" />
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
            <Label>Associated Location</Label>
            <Select value={form.location_id} onValueChange={(v) => set("location_id", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Company-level (no specific site)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Company-level</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.label || loc.type} {loc.city ? `— ${loc.city}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_primary" checked={form.is_primary}
              onChange={(e) => set("is_primary", e.target.checked)}
              className="h-4 w-4 rounded border-border" />
            <Label htmlFor="is_primary" className="cursor-pointer">Primary contact for this customer</Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
