import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BaseDataTable, { ColumnDef } from './tables/BaseDataTable';
import { PackageData, fetchRecentPackages, truncateAddress } from '@/services/indexerApi';
import { Package, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * PackagesPage Component
 * Full page view for all packages with detailed information
 */
const PackagesPage: React.FC = () => {
  const [data, setData] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data function
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const packages = await fetchRecentPackages(50); // Load more for full page
      setData(packages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load packages data');
      console.error('Error loading packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Set up auto-refresh every 60 seconds
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle package click
  const handlePackageClick = (address: string) => {
    window.open(`https://explorer.movementlabs.xyz/account/${address}`, '_blank');
  };

  // Column definitions for the table
  const columns: ColumnDef<PackageData>[] = [
    {
      key: 'packageAddress',
      header: 'Package Address',
      className: 'min-w-[160px]',
      cell: (value: string, row: PackageData) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
            <Package className="h-3 w-3 text-primary" />
          </div>
          <Button
            variant="ghost"
            className="p-0 h-auto font-mono text-sm text-primary hover:text-primary/80"
            onClick={() => handlePackageClick(value)}
          >
            {truncateAddress(value)}
          </Button>
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </div>
      )
    },
    {
      key: 'creator',
      header: 'Creator',
      className: 'min-w-[120px]',
      cell: (value: string) => (
        <span className="font-mono text-sm text-muted-foreground">
          {value}
        </span>
      )
    },
    {
      key: 'deployTime',
      header: 'Deploy Time',
      className: 'min-w-[100px]',
      cell: (value: string) => (
        <span className="text-sm text-muted-foreground">
          {value}
        </span>
      )
    },
    {
      key: 'transactionVersion',
      header: 'Version',
      className: 'text-right w-20',
      cell: (value: number) => (
        <span className="font-mono text-sm text-foreground">
          {value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'resourceType',
      header: 'Type',
      className: 'min-w-[200px]',
      cell: (value: string) => (
        <span className="font-mono text-xs text-muted-foreground break-all">
          {value.split('::').pop() || value}
        </span>
      )
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Packages</h1>
          <p className="text-muted-foreground mt-2">
            Explore all deployed packages on the Movement Network
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Packages Table */}
        <BaseDataTable
          data={data}
          columns={columns}
          title="Recent Packages"
          maxEntries={50}
          loading={loading}
          error={error || undefined}
          emptyMessage="No packages available"
          className="cyberpunk-card-packages"
        />

        {/* Additional package analytics can be added here */}
        <Card className="cyberpunk-card">
          <CardHeader>
            <CardTitle>Package Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Advanced package analytics and deployment insights coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PackagesPage;
