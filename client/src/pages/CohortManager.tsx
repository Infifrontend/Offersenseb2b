import { Group } from "lucide-react";

export default function CohortManager() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Cohort Manager</h1>
        <p className="text-muted-foreground">
          Segment and manage customer cohorts for targeted offers.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <Group className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Cohort Manager</h2>
        <p className="text-muted-foreground">
          Create and manage customer segments for targeted marketing.
        </p>
      </div>
    </div>
  );
}
