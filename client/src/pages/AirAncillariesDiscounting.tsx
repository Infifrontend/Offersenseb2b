import { Tags } from "lucide-react";

export default function AirAncillariesDiscounting() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Air Ancillaries Discounting</h1>
        <p className="text-muted-foreground">
          Manage discounting strategies for air-related ancillary services.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <Tags className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Air Ancillaries Discounting</h2>
        <p className="text-muted-foreground">
          Configure discount strategies for baggage, seats, and other air services.
        </p>
      </div>
    </div>
  );
}
