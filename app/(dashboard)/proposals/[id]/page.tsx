import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download } from "lucide-react";
import { ProposalActions } from "@/components/proposals/ProposalActions";
import type { ProposalStatus } from "@/types/db";

const statusColors: Record<ProposalStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-yellow-500/20 text-yellow-600",
  viewed: "bg-blue-500/20 text-blue-600",
  signed: "bg-green-500/20 text-green-700",
  rejected: "bg-red-500/20 text-red-600",
};

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: proposal }, { data: laborRateSetting }] = await Promise.all([
    supabase.from("proposals")
      .select(`
        *,
        customer:customers(id, name),
        estimate:estimates(
          id, name, overhead_pct, profit_pct, site_location_id,
          site_location:customer_locations(label, type, address, city, state, zip),
          sections:estimate_sections(id, name, sort_order),
          line_items:estimate_line_items(*)
        )
      `)
      .eq("id", id)
      .single(),
    supabase.from("company_settings").select("value").eq("key", "labor_rate_per_hour").single(),
  ]);

  if (!proposal) notFound();

  const est = proposal.estimate as any;
  const laborRate = parseFloat(laborRateSetting?.value ?? "85");
  const overheadPct = est?.overhead_pct ?? 10;
  const profitPct = est?.profit_pct ?? 15;
  const lineItems: any[] = est?.line_items ?? [];
  const sections: any[] = (est?.sections ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order);

  const materialCost = lineItems.filter((l) => l.type !== "labor").reduce((s: number, l: any) => s + l.unit_cost * l.quantity, 0);
  const laborHours = lineItems.reduce((s: number, l: any) => s + l.labor_hours, 0);
  const laborCost = laborHours * laborRate;
  const directCost = materialCost + laborCost;
  const overhead = directCost * (overheadPct / 100);
  const subtotal = directCost + overhead;
  const profit = subtotal * (profitPct / 100);
  const sellPrice = subtotal + profit;

  const siteLocation = est?.site_location as any;
  const customer = proposal.customer as any;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <div>
        <Link href="/proposals" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ChevronLeft className="h-4 w-4" />Proposals
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{proposal.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
              {customer?.name && <span>{customer.name}</span>}
              {siteLocation && (
                <span>· {siteLocation.label || siteLocation.type}{siteLocation.city ? `, ${siteLocation.city}` : ""}</span>
              )}
              {proposal.valid_until && (
                <span>· Valid until {new Date(proposal.valid_until).toLocaleDateString()}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium capitalize ${statusColors[proposal.status as ProposalStatus]}`}>
              {proposal.status}
            </span>
            <a href={`/api/proposals/${id}/pdf`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-1" />PDF
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Status actions */}
      <ProposalActions proposalId={id} status={proposal.status as ProposalStatus} />

      {/* Terms */}
      {proposal.terms && (
        <section className="border rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-line">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Terms & Conditions</p>
          {proposal.terms}
        </section>
      )}

      {/* Line items by section */}
      {est && (
        <section className="space-y-4">
          {sections.map((sec: any) => {
            const items = lineItems.filter((l) => l.section_id === sec.id);
            if (items.length === 0) return null;
            const sectionTotal = items.reduce((s: number, l: any) => s + l.unit_price * l.quantity, 0);
            return (
              <div key={sec.id} className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 flex justify-between items-center">
                  <span className="font-semibold text-sm">{sec.name}</span>
                  <span className="text-sm text-muted-foreground">{fmt(sectionTotal)}</span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-muted/20 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Item</th>
                      <th className="px-4 py-2 text-center font-medium">Qty</th>
                      <th className="px-4 py-2 text-center font-medium">Unit</th>
                      <th className="px-4 py-2 text-right font-medium">Unit Price</th>
                      <th className="px-4 py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2 text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-center text-muted-foreground">{item.unit}</td>
                        <td className="px-4 py-2 text-right">{fmt(item.unit_price)}</td>
                        <td className="px-4 py-2 text-right font-medium">{fmt(item.unit_price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}

          {/* Unsectioned items */}
          {(() => {
            const items = lineItems.filter((l) => !l.section_id);
            if (items.length === 0) return null;
            return (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Item</th>
                      <th className="px-4 py-2 text-center font-medium">Qty</th>
                      <th className="px-4 py-2 text-center font-medium">Unit</th>
                      <th className="px-4 py-2 text-right font-medium">Unit Price</th>
                      <th className="px-4 py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2 text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-center text-muted-foreground">{item.unit}</td>
                        <td className="px-4 py-2 text-right">{fmt(item.unit_price)}</td>
                        <td className="px-4 py-2 text-right font-medium">{fmt(item.unit_price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </section>
      )}

      {/* Cost totals */}
      <section className="border rounded-lg p-4 space-y-2 text-sm max-w-xs ml-auto">
        <div className="flex justify-between text-muted-foreground"><span>Material Cost</span><span>{fmt(materialCost)}</span></div>
        <div className="flex justify-between text-muted-foreground"><span>Labor Cost</span><span>{fmt(laborCost)}</span></div>
        <div className="flex justify-between font-semibold border-t pt-2"><span>Direct Cost</span><span>{fmt(directCost)}</span></div>
        <div className="flex justify-between text-muted-foreground"><span>Overhead ({overheadPct}%)</span><span>{fmt(overhead)}</span></div>
        <div className="flex justify-between text-muted-foreground"><span>Profit ({profitPct}%)</span><span>{fmt(profit)}</span></div>
        <div className="flex justify-between font-bold text-base border-t pt-2"><span>Sell Price</span><span>{fmt(sellPrice)}</span></div>
      </section>

      {/* Signed note */}
      {proposal.signed_at && (
        <p className="text-sm text-green-600 font-medium">
          Signed on {new Date(proposal.signed_at).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
