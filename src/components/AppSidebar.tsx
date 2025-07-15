
import { LayoutDashboard, Package, FolderOpen, Settings, FileText, DollarSign, Users, Shield, Bell } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const currentPath = location.pathname;

  const adminItems = [
    { title: t('navigation.adminDashboard'), url: "/dashboard", icon: Shield },
    { title: t('navigation.userManagement'), url: "/users", icon: Users },
    { title: t('navigation.inventory'), url: "/inventory", icon: Package },
    { title: t('navigation.categories'), url: "/categories", icon: FolderOpen },
    { title: t('navigation.reports'), url: "/reports", icon: FileText },
    { title: t('navigation.pricing'), url: "/pricing", icon: DollarSign },
    { title: t('common.notifications', 'Notifications'), url: "/notifications", icon: Bell },
    { title: t('navigation.settings'), url: "/settings", icon: Settings },
  ];

  const customerItems = [
    { title: t('navigation.dashboard'), url: "/dashboard", icon: LayoutDashboard },
    { title: t('navigation.myInventory'), url: "/inventory", icon: Package },
    { title: t('navigation.reports'), url: "/reports", icon: FileText },
    { title: t('navigation.pricing'), url: "/pricing", icon: DollarSign },
    { title: t('common.notifications', 'Notifications'), url: "/notifications", icon: Bell },
    { title: t('navigation.settings'), url: "/settings", icon: Settings },
  ];

  const items = user?.role === 'admin' ? adminItems : customerItems;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-700" 
      : "hover:bg-gray-50 text-gray-700";

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-white border-r">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Dynamic Tracking</h2>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' ? t('common.adminPanel') : t('common.customerPortal')}
                </p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium px-4 py-2">
            {!isCollapsed && (user?.role === 'admin' ? 'Admin Menu' : 'Main Menu')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-none ${getNavCls({ isActive })}`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Role Badge */}
        {!isCollapsed && (
          <div className="mt-auto p-4 border-t">
            <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
              user?.role === 'admin' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {user?.role === 'admin' ? `🛡️ ${t('settings.administrator')}` : `👤 ${t('settings.customer')}`}
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
