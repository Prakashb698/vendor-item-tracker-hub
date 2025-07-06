
import SubscriptionManager from "@/components/SubscriptionManager";

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
    </div>
  );
};

export default Pricing;
