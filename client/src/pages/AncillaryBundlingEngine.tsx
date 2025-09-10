import { Layers } from "lucide-react";

export default function AncillaryBundlingEngine() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Ancillary Bundling Engine</h1>
        <p className="text-muted-foreground">
          Create and manage bundled service packages.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <Layers className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Ancillary Bundling Engine</h2>
        <p className="text-muted-foreground">
          Create attractive service bundles to increase revenue.
        </p>
      </div>
    </div>
  );
}
