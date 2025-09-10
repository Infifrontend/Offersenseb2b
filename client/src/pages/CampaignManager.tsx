import { Megaphone } from "lucide-react";

export default function CampaignManager() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Campaign Manager</h1>
        <p className="text-muted-foreground">
          Plan and execute marketing campaigns.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <Megaphone className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Campaign Manager</h2>
        <p className="text-muted-foreground">
          Design and launch targeted promotional campaigns.
        </p>
      </div>
    </div>
  );
}
