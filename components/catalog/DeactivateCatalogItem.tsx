"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EyeOff } from "lucide-react";

export function DeactivateCatalogItem({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function handleDeactivate() {
    if (!confirming) { setConfirming(true); return; }
    const supabase = createClient();
    await supabase.from("catalog_items").update({ is_active: false }).eq("id", itemId);
    router.refresh();
  }

  return (
    <button
      onClick={handleDeactivate}
      onBlur={() => setConfirming(false)}
      className={`p-1 transition-colors ${confirming ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}
      title={confirming ? "Click again to deactivate" : "Deactivate item"}
    >
      <EyeOff className="h-3.5 w-3.5" />
    </button>
  );
}
