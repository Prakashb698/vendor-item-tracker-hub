
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { User, Settings as SettingsIcon, CreditCard, History, Globe, LogOut, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    businessName: user?.businessName || "",
    phone: "",
    address: "",
  });
  
  // Local state for language selection - only changes when saved
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleProfileSave = () => {
    // In a real app, this would save to the backend
    toast({
      title: t('settings.profileUpdated'),
      description: t('settings.profileUpdateSuccess'),
    });
  };

  const handlePreferencesSave = () => {
    // Only change language when Save Changes is clicked
    i18n.changeLanguage(selectedLanguage);
    toast({
      title: t('settings.preferencesUpdated'),
      description: t('settings.preferencesUpdateSuccess'),
    });
  };

  const handleSignOut = () => {
    signOut();
    toast({
      title: t('settings.signedOut'),
      description: t('settings.signOutSuccess'),
    });
  };

  // Mock transaction data
  const recentTransactions = [
    { id: 1, date: "2024-01-15", type: "Purchase", amount: "$49.99", status: "Completed" },
    { id: 2, date: "2024-01-10", type: "Subscription", amount: "$29.99", status: "Completed" },
    { id: 3, date: "2024-01-05", type: "Purchase", amount: "$19.99", status: "Pending" },
  ];

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('settings.title')}</h1>
        <p className="text-gray-600">{t('settings.subtitle')}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t('settings.profile')}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            {t('settings.preferences')}
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {t('settings.payments')}
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            {t('settings.transactions')}
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            {t('settings.account')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.profileInfo')}</CardTitle>
              <CardDescription>
                {t('settings.profileDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('settings.fullName')}</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder={t('settings.fullName')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('settings.emailAddress')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder={t('settings.emailAddress')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business">{t('settings.businessName')}</Label>
                  <Input
                    id="business"
                    value={profileData.businessName}
                    onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                    placeholder={t('settings.businessName')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('settings.phoneNumber')}</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder={t('settings.phoneNumber')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t('settings.address')}</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  placeholder={t('settings.address')}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleProfileSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {t('settings.saveChanges')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.languageRegion')}</CardTitle>
              <CardDescription>
                {t('settings.languageDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">{t('settings.language')}</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button onClick={handlePreferencesSave} className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t('settings.savePreferences')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.paymentMethods')}</CardTitle>
              <CardDescription>
                {t('settings.paymentDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-500">Expires 12/25</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Default</Badge>
                </div>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button variant="outline">{t('settings.addPaymentMethod')}</Button>
                <Button variant="outline">{t('settings.manageBilling')}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.recentTransactions')}</CardTitle>
              <CardDescription>
                {t('settings.transactionDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{transaction.type}</p>
                        <p className="text-sm text-gray-500">{transaction.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{transaction.amount}</p>
                        <Badge variant={transaction.status === "Completed" ? "default" : "secondary"}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <Button variant="outline" className="w-full">
                {t('settings.viewAllTransactions')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.accountActions')}</CardTitle>
              <CardDescription>
                {t('settings.accountDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">{t('settings.accountInfo')}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>{t('settings.role')}:</strong> {user?.role === 'admin' ? t('settings.administrator') : t('settings.customer')}</p>
                    <p><strong>{t('settings.email')}:</strong> {user?.email}</p>
                    <p><strong>{t('settings.memberSince')}:</strong> {new Date(user?.createdAt || '').toLocaleDateString()}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    {t('settings.changePassword')}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    {t('settings.downloadData')}
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start flex items-center gap-2"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    {t('settings.signOut')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
