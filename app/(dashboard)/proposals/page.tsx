import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary",
  sent: "outline",
  viewed: "outline",
  signed: "default",
  rejected: "destructive",
};

export default async function ProposalsPage() {
  const supabase = await createClient();
  const { data: proposals } = await supabase
    .from("proposals")
    .select("*, customer:customers(name), estimate:estimates(name)")
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Proposals</h1>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Valid Until</th>
              <th className="px-4 py-3 text-left font-medium">Sent</th>
            </tr>
          </thead>
          <tbody>
            {proposals?.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                No proposals yet. Create one from an estimate.
              </td></tr>
            )}
            {proposals?.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/proposals/${p.id}`} className="hover:underline">{p.title}</Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {(p.customer as { name: string } | null)?.name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusColors[p.status]} className="capitalize">{p.status}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {p.valid_until ? format(new Date(p.valid_until), "MMM d, yyyy") : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {p.sent_at ? format(new Date(p.sent_at), "MMM d") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
