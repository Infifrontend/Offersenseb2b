import { TrendingUp } from "lucide-react";

export default function DynamicDiscountEngine() {
  return (
    <div>
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <TrendingUp className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Dynamic Discount Engine</h2>
        <p className="text-muted-foreground">
          Set up intelligent pricing rules for API, GDS, and NDC fare sources.
        </p>
      </div>
    </div>
  );
}
