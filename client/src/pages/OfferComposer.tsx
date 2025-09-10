import { Edit } from "lucide-react";

export default function OfferComposer() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Offer Composer for Agents</h1>
        <p className="text-muted-foreground">
          Empower agents to create customized offers.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <Edit className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Offer Composer</h2>
        <p className="text-muted-foreground">
          Enable agents to craft personalized offers for their clients.
        </p>
      </div>
    </div>
  );
}
