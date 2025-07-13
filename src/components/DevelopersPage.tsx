import React from 'react';

import DeveloperCorner from './DeveloperCorner';

/**
 * DevelopersPage Component
 * Dedicated page for developer resources and tools
 * Showcases the comprehensive Developer Corner section
 */
const DevelopersPage: React.FC = () => {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-3">
      <DeveloperCorner 
        showQuickStart={true}
        showCodeExamples={true}
      />
    </div>
  );
};

export default DevelopersPage;
