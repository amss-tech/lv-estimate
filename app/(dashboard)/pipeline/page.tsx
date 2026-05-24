import { createClient } from "@/lib/supabase/server";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";

const STAGES = [
  { id: "lead",           label: "Lead" },
  { id: "proposal_sent",  label: "Proposal Sent" },
  { id: "negotiation",    label: "Negotiation" },
  { id: "won",            label: "Won" },
  { id: "lost",           label: "Lost" },
] as const;

export default async function PipelinePage() {
  const supabase = await createClient();
  const [{ data: opportunities }, { data: customers }, { data: estimates }] = await Promise.all([
    supabase.from("opportunities").select("*, customer:customers(name)").order("created_at", { ascending: false }),
    supabase.from("customers").select("id, name").order("name"),
    supabase.from("estimates").select("id, name, customer_id").order("name"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pipeline</h1>
      <PipelineBoard
        opportunities={opportunities as any ?? []}
        stages={STAGES}
        customers={customers ?? []}
        estimates={estimates as any ?? []}
      />
    </div>
  );
}
