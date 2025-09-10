import { BarChart3 } from "lucide-react";

export default function AnalyticsSimulation() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Analytics & Simulation</h1>
        <p className="text-muted-foreground">
          Analyze performance and simulate business scenarios.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Analytics & Simulation</h2>
        <p className="text-muted-foreground">
          Deep dive into performance metrics and run predictive scenarios.
        </p>
      </div>
    </div>
  );
}
