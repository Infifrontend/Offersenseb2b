import { GitBranch } from "lucide-react";

export default function OfferRuleBuilder() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Offer Rule Builder (No-Code)</h1>
        <p className="text-muted-foreground">
          Build complex offer rules without coding knowledge.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <GitBranch className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Offer Rule Builder</h2>
        <p className="text-muted-foreground">
          Create sophisticated business rules with our visual editor.
        </p>
      </div>
    </div>
  );
}
