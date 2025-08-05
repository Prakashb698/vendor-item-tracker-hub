import { useState } from 'react';
import { MapPin, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLocations, BusinessLocation } from '@/hooks/useLocations';
import { LocationManagementDialog } from './LocationManagementDialog';

interface LocationSelectorProps {
  selectedLocationId?: string;
  onLocationChange: (locationId: string) => void;
  showManagement?: boolean;
}

export const LocationSelector = ({ selectedLocationId, onLocationChange, showManagement = true }: LocationSelectorProps) => {
  const { locations, loading } = useLocations();
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
  const defaultLocation = locations.find(loc => loc.is_default);

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-muted-foreground" />
      
      {locations.length > 0 ? (
        <Select
          value={selectedLocationId || defaultLocation?.id || ''}
          onValueChange={onLocationChange}
          disabled={loading}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select location">
              {selectedLocation ? (
                <div className="flex items-center gap-2">
                  <span>{selectedLocation.name}</span>
                  {selectedLocation.is_default && (
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  )}
                </div>
              ) : (
                'Select location'
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                <div className="flex items-center gap-2">
                  <span>{location.name}</span>
                  {location.is_default && (
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="text-sm text-muted-foreground">
          No locations yet - click Manage to add your first location
        </div>
      )}

      {showManagement && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLocationDialog(true)}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Manage
        </Button>
      )}

      {showLocationDialog && (
        <LocationManagementDialog
          open={showLocationDialog}
          onOpenChange={setShowLocationDialog}
        />
      )}
    </div>
  );
};