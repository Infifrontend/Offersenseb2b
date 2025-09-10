import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="mobile-overlay show" 
          onClick={closeMobileSidebar}
          data-testid="mobile-overlay"
        />
      )}
      
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        isMobile={isMobile}
        onToggle={toggleSidebar}
        onMobileClose={closeMobileSidebar}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} isMobile={isMobile} />
        
        <div className="flex-1 overflow-y-auto bg-muted/30">
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
