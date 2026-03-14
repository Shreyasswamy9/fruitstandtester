"use client";

import { useSurveyMode } from "@/hooks/useSurveyMode";

export default function SurveyTestPage() {
  const isSurveyMode = useSurveyMode();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Survey Mode Test Page
          </h1>
          
          <div className="mb-8 p-4 rounded-lg bg-blue-50">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Current Mode: Survey Mode
            </h2>
            <p className="text-blue-800">
              Prices are hidden and cart functionality is disabled for market research.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Sample Product Card</h3>
              <div className="bg-gray-200 aspect-square mb-4 rounded-lg flex items-center justify-center">
                <span className="text-gray-600">Product Image</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">Sample Product Name</h4>
              <p className="text-gray-600 mb-4">Product description and details remain visible for research purposes.</p>
              
              {isSurveyMode ? (
                <div className="space-y-2">
                  <p className="text-gray-500 font-medium">Coming Soon</p>
                  <div className="bg-gray-800 text-white py-3 px-4 rounded text-center">
                    <span className="text-sm font-semibold uppercase tracking-wider">
                      More Information Coming Soon
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-900">$45</p>
                  <button className="w-full bg-black text-white py-3 px-4 rounded hover:bg-gray-800">
                    Add to Cart
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Survey Project Mode</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Survey Mode:</strong> Always enabled across this project</p>
                  <p><strong>Pricing and Cart:</strong> Permanently hidden/disabled for research links</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <a 
                    href="/shop/forest-hills-hat" 
                    className="block text-blue-600 hover:underline"
                  >
                    Forest Hills Hat
                  </a>
                  <a 
                    href="/shop/gala-tshirt" 
                    className="block text-blue-600 hover:underline"
                  >
                    Gala Tee
                  </a>
                  <a 
                    href="/shop" 
                    className="block text-blue-600 hover:underline"
                  >
                    Shop Grid
                  </a>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Implementation Status</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>✅ Price component (shows "Coming Soon")</li>
                  <li>✅ Product purchase bar (disabled with message)</li>
                  <li>✅ Product grid (prices hidden)</li>
                  <li>✅ Forest Hills Hat page</li>
                  <li>✅ Gala Tee page</li>
                  <li>⚠️ Other product pages (need manual updates)</li>
                  <li>✅ Cart functionality (already disabled)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}