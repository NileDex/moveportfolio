import React from 'react';
import LatestTransactions from './LatestTransactions';
import { Card, CardHeader, CardContent } from './ui/card';

/**
 * TransactionsPage Component
 * General blockchain transactions explorer showing all network transactions
 * This is different from wallet-specific transactions in WalletTransactions.tsx
 */
const TransactionsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Network Transactions</h1>
        <p className="text-muted-foreground">
          Explore all transactions on the Movement Network blockchain
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Latest Transactions</h2>
        </CardHeader>
        <CardContent>
          <LatestTransactions 
            limit={50}
            refreshInterval={15000}
            className="w-full"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;
