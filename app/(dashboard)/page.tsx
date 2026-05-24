import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, KanbanSquare, DollarSign } from "lucide-react";
import Link from "next/link";
import type { EstimateStatus, OpportunityStage } from "@/types/db";

const statusColors: Record<EstimateStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-yellow-500/20 text-yellow-600",
  approved: "bg-blue-500/20 text-blue-600",
  won: "bg-green-500/20 text-green-700",
  lost: "bg-red-500/20 text-red-600",
};

const stageLabels: Record<OpportunityStage, string> = {
  lead: "Lead",
  proposal_sent: "Proposal Sent",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: estimateCount },
    { count: customerCount },
    { count: opportunityCount },
    { data: pipeline },
    { data: recentEstimates },
    { data: wonOpps },
    { data: lostOpps },
  ] = await Promise.all([
    supabase.from("estimates").select("*", { count: "exact", head: true }),
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("opportunities").select("*", { count: "exact", head: true }).neq("stage", "won").neq("stage", "lost"),
    supabase.from("opportunities").select("value, stage").neq("stage", "won").neq("stage", "lost"),
    supabase.from("estimates")
      .select("id, name, status, updated_at, customer:customers(name)")
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("stage", "won"),
    supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("stage", "lost"),
  ]);

  const pipelineValue = pipeline?.reduce((sum, o) => sum + (o.value ?? 0), 0) ?? 0;

  // Pipeline value by stage
  const byStage: Record<string, number> = {};
  pipeline?.forEach((o) => {
    byStage[o.stage] = (byStage[o.stage] ?? 0) + (o.value ?? 0);
  });

  // Win rate
  const wonCount = wonOpps?.length ?? 0;
  const lostCount = lostOpps?.length ?? 0;
  const winRateDenom = wonCount + lostCount;
  const winRate = winRateDenom > 0 ? Math.round((wonCount / winRateDenom) * 100) : null;

  const stats = [
    { label: "Active Estimates", value: estimateCount ?? 0, icon: FileText, href: "/estimates" },
    { label: "Customers",        value: customerCount ?? 0,  icon: Users,    href: "/customers" },
    { label: "Open Opportunities", value: opportunityCount ?? 0, icon: KanbanSquare, href: "/pipeline" },
    { label: "Pipeline Value", value: `$${pipelineValue.toLocaleString()}`, icon: DollarSign, href: "/pipeline" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent estimates */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex justify-between items-center">
              Recent Estimates
              <Link href="/estimates" className="text-xs text-muted-foreground hover:text-foreground font-normal">View all</Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(recentEstimates ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No estimates yet.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {recentEstimates?.map((est) => (
                    <tr key={est.id} className="hover:bg-muted/30">
                      <td className="py-2 pr-3">
                        <Link href={`/estimates/${est.id}`} className="font-medium hover:underline">{est.name}</Link>
                        <p className="text-xs text-muted-foreground">{(est.customer as any)?.name ?? "No customer"}</p>
                      </td>
                      <td className="py-2 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[est.status as EstimateStatus] ?? ""}`}>
                          {est.status}
                        </span>
                      </td>
                      <td className="py-2 pl-3 text-right text-xs text-muted-foreground">
                        {new Date(est.updated_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Pipeline + win rate */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex justify-between items-center">
                Pipeline by Stage
                <Link href="/pipeline" className="text-xs text-muted-foreground hover:text-foreground font-normal">View board</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(["lead", "proposal_sent", "negotiation"] as OpportunityStage[]).map((stage) => (
                <div key={stage} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{stageLabels[stage]}</span>
                  <span className="font-medium">{byStage[stage] ? `$${byStage[stage].toLocaleString()}` : "—"}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {winRateDenom === 0 ? (
                <p className="text-sm text-muted-foreground">No closed opportunities yet.</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-3xl font-bold">{winRate}%</p>
                  <p className="text-xs text-muted-foreground">{wonCount} won · {lostCount} lost</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
