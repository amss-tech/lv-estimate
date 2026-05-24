import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2 } from "lucide-react";
import { CustomerForm } from "@/components/customers/CustomerForm";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <CustomerForm trigger={
          <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Customer</Button>
        } />
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {customers?.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                No customers yet. Add your first one.
              </td></tr>
            )}
            {customers?.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/customers/${c.id}`} className="font-medium hover:underline flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="capitalize">{c.type}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
