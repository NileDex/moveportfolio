import React from 'react';

import SubscriptionPlans from './SubscriptionPlans';

/**
 * PricingPage Component
 * Dedicated pricing page showcasing subscription plans and monetization
 */
const PricingPage: React.FC = () => {
  const handlePlanSelect = (planId: string) => {
    console.log('Selected plan:', planId);
    // In a real implementation, this would handle plan selection/upgrade
    if (planId === 'enterprise') {
      // Open contact form or redirect to sales
      window.open('mailto:sales@movementlabs.xyz?subject=Enterprise Plan Inquiry', '_blank');
    } else if (planId !== 'free') {
      // Open payment flow
      alert(`Upgrade to ${planId} plan - Payment integration would go here`);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-3">
      <SubscriptionPlans 
        currentPlan="free"
        onPlanSelect={handlePlanSelect}
      />
    </div>
  );
};

export default PricingPage;
