"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2 } from "lucide-react";

export function DeleteLocation({ locationId }: { locationId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    const supabase = createClient();
    const { error } = await supabase.from("customer_locations").delete().eq("id", locationId);
    if (error) { alert(error.message); return; }
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      onBlur={() => setConfirming(false)}
      className={`p-1 transition-colors ${confirming ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}
      title={confirming ? "Click again to confirm" : "Delete location"}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
