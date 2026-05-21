"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import type { Opportunity, OpportunityStage } from "@/types/db";

interface Stage { id: OpportunityStage; label: string; }

interface Props {
  opportunities: (Opportunity & { customer: { name: string } | null })[];
  stages: readonly Stage[];
}

const stageColors: Record<OpportunityStage, string> = {
  lead: "bg-muted",
  proposal_sent: "bg-blue-950/40",
  negotiation: "bg-yellow-950/40",
  won: "bg-green-950/40",
  lost: "bg-red-950/40",
};

export function PipelineBoard({ opportunities: initOpps, stages }: Props) {
  const [opps, setOpps] = useState(initOpps);
  const supabase = createClient();

  async function moveStage(id: string, stage: OpportunityStage) {
    setOpps((o) => o.map((op) => op.id === id ? { ...op, stage } : op));
    await supabase.from("opportunities").update({ stage }).eq("id", id);
  }

  const fmt = (v: number) => `$${v.toLocaleString()}`;

  return (
    <div className="grid grid-cols-5 gap-3 min-h-[60vh]">
      {stages.map((stage) => {
        const stageOpps = opps.filter((o) => o.stage === stage.id);
        const stageValue = stageOpps.reduce((sum, o) => sum + (o.value ?? 0), 0);
        return (
          <div key={stage.id} className={`rounded-lg p-3 ${stageColors[stage.id]} flex flex-col gap-2`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold">{stage.label}</span>
              <Badge variant="outline" className="text-xs">{stageOpps.length}</Badge>
            </div>
            {stageValue > 0 && (
              <p className="text-xs text-muted-foreground -mt-1 mb-1">{fmt(stageValue)}</p>
            )}
            {stageOpps.map((opp) => (
              <Card key={opp.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-3 space-y-1">
                  <p className="text-sm font-medium truncate">{opp.name}</p>
                  {opp.customer && (
                    <p className="text-xs text-muted-foreground truncate">{opp.customer.name}</p>
                  )}
                  {opp.value && <p className="text-sm font-semibold">{fmt(opp.value)}</p>}
                  {opp.expected_close && (
                    <p className="text-xs text-muted-foreground">
                      Close: {new Date(opp.expected_close).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex gap-1 flex-wrap pt-1">
                    {stages.filter((s) => s.id !== stage.id).map((s) => (
                      <button key={s.id} onClick={() => moveStage(opp.id, s.id)}
                        className="text-xs text-muted-foreground hover:text-foreground underline">
                        → {s.label}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            {stageOpps.length === 0 && (
              <p className="text-xs text-muted-foreground italic text-center py-4">Empty</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
