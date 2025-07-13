import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaCoins } from 'react-icons/fa';

/**
 * TokensPage Component
 * Placeholder for the tokens page
 * Will be enhanced in Phase 3 with token listings and market data
 */
const TokensPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FaCoins />
              <CardTitle>Tokens</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Token listings and market data</p>
          </CardHeader>
          <CardContent>
            <div style={{ 
              textAlign: 'center', 
              padding: 'var(--spacing-8)',
              color: 'var(--text-secondary)' 
            }}>
              <FaCoins size={48} style={{ marginBottom: 'var(--spacing-4)' }} />
              <h3>Token Explorer Coming Soon</h3>
              <p>This page will display token information and market data.</p>
              <p>Features will include:</p>
              <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                <li>Token listings and prices</li>
                <li>Market capitalization data</li>
                <li>Trading volume statistics</li>
                <li>Token holder information</li>
                <li>Contract verification status</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TokensPage;
