import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TopAccountsTable from './tables/TopAccountsTable';

/**
 * AccountsPage Component
 * Full page view for all accounts with detailed information
 */
const AccountsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Accounts</h1>
          <p className="text-muted-foreground mt-2">
            Explore all accounts on the Movement Network
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Top Accounts Section */}
        <TopAccountsTable />

        {/* Additional account analytics can be added here */}
        <Card className="cyberpunk-card">
          <CardHeader>
            <CardTitle>Account Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Advanced account analytics and insights coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountsPage;
