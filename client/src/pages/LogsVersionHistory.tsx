import { History } from "lucide-react";

export default function LogsVersionHistory() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Logs & Version History</h1>
        <p className="text-muted-foreground">
          Track changes and maintain audit trails.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <History className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Logs & Version History</h2>
        <p className="text-muted-foreground">
          Monitor system changes and maintain compliance records.
        </p>
      </div>
    </div>
  );
}
