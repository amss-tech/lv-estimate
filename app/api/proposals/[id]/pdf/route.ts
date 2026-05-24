export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ProposalPDF } from "@/lib/pdf/proposal-template";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: proposal }, { data: laborRateSetting }] = await Promise.all([
    supabase.from("proposals").select(`
      *,
      customer:customers(name),
      estimate:estimates(
        overhead_pct, profit_pct,
        site_location:customer_locations(label, type, address, city, state),
        sections:estimate_sections(id, name, sort_order),
        line_items:estimate_line_items(id, section_id, name, quantity, unit, unit_price, unit_cost, labor_hours, type)
      )
    `).eq("id", id).single(),
    supabase.from("company_settings" as any).select("value").eq("key", "labor_rate_per_hour").single(),
  ]);

  if (!proposal) return new NextResponse("Not found", { status: 404 });

  const est = proposal.estimate as any;
  const laborRate = parseFloat((laborRateSetting as any)?.value ?? "85");
  const overheadPct = est?.overhead_pct ?? 10;
  const profitPct = est?.profit_pct ?? 15;
  const lineItems: any[] = est?.line_items ?? [];
  const sections: any[] = est?.sections ?? [];
  const siteLocation = est?.site_location as any;
  const customer = proposal.customer as any;

  const materialCost = lineItems.filter((l) => l.type !== "labor").reduce((s: number, l: any) => s + l.unit_cost * l.quantity, 0);
  const laborHours = lineItems.reduce((s: number, l: any) => s + l.labor_hours, 0);
  const laborCost = laborHours * laborRate;
  const directCost = materialCost + laborCost;
  const overhead = directCost * (overheadPct / 100);
  const subtotal = directCost + overhead;
  const profit = subtotal * (profitPct / 100);
  const sellPrice = subtotal + profit;

  const buffer = await renderToBuffer(
    React.createElement(ProposalPDF, {
      title: proposal.title,
      customerName: customer?.name,
      siteName: siteLocation ? (siteLocation.label || siteLocation.type) : undefined,
      siteAddress: siteLocation?.city ? `${siteLocation.city}, ${siteLocation.state ?? ""}`.trim().replace(/,$/, "") : undefined,
      validUntil: proposal.valid_until ?? undefined,
      terms: proposal.terms ?? undefined,
      sections,
      lineItems,
      overheadPct,
      profitPct,
      laborRate,
      laborHours,
      materialCost,
      laborCost,
      directCost,
      overhead,
      profit,
      sellPrice,
    })
  );

  const filename = `${proposal.title.replace(/[^a-z0-9]/gi, "_")}.pdf`;

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
