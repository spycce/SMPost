
import React from 'react';
import { Card, Button, Badge } from '../components/UIComponents';
import { SUBSCRIPTION_PLANS, MOCK_USER } from '../constants';

export const Billing: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription & Billing</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your plan, payment methods, and invoices.</p>
      </div>

      {/* Current Plan Overview */}
      <Card className="p-6 border-brand-200 bg-brand-50/30">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
                <h3 className="text-sm font-medium text-brand-600 uppercase tracking-wider">Current Plan</h3>
                <div className="mt-1 flex items-baseline">
                    <span className="text-3xl font-extrabold text-gray-900">{MOCK_USER.plan}</span>
                    <span className="ml-2 text-sm text-gray-500">/monthly</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">Next billing date: <span className="font-medium text-gray-900">October 24, 2024</span></p>
            </div>
            <div className="flex gap-3">
                <Button variant="secondary">Manage Payment Method</Button>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Cancel Plan</Button>
            </div>
        </div>
      </Card>

      {/* Plans Grid */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => {
                const isCurrent = plan.name === MOCK_USER.plan;
                return (
                    <Card key={plan.id} className={`p-6 relative flex flex-col ${isCurrent ? 'ring-2 ring-brand-500 border-transparent' : 'hover:shadow-lg transition-shadow'}`}>
                        {plan.recommended && (
                            <div className="absolute top-0 right-0 -mt-2 -mr-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-500 text-white shadow-sm">
                                    Recommended
                                </span>
                            </div>
                        )}
                        <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                        <div className="mt-4 flex items-baseline">
                            <span className="text-3xl font-extrabold text-gray-900">${plan.price}</span>
                            <span className="ml-1 text-gray-500">/mo</span>
                        </div>
                        <ul className="mt-6 space-y-4 flex-1">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-sm text-gray-600">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-8">
                            <Button 
                                className="w-full" 
                                variant={isCurrent ? 'outline' : 'primary'}
                                disabled={isCurrent}
                            >
                                {isCurrent ? 'Current Plan' : 'Upgrade'}
                            </Button>
                        </div>
                    </Card>
                );
            })}
        </div>
      </div>

      {/* Invoice History */}
      <Card className="p-0 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Invoice History</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {[1, 2, 3].map((i) => (
                      <tr key={i}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sep 24, 2024</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$99.00</td>
                          <td className="px-6 py-4 whitespace-nowrap"><Badge color="green">Paid</Badge></td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <a href="#" className="text-brand-600 hover:text-brand-900">Download</a>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </Card>
    </div>
  );
};
