

import { LogOut, Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import PurchaseQueue from "./PurchaseQueue";
import { MLChatBot } from "./MLChatBot";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  return (
    <>
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 flex items-center justify-between border-b bg-background px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">
              {user?.role === 'admin' ? t('common.adminPanel') : t('common.customerPortal')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user?.role === 'customer' && <PurchaseQueue />}
            <Link to="/notifications">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                {t('common.notifications', 'Notifications')}
              </Button>
            </Link>
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.businessName}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {t('common.signOut')}
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6 bg-background">
          {children}
        </main>
        {/* Show ML-powered chatbot only for customers */}
        {user?.role === 'customer' && <MLChatBot />}
      </div>
    </>
  );
};

export default Layout;

