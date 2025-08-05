import { useState } from "react";
import { MapPin, Settings, Star, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocations } from "@/hooks/useLocations";
import { LocationManagementDialog } from "./LocationManagementDialog";

interface LocationSidebarProps {
  selectedLocationId?: string;
  onLocationChange: (locationId: string) => void;
}

export function LocationSidebar({ selectedLocationId, onLocationChange }: LocationSidebarProps) {
  const { state } = useSidebar();
  const { locations } = useLocations();
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
  const isCollapsed = state === "collapsed";

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarTrigger className="m-2 self-end" />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {!isCollapsed && <span>Business Locations</span>}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {locations.length === 0 ? (
                  <SidebarMenuItem>
                    <div className="p-3 text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        {isCollapsed ? "No locations" : "No locations yet"}
                      </p>
                      {!isCollapsed && (
                        <Button
                          size="sm"
                          onClick={() => setShowLocationDialog(true)}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Location
                        </Button>
                      )}
                    </div>
                  </SidebarMenuItem>
                ) : (
                  <>
                    {/* All Locations Option */}
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        className={!selectedLocationId ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}
                      >
                        <button
                          onClick={() => onLocationChange("")}
                          className="w-full flex items-center gap-2 justify-start"
                        >
                          <MapPin className="h-4 w-4" />
                          {!isCollapsed && <span>All Locations</span>}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Individual Locations */}
                    {locations.map((location) => (
                      <SidebarMenuItem key={location.id}>
                        <SidebarMenuButton
                          asChild
                          className={
                            selectedLocationId === location.id
                              ? "bg-muted text-primary font-medium"
                              : "hover:bg-muted/50"
                          }
                        >
                          <button
                            onClick={() => onLocationChange(location.id)}
                            className="w-full flex items-center gap-2 justify-start"
                          >
                            <MapPin className="h-4 w-4" />
                            {!isCollapsed && (
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="truncate">{location.name}</span>
                                {location.is_default && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Star className="h-3 w-3" />
                                  </Badge>
                                )}
                              </div>
                            )}
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}

                    {/* Manage Locations Button */}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <button
                          onClick={() => setShowLocationDialog(true)}
                          className="w-full flex items-center gap-2 justify-start hover:bg-muted/50"
                        >
                          <Settings className="h-4 w-4" />
                          {!isCollapsed && <span>Manage Locations</span>}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {showLocationDialog && (
        <LocationManagementDialog
          open={showLocationDialog}
          onOpenChange={setShowLocationDialog}
        />
      )}
    </>
  );
}