import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";
import { NewEstimateButton } from "@/components/estimate/NewEstimateButton";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  draft: "secondary",
  review: "outline",
  approved: "default",
  won: "default",
  lost: "destructive",
};

export default async function EstimatesPage() {
  const supabase = await createClient();
  const { data: estimates } = await supabase
    .from("estimates")
    .select("*, customer:customers(name)")
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Estimates</h1>
        <NewEstimateButton />
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {estimates?.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                No estimates yet.
              </td></tr>
            )}
            {estimates?.map((e) => (
              <tr key={e.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/estimates/${e.id}`} className="font-medium hover:underline flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {e.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {(e.customer as { name: string } | null)?.name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusColors[e.status] as "default" | "secondary" | "outline" | "destructive"} className="capitalize">
                    {e.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {format(new Date(e.updated_at), "MMM d, yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
