import { Handshake } from "lucide-react";

export default function NegotiatedFareManager() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Negotiated Fare Manager</h1>
        <p className="text-muted-foreground">
          Manage and configure negotiated fares with airline partners.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <Handshake className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Negotiated Fare Manager</h2>
        <p className="text-muted-foreground">
          Configure and manage special negotiated rates with airline partners.
        </p>
      </div>
    </div>
  );
}
