import * as React from "react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { useNavigate, useLocation } from "react-router-dom"
import {
  BarChart3,
  Package,
  Tag,
  FileText,
  Receipt,
  Menu,
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
      <Sidebar.Header>
        <Button variant="link" onClick={() => navigate("/dashboard")}>
          Acme Corp
        </Button>
      </Sidebar.Header>
      <Sidebar.Content>
        <NavigationMenu>
          <NavigationMenuList>
            {items.map((item) => (
              <NavigationMenuItem key={item.title}>
                <NavigationMenuLink
                  className={
                    location.pathname === item.url
                      ? "bg-secondary text-secondary-foreground data-[active]:bg-secondary data-[active]:text-secondary-foreground"
                      : ""
                  }
                  onClick={() => navigate(item.url)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </Sidebar.Content>
      <Sidebar.Footer>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink onClick={() => navigate("/admin")}>
                Admin
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </Sidebar.Footer>
    </Sidebar>
  )
}
