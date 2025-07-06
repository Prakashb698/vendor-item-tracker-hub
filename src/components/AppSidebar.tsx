
import * as React from "react"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
import {
  BarChart3,
  Package,
  Tag,
  FileText,
  Receipt,
} from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Package,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: Tag,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: Receipt,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: FileText,
    },
  ];

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Button variant="link" onClick={() => navigate("/dashboard")}>
          Acme Corp
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <NavigationMenu>
          <NavigationMenuList className="flex flex-col space-y-1">
            {items.map((item) => (
              <NavigationMenuItem key={item.title}>
                <NavigationMenuLink
                  className={`flex items-center w-full px-3 py-2 rounded-md cursor-pointer hover:bg-accent ${
                    location.pathname === item.url
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                  onClick={() => navigate(item.url)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink 
                className="flex items-center w-full px-3 py-2 rounded-md cursor-pointer hover:bg-accent"
                onClick={() => navigate("/admin")}
              >
                Admin
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
