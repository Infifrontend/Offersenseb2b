import { Trophy } from "lucide-react";

export default function AgentTierManager() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Agent Tier Manager</h1>
        <p className="text-muted-foreground">
          Configure agent tier structures and benefits.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Agent Tier Manager</h2>
        <p className="text-muted-foreground">
          Set up tier-based rewards and commission structures.
        </p>
      </div>
    </div>
  );
}
