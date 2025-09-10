import { Users } from "lucide-react";

export default function AgentChannelManager() {
  return (
    <div>
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <Users className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Agent & Channel Manager</h2>
        <p className="text-muted-foreground">
          Organize your sales network and distribution partnerships.
        </p>
      </div>
    </div>
  );
}
