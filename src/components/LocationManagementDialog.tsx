import { useState } from 'react';
import { Plus, Trash2, Star, StarOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocations, BusinessLocation } from '@/hooks/useLocations';
import { useToast } from '@/hooks/use-toast';

interface LocationManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LocationManagementDialog = ({ open, onOpenChange }: LocationManagementDialogProps) => {
  const { locations, addLocation, updateLocation, deleteLocation, setDefaultLocation } = useLocations();
  const { toast } = useToast();
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    description: '',
    is_default: false
  });
  const [deleteLocationId, setDeleteLocationId] = useState<string | null>(null);

  const handleAddLocation = async () => {
    if (!newLocation.name.trim()) {
      toast({
        title: "Error",
        description: "Location name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      await addLocation(newLocation);
      setNewLocation({ name: '', address: '', description: '', is_default: false });
      toast({
        title: "Success",
        description: "Location added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add location",
        variant: "destructive"
      });
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      await deleteLocation(locationId);
      setDeleteLocationId(null);
      toast({
        title: "Success",
        description: "Location deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive"
      });
    }
  };

  const handleSetDefault = async (locationId: string) => {
    try {
      await setDefaultLocation(locationId);
      toast({
        title: "Success",
        description: "Default location updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update default location",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Business Locations</DialogTitle>
            <DialogDescription>
              Add and manage your business locations to track inventory across different branches.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add New Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location-name">Location Name *</Label>
                  <Input
                    id="location-name"
                    placeholder="e.g., Main Store, Warehouse A"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location-address">Address</Label>
                  <Input
                    id="location-address"
                    placeholder="Full address"
                    value={newLocation.address}
                    onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location-description">Description</Label>
                  <Textarea
                    id="location-description"
                    placeholder="Additional details about this location"
                    value={newLocation.description}
                    onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button onClick={handleAddLocation} className="w-full">
                  Add Location
                </Button>
              </CardContent>
            </Card>

            {/* Existing Locations */}
            <Card>
              <CardHeader>
                <CardTitle>Your Locations ({locations.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {locations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No locations yet. Add your first location to get started.
                  </p>
                ) : (
                  locations.map((location) => (
                    <div
                      key={location.id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{location.name}</h4>
                            {location.is_default && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          {location.address && (
                            <p className="text-sm text-muted-foreground">{location.address}</p>
                          )}
                          {location.description && (
                            <p className="text-sm text-muted-foreground mt-1">{location.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(location.id)}
                            disabled={location.is_default}
                          >
                            {location.is_default ? (
                              <Star className="h-4 w-4 fill-current" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                          {locations.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteLocationId(location.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteLocationId} onOpenChange={() => setDeleteLocationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this location? Items assigned to this location will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteLocationId && handleDeleteLocation(deleteLocationId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
