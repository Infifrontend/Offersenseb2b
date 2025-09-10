import { Users } from "lucide-react";

export default function AgentChannelManager() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Agent & Channel Manager</h1>
        <p className="text-muted-foreground">
          Manage agent relationships and distribution channels.
        </p>
      </div>

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
