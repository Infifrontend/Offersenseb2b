import { useLocation } from "wouter";
import { Menu, Bell } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  isMobile: boolean;
}

const pageLabels: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/negotiated-fare-manager": "Negotiated Fare Manager",
  "/dynamic-discount-engine": "Dynamic Discount Engine",
  "/air-ancillaries-discounting": "Air Ancillaries Discounting",
  "/non-air-ancillaries": "Non-Air Ancillaries Markup/Discounting",
  "/ancillary-bundling-engine": "Ancillary Bundling Engine",
  "/offer-rule-builder": "Offer Rule Builder (No-Code)",
  "/offer-composer": "Offer Composer for Agents",
  "/agent-channel-manager": "Agent & Channel Manager",
  "/cohort-manager": "Cohort Manager",
  "/agent-tier-manager": "Agent Tier Manager",
  "/campaign-manager": "Campaign Manager",
  "/logs-version-history": "Logs & Version History",
  "/analytics-simulation": "Analytics & Simulation",
};

export default function Header({ onToggleSidebar, isMobile }: HeaderProps) {
  const [location] = useLocation();
  const currentPageLabel = pageLabels[location] || "Dashboard";

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-muted"
            data-testid="mobile-menu-toggle"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Page Title Section */}
        {location === "/dashboard" && (
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Monitor key metrics and manage your travel offerings from this
              central hub
            </p>
          </div>
        )}
        {location === "/negotiated-fare-manager" && (
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fare Manager</h1>
            <p className="text-sm text-muted-foreground">
              Manage airline fares, validate pricing rules, and handle fare
              uploads
            </p>
          </div>
        )}
        {location === "/dynamic-discount-engine" && (
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Dynamic Discount Engine
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure dynamic pricing and discount rules for API/GDS/NDC fares
            </p>
          </div>
        )}
        {location === "/air-ancillaries-discounting" && (
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Air Ancillaries Discounting
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage discounting strategies for air-related ancillary services
            </p>
          </div>
        )}
        {location === "/non-air-ancillaries" && (
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Non-Air Ancillaries Markup/Discounting
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure markup and discount rules for non-air services
            </p>
          </div>
        )}
        {location === "/ancillary-bundling-engine" && (
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Ancillary Bundling Engine
            </h1>
            <p className="text-sm text-muted-foreground">
              Create and manage bundled service packages
            </p>
          </div>
        )}
        {location === "/offer-rule-builder" && (
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Offer Rule Builder (No-Code)
            </h1>
            <p className="text-sm text-muted-foreground">
              Build complex offer rules without coding knowledge
            </p>
          </div>
        )}
        {location === "/offer-composer" && (
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Offer Composer for Agents
            </h1>
            <p className="text-sm text-muted-foreground">
              Empower agents to create customized offers
            </p>
          </div>
        )}
        {location === "/agent-channel-manager" && (
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Agent & Channel Manager
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage agent relationships and distribution channels
            </p>
          </div>
        )}
        {location === "/cohort-manager" && (
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Cohort Manager
            </h1>
            <p className="text-sm text-muted-foreground">
              Segment and manage customer cohorts for targeted offers
            </p>
          </div>
        )}
        {location === "/agent-tier-manager" && (
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Agent Tier Manager
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure agent tier structures and benefits
            </p>
          </div>
        )}
        {location === "/campaign-manager" && (
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Campaign Manager
            </h1>
            <p className="text-sm text-muted-foreground">
              Plan and execute marketing campaigns
            </p>
          </div>
        )}
        {location === "/logs-version-history" && (
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Logs & Version History
            </h1>
            <p className="text-sm text-muted-foreground">
              Track changes and maintain audit trails
            </p>
          </div>
        )}
        {location === "/analytics-simulation" && (
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Analytics & Simulation
            </h1>
            <p className="text-sm text-muted-foreground">
              Analyze performance and simulate business scenarios
            </p>
          </div>
        )}
      </div>

      {/* User Actions */}
      <div className="flex items-center space-x-4">
        <button
          className="p-2 rounded-lg hover:bg-muted relative"
          data-testid="notifications-button"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
