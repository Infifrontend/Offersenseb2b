import { BarChart3, DollarSign, Users, Percent, Gift } from "lucide-react";

export default function Dashboard() {
  return (
    <div>
      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg border border-border p-6" data-testid="card-active-offers">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Active Offers</h3>
            <Gift className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">1,247</div>
          <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6" data-testid="card-total-revenue">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">$45,231</div>
          <p className="text-xs text-muted-foreground mt-1">+8% from last month</p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6" data-testid="card-active-agents">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Active Agents</h3>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">89</div>
          <p className="text-xs text-muted-foreground mt-1">+3 new this week</p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6" data-testid="card-conversion-rate">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Conversion Rate</h3>
            <Percent className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">24.8%</div>
          <p className="text-xs text-muted-foreground mt-1">+2.1% from last month</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border" data-testid="recent-offers">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Recent Offers</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Premium Bundle - Europe</p>
                  <p className="text-sm text-muted-foreground">Created 2 hours ago</p>
                </div>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Business Class Upgrade</p>
                  <p className="text-sm text-muted-foreground">Created yesterday</p>
                </div>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Weekend Getaway Deal</p>
                  <p className="text-sm text-muted-foreground">Created 3 days ago</p>
                </div>
                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                  Draft
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border" data-testid="top-agents">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Top Performing Agents</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-sm">SA</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Sarah Adams</p>
                    <p className="text-sm text-muted-foreground">Level 3 Agent</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">$12,450</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-sm">MJ</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Mike Johnson</p>
                    <p className="text-sm text-muted-foreground">Level 2 Agent</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">$9,820</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-sm">EW</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Emma Wilson</p>
                    <p className="text-sm text-muted-foreground">Level 3 Agent</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">$8,950</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
