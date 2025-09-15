import { useLocation } from "wouter";
import { Menu, Bell, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface User {
  id: string;
  username: string;
}

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
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        // Invalid user data
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
        setLocation("/login");
      }
    } else {
      // If no user data, redirect to login
      setLocation("/login");
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });

    setLocation("/login");
  };

  const getUserInitials = (username: string) => {
    return username
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
        {/* Time Period Dropdown */}
        <select className="px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%2C9%2012%2C15%2018%2C9%22%3E%3C/polyline%3E%3C/svg%3E')] bg-no-repeat bg-right bg-[length:30px_16px] bg-[position:right_8px_center]">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>Custom Range</option>
        </select>

        {/* Channels Dropdown */}
        <select className="px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%2C9%2012%2C15%2018%2C9%22%3E%3C/polyline%3E%3C/svg%3E')] bg-no-repeat bg-right bg-[length:30px_16px] bg-[position:right_8px_center]">
          <option>All Channels</option>
          <option>Direct</option>
          <option>GDS</option>
          <option>OTA</option>
          <option>Corporate</option>
        </select>

        {/* Refresh Button */}
        <button className="px-4 py-2 text-sm font-medium text-white cls-primary-bg rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Refresh</span>
        </button>

        <button
          className="p-2 rounded-lg hover:bg-muted relative"
          data-testid="notifications-button"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/01.png" alt={user?.username || "User"} />
                <AvatarFallback>
                  {user ? getUserInitials(user.username) : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.username || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.id || ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}