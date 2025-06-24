
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      price: "$9",
      period: "month",
      description: "Perfect for small businesses getting started",
      features: [
        "Up to 100 products",
        "Basic inventory tracking",
        "Standard reports",
        "Email support",
        "Mobile app access"
      ],
      limitations: [
        "Limited integrations",
        "Basic analytics"
      ],
      popular: false,
      buttonText: "Start Basic Plan"
    },
    {
      name: "Professional",
      price: "$29",
      period: "month",
      description: "Ideal for growing businesses with advanced needs",
      features: [
        "Up to 1,000 products",
        "Advanced inventory tracking",
        "Custom reports & analytics",
        "Priority email support",
        "Mobile app access",
        "Low stock alerts",
        "Barcode scanning",
        "Export capabilities"
      ],
      limitations: [],
      popular: true,
      buttonText: "Start Professional Plan"
    },
    {
      name: "Enterprise",
      price: "$79",
      period: "month",
      description: "For large businesses requiring maximum features",
      features: [
        "Unlimited products",
        "Advanced inventory management",
        "Custom reports & dashboards",
        "24/7 phone & email support",
        "Mobile app access",
        "Real-time alerts",
        "Barcode & QR scanning",
        "API access",
        "Multi-location support",
        "Team collaboration tools",
        "Advanced integrations"
      ],
      limitations: [],
      popular: false,
      buttonText: "Start Enterprise Plan"
    }
  ];

  const handleSubscribe = (planName: string) => {
    // This would typically integrate with Stripe or another payment processor
    console.log(`Subscribe to ${planName} plan`);
    // For now, just show an alert
    alert(`Subscribing to ${planName} plan - Integration with payment processor needed`);
  };

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

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <Card 
            key={index} 
            className={`relative ${plan.popular ? 'border-blue-500 border-2 shadow-lg' : 'border-gray-200'}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-gray-600 mb-4">
                {plan.description}
              </CardDescription>
              <div className="flex items-baseline justify-center">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600 ml-1">/{plan.period}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">What's included:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.limitations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Limitations:</h4>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, limitIndex) => (
                      <li key={limitIndex} className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-400 flex-shrink-0" />
                        <span className="text-sm text-gray-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                onClick={() => handleSubscribe(plan.name)}
              >
                {plan.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-gray-50 rounded-lg p-6 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Need something different?
          </h3>
          <p className="text-gray-600 mb-4">
            Contact our sales team for custom enterprise solutions or if you have specific requirements.
          </p>
          <Button variant="outline">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
