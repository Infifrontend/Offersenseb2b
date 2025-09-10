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
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm text-muted-foreground">
          <span className="breadcrumb-item">Home</span>
          <span className="breadcrumb-item font-medium text-foreground">
            {currentPageLabel}
          </span>
        </nav>
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
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              JD
            </span>
          </div>
          <span className="text-sm font-medium hidden sm:block">
            John Doe
          </span>
        </div>
      </div>
    </header>
  );
}
