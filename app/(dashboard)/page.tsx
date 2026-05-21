import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, KanbanSquare, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: estimateCount },
    { count: customerCount },
    { count: opportunityCount },
    { data: pipeline },
  ] = await Promise.all([
    supabase.from("estimates").select("*", { count: "exact", head: true }),
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("opportunities").select("*", { count: "exact", head: true }).neq("stage", "won").neq("stage", "lost"),
    supabase.from("opportunities").select("value, stage").neq("stage", "won").neq("stage", "lost"),
  ]);

  const pipelineValue = pipeline?.reduce((sum, o) => sum + (o.value ?? 0), 0) ?? 0;

  const stats = [
    { label: "Active Estimates", value: estimateCount ?? 0, icon: FileText },
    { label: "Customers",        value: customerCount ?? 0,  icon: Users },
    { label: "Open Opportunities", value: opportunityCount ?? 0, icon: KanbanSquare },
    { label: "Pipeline Value", value: `$${pipelineValue.toLocaleString()}`, icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
