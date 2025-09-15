import { Link, useLocation } from "wouter";
import {
  Handshake,
  TrendingUp,
  Tags,
  Percent,
  Layers,
  GitBranch,
  Edit,
  Users,
  Group,
  Trophy,
  Megaphone,
  History,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  isMobile: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

const menuItems = [
  // {
  //   path: "/dashboard",
  //   label: "Dashboard",
  //   icon: BarChart3,
  // },
  // {
  //   path: "/negotiated-fare-manager",
  //   label: "Negotiated Fare Manager",
  //   icon: Handshake,
  // },
  // {
  //   path: "/dynamic-discount-engine",
  //   label: "Dynamic Discount Engine",
  //   icon: TrendingUp,
  // },
  // {
  //   path: "/air-ancillaries-discounting",
  //   label: "Air Ancillaries Discounting",
  //   icon: Tags,
  // },
  // {
  //   path: "/non-air-ancillaries",
  //   label: "Non-Air Ancillaries Markup",
  //   icon: Percent,
  // },
  // {
  //   path: "/ancillary-bundling-engine",
  //   label: "Ancillary Bundling Engine",
  //   icon: Layers,
  // },
  // {
  //   path: "/offer-rule-builder",
  //   label: "Offer Rule Builder",
  //   icon: GitBranch,
  // },
  // {
  //   path: "/offer-composer",
  //   label: "Offer Composer for Agents",
  //   icon: Edit,
  // },
  // {
  //   path: "/agent-channel-manager",
  //   label: "Agent & Channel Manager",
  //   icon: Users,
  // },
  // {
  //   path: "/cohort-manager",
  //   label: "Cohort Manager",
  //   icon: Group,
  // },
  // {
  //   path: "/agent-tier-manager",
  //   label: "Agent Tier Manager",
  //   icon: Trophy,
  // },
  // {
  //   path: "/campaign-manager",
  //   label: "Campaign Manager",
  //   icon: Megaphone,
  // },
  // {
  //   path: "/logs-version-history",
  //   label: "Logs & Version History",
  //   icon: History,
  // },

  // {
  //   path: "/analytics-simulation",
  //   label: "Analytics & Simulation",
  //   icon: BarChart3,
  // },
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    path: "/negotiated-fare-manager",
    label: "Fare Manager",
    icon: Handshake,
  },
  {
    path: "/dynamic-discount-engine",
    label: "Dynamic Discount",
    icon: TrendingUp,
  },
  {
    path: "/air-ancillaries-discounting",
    label: "Air Discounting",
    icon: Tags,
  },

  {
    path: "/non-air-ancillaries",
    label: "Non-Air Markup",
    icon: Percent,
  },
  {
    path: "/ancillary-bundling-engine",
    label: "Bundling Engine",
    icon: Layers,
  },
  {
    path: "/offer-rule-builder",
    label: "Rule Builder",
    icon: GitBranch,
  },
  {
    path: "/offer-composer",
    label: "Offer Composer",
    icon: Edit,
  },
  {
    path: "/agent-channel-manager",
    label: "Agents & Channels",
    icon: Users,
  },
  {
    path: "/cohort-manager",
    label: "Cohorts",
    icon: Group,
  },
  {
    path: "/agent-tier-manager",
    label: "Agent Tiers",
    icon: Trophy,
  },
  {
    path: "/campaign-manager",
    label: "Campaigns",
    icon: Megaphone,
  },
  {
    path: "/logs-version-history",
    label: "Logs & History",
    icon: History,
  },
  {
    path: "/analytics-simulation",
    label: "Analytics",
    icon: BarChart3,
  },
];

export default function Sidebar({
  collapsed,
  mobileOpen,
  isMobile,
  onToggle,
  onMobileClose,
}: SidebarProps) {
  const { toast } = useToast();
  const [location] = useLocation();
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });

    setLocation("/login");
  };

  const sidebarWidth = collapsed ? "80px" : "250px";
  const sidebarClasses = `
    sidebar-transition 
    ${isMobile ? `sidebar-mobile ${mobileOpen ? "open" : ""}` : ""} 
    bg-card border-r border-border flex flex-col shadow-sm
  `;

  return (
    <aside
      className={sidebarClasses}
      style={{ width: isMobile ? "250px" : sidebarWidth }}
      data-testid="sidebar"
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b border-border bg-primary relative">
        <button
          onClick={onToggle}
          className="absolute -right-3 top-6 bg-white rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow z-10"
          data-testid="sidebar-toggle"
        >
          {collapsed && !isMobile ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
            </>
          )}
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
            <Plane className="text-primary w-4 h-4" />
          </div>
          <div
            className={`transition-opacity duration-300 ${
              collapsed && !isMobile ? "opacity-0" : "opacity-100"
            }`}
          >
            <h1 className="text-lg font-bold text-primary-foreground">
              Offersense B2B
            </h1>
            <p className="text-xs text-white text-opacity-80">
              Online Travel Agency
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-hidden hover:overflow-y-auto scrollbar-hide p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location === item.path ||
              (location === "/" && item.path === "/dashboard");

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`
                    menu-item-hover flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium
                    ${isActive ? "menu-item-active" : ""}
                  `}
                  onClick={isMobile ? onMobileClose : undefined}
                  data-testid={`menu-item-${item.path.slice(1)}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span
                    className={`menu-text transition-opacity duration-300 ${
                      collapsed && !isMobile ? "opacity-0 w-0" : "opacity-100"
                    }`}
                    style={{
                      display: collapsed && !isMobile ? "none" : "block",
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0  ">
            <p className="text-sm font-medium  truncate cls-primary-clr">
              John Doe
            </p>
            <p className="text-xs text-gray-500 capitalize">Administrator</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
