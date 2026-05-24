import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { LocationForm } from "@/components/customers/LocationForm";
import { ContactForm } from "@/components/customers/ContactForm";
import { NewEstimateFromCustomer } from "@/components/customers/NewEstimateFromCustomer";
import { DeleteLocation } from "@/components/customers/DeleteLocation";
import { DeleteContact } from "@/components/customers/DeleteContact";
import { Plus, MapPin, Phone, Mail, User, Pencil, ChevronLeft, Building2 } from "lucide-react";
import type { LocationType } from "@/types/db";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-yellow-500/20 text-yellow-600",
  approved: "bg-blue-500/20 text-blue-600",
  won: "bg-green-500/20 text-green-700",
  lost: "bg-red-500/20 text-red-600",
};

const locationTypeLabel: Record<LocationType, string> = {
  main: "Main Office",
  billing: "Billing",
  site: "Job Site",
};

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: customer }, { data: locations }, { data: contacts }, { data: estimates }] =
    await Promise.all([
      supabase.from("customers").select("*").eq("id", id).single(),
      supabase.from("customer_locations").select("*").eq("customer_id", id).order("sort_order").order("created_at"),
      supabase.from("contacts").select("*, location:customer_locations(id,label,type,city)").eq("customer_id", id).order("is_primary", { ascending: false }).order("name"),
      supabase.from("estimates").select("id, name, status, updated_at, site_location:customer_locations(label)").eq("customer_id", id).order("updated_at", { ascending: false }),
    ]);

  if (!customer) notFound();

  const existingTypes = (locations ?? []).map((l) => l.type as LocationType);

  const grouped = {
    main: (locations ?? []).filter((l) => l.type === "main"),
    billing: (locations ?? []).filter((l) => l.type === "billing"),
    site: (locations ?? []).filter((l) => l.type === "site"),
  };

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/customers" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ChevronLeft className="h-4 w-4" />Customers
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <Badge variant="outline" className="capitalize">{customer.type}</Badge>
          </div>
          {customer.notes && <p className="text-sm text-muted-foreground mt-1 max-w-xl">{customer.notes}</p>}
        </div>
        <CustomerForm
          trigger={<Button variant="outline" size="sm"><Pencil className="h-4 w-4 mr-1" />Edit</Button>}
          customer={customer}
        />
      </div>

      {/* Locations */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Locations</h2>
          <LocationForm
            trigger={<Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" />Add Location</Button>}
            customerId={id}
            existingTypes={existingTypes}
          />
        </div>

        {(locations ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground italic">No locations yet. Add a main office, billing address, or job site.</p>
        )}

        {(["main", "billing", "site"] as LocationType[]).map((type) =>
          grouped[type].length === 0 ? null : (
            <div key={type}>
              <p className="text-xs font-medium text-muted-foreground mb-2">{locationTypeLabel[type]}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {grouped[type].map((loc) => (
                  <div key={loc.id} className="border rounded-lg p-4 space-y-1 bg-card">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{loc.label || locationTypeLabel[loc.type as LocationType]}</p>
                      <div className="flex gap-1 shrink-0">
                        <LocationForm
                          trigger={<button className="p-1 text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>}
                          customerId={id}
                          location={loc}
                          existingTypes={existingTypes}
                        />
                        <DeleteLocation locationId={loc.id} />
                      </div>
                    </div>
                    {(loc.address || loc.city) && (
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>{[loc.address, loc.city, loc.state, loc.zip].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                    {loc.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />{loc.phone}
                      </div>
                    )}
                    {loc.email && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />{loc.email}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </section>

      {/* Contacts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contacts</h2>
          <ContactForm
            trigger={<Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" />Add Contact</Button>}
            customerId={id}
            locations={locations ?? []}
          />
        </div>

        {(contacts ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground italic">No contacts yet.</p>
        )}

        {(contacts ?? []).length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Name</th>
                  <th className="text-left px-4 py-2 font-medium">Title</th>
                  <th className="text-left px-4 py-2 font-medium">Email</th>
                  <th className="text-left px-4 py-2 font-medium">Phone</th>
                  <th className="text-left px-4 py-2 font-medium">Location</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(contacts ?? []).map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        {c.name}
                        {c.is_primary && <Badge className="text-xs py-0">Primary</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.title ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {(c.location as any)?.label || (c.location as any)?.type ? (
                        <span>{(c.location as any).label || locationTypeLabel[(c.location as any).type as LocationType]} {(c.location as any).city ? `· ${(c.location as any).city}` : ""}</span>
                      ) : "Company-level"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <ContactForm
                          trigger={<button className="p-1 text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>}
                          customerId={id}
                          locations={locations ?? []}
                          contact={c as any}
                        />
                        <DeleteContact contactId={c.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Estimates history */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Estimates</h2>
          <NewEstimateFromCustomer customerId={id} customerName={customer.name} />
        </div>

        {(estimates ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground italic">No estimates yet.</p>
        )}

        {(estimates ?? []).length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Estimate</th>
                  <th className="text-left px-4 py-2 font-medium">Job Site</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(estimates ?? []).map((est) => (
                  <tr key={est.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/estimates/${est.id}`} className="font-medium hover:underline">{est.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {(est.site_location as any)?.label ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[est.status] ?? ""}`}>
                        {est.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(est.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
