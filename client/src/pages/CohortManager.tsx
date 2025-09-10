import { Group } from "lucide-react";

export default function CohortManager() {
  return (
    <div>
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
