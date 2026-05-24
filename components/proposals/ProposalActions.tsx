"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { ProposalStatus } from "@/types/db";

interface Props {
  proposalId: string;
  status: ProposalStatus;
}

type Action = { label: string; nextStatus: ProposalStatus; timestampField?: string; variant?: "default" | "outline" | "destructive" };

const transitions: Record<ProposalStatus, Action[]> = {
  draft: [{ label: "Mark Sent", nextStatus: "sent", timestampField: "sent_at" }],
  sent: [
    { label: "Mark Viewed", nextStatus: "viewed" },
    { label: "Mark Signed", nextStatus: "signed", timestampField: "signed_at" },
    { label: "Reject", nextStatus: "rejected", variant: "destructive" },
  ],
  viewed: [
    { label: "Mark Signed", nextStatus: "signed", timestampField: "signed_at" },
    { label: "Reject", nextStatus: "rejected", variant: "destructive" },
  ],
  signed: [],
  rejected: [],
};

export function ProposalActions({ proposalId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const actions = transitions[status] ?? [];

  if (actions.length === 0) return null;

  async function apply(action: Action) {
    setLoading(action.nextStatus);
    const supabase = createClient();
    const update: Record<string, unknown> = { status: action.nextStatus };
    if (action.timestampField) update[action.timestampField] = new Date().toISOString();
    await supabase.from("proposals").update(update).eq("id", proposalId);
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {actions.map((action) => (
        <Button
          key={action.nextStatus}
          size="sm"
          variant={action.variant ?? "outline"}
          disabled={loading !== null}
          onClick={() => apply(action)}
        >
          {loading === action.nextStatus ? "Updating…" : action.label}
        </Button>
      ))}
    </div>
  );
}
