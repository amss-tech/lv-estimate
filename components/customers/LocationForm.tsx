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
import type { CustomerLocation, LocationType } from "@/types/db";

interface Props {
  trigger: React.ReactElement;
  customerId: string;
  location?: CustomerLocation;
  existingTypes: LocationType[];
}

export function LocationForm({ trigger, customerId, location, existingTypes }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: location?.type ?? "site",
    label: location?.label ?? "",
    address: location?.address ?? "",
    city: location?.city ?? "",
    state: location?.state ?? "",
    zip: location?.zip ?? "",
    phone: location?.phone ?? "",
    email: location?.email ?? "",
    notes: location?.notes ?? "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const typeOptions: { value: LocationType; label: string }[] = [
    { value: "main", label: "Main Office" },
    { value: "billing", label: "Billing" },
    { value: "site", label: "Job Site" },
  ];

  const typeConflict = (t: LocationType) =>
    (t === "main" || t === "billing") &&
    existingTypes.includes(t) &&
    location?.type !== t;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const payload = {
      customer_id: customerId,
      type: form.type as LocationType,
      label: form.label || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      zip: form.zip || null,
      phone: form.phone || null,
      email: form.email || null,
      notes: form.notes || null,
    };
    const { error: err } = location
      ? await supabase.from("customer_locations").update(payload).eq("id", location.id)
      : await supabase.from("customer_locations").insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setError(null);
    setOpen(false);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger}></SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{location ? "Edit Location" : "Add Location"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => v && set("type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {typeOptions.map(({ value, label }) => (
                  <SelectItem key={value} value={value} disabled={typeConflict(value)}>
                    {label}{typeConflict(value) ? " (already exists)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Label / Name</Label>
            <Input value={form.label} onChange={(e) => set("label", e.target.value)}
              placeholder={form.type === "site" ? "e.g. North Warehouse, Site A" : ""} />
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
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
