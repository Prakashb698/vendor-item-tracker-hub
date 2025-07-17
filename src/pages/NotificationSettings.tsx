
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Phone, Mail, Smartphone, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  lowStock: boolean;
  newOrders: boolean;
  inventoryUpdates: boolean;
  dailySummary: boolean;
}

const NotificationSettings = () => {
  const { t } = useTranslation();
  const [phoneNumbers, setPhoneNumbers] = useState([
    { id: 1, number: "+1 (555) 123-4567", primary: true },
  ]);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    sms: true,
    push: false,
    lowStock: true,
    newOrders: true,
    inventoryUpdates: false,
    dailySummary: true,
  });

  const form = useForm();

  const addPhoneNumber = () => {
    if (newPhoneNumber.trim()) {
      setPhoneNumbers([
        ...phoneNumbers,
        {
          id: Date.now(),
          number: newPhoneNumber,
          primary: phoneNumbers.length === 0,
        },
      ]);
      setNewPhoneNumber("");
    }
  };

  const removePhoneNumber = (id: number) => {
    setPhoneNumbers(phoneNumbers.filter(phone => phone.id !== id));
  };

  const setPrimaryPhone = (id: number) => {
    setPhoneNumbers(phoneNumbers.map(phone => ({
      ...phone,
      primary: phone.id === id,
    })));
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/notifications">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notifications
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Bell className="h-8 w-8" />
          Manage Notifications
        </h1>
        <p className="text-gray-600">
          Configure how and when you receive notifications
        </p>
      </div>

      <div className="space-y-6">
        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notification Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                checked={settings.email}
                onCheckedChange={(checked) => updateSetting('email', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via text message</p>
              </div>
              <Switch
                checked={settings.sms}
                onCheckedChange={(checked) => updateSetting('sms', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Push Notifications</Label>
                <p className="text-sm text-gray-500">Receive browser push notifications</p>
              </div>
              <Switch
                checked={settings.push}
                onCheckedChange={(checked) => updateSetting('push', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Phone Numbers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Numbers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {phoneNumbers.map((phone) => (
                <div key={phone.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{phone.number}</p>
                      {phone.primary && (
                        <p className="text-sm text-blue-600">Primary</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!phone.primary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimaryPhone(phone.id)}
                      >
                        Set Primary
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePhoneNumber(phone.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Enter phone number"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addPhoneNumber} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Low Stock Alerts</Label>
                <p className="text-sm text-gray-500">Get notified when inventory is running low</p>
              </div>
              <Switch
                checked={settings.lowStock}
                onCheckedChange={(checked) => updateSetting('lowStock', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>New Orders</Label>
                <p className="text-sm text-gray-500">Get notified when new orders are received</p>
              </div>
              <Switch
                checked={settings.newOrders}
                onCheckedChange={(checked) => updateSetting('newOrders', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Inventory Updates</Label>
                <p className="text-sm text-gray-500">Get notified when inventory is updated</p>
              </div>
              <Switch
                checked={settings.inventoryUpdates}
                onCheckedChange={(checked) => updateSetting('inventoryUpdates', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Daily Summary</Label>
                <p className="text-sm text-gray-500">Receive a daily summary of activities</p>
              </div>
              <Switch
                checked={settings.dailySummary}
                onCheckedChange={(checked) => updateSetting('dailySummary', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="px-8">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
