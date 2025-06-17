
import { LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "./AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
  onSignOut: () => void;
}

const Layout = ({ children, onSignOut }: LayoutProps) => {
  return (
    <>
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 flex items-center justify-between border-b bg-white px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-gray-600 hover:text-gray-900" />
            <h1 className="text-xl font-semibold text-gray-900">Inventory Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Local Vendor Dashboard</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
