
import SubscriptionManager from "@/components/SubscriptionManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Mail, Phone, MapPin, Globe } from "lucide-react";

const Pricing = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your business needs. All plans include our core inventory management features.
        </p>
      </div>

      <SubscriptionManager />

      <div className="mt-12 text-center">
        <div className="bg-gray-50 rounded-lg p-6 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Need something different?
          </h3>
          <p className="text-gray-600 mb-4">
            Contact our sales team for custom enterprise solutions or if you have specific requirements.
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Contact Sales
          </button>
        </div>
      </div>

      {/* Settings Section */}
      <div className="mt-16 border-t pt-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Company & Customer Information</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  About Our Company
                </CardTitle>
                <CardDescription>
                  Learn more about our mission and values
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">123 Business Street, Tech City, TC 12345</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">contact@acmecorp.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">www.acmecorp.com</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-3">
                    Acme Corp has been providing innovative inventory management solutions since 2020. 
                    We're committed to helping businesses streamline their operations and grow efficiently.
                  </p>
                  <Button variant="outline" size="sm">
                    Learn More About Us
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customer Data & Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customer Support & Data
                </CardTitle>
                <CardDescription>
                  Your data security and support information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">Data Security</h4>
                    <p className="text-sm text-blue-700">
                      Your data is encrypted and stored securely with 99.9% uptime guarantee.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-1">24/7 Support</h4>
                    <p className="text-sm text-green-700">
                      Get help whenever you need it with our dedicated support team.
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-1">Data Backup</h4>
                    <p className="text-sm text-purple-700">
                      Automatic daily backups ensure your data is always safe and recoverable.
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Privacy Policy
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Terms of Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
