import { Percent } from "lucide-react";

export default function NonAirAncillaries() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Non-Air Ancillaries Markup/Discounting</h1>
        <p className="text-muted-foreground">
          Configure markup and discount rules for non-air services.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <Percent className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Non-Air Ancillaries</h2>
        <p className="text-muted-foreground">
          Manage pricing for hotels, cars, insurance, and other services.
        </p>
      </div>
    </div>
  );
}
