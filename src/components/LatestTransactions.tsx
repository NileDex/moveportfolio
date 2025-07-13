import React, { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BaseDataTable, { ColumnDef } from './tables/BaseDataTable';
import { TransactionData, fetchLatestTransactions, truncateAddress, formatTimestamp } from '@/services/indexerApi';

// Helper function to format relative time
const formatRelativeTime = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} secs ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

// Helper function to format full date/time for hover
const formatFullDateTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString();
};

export interface LatestTransactionsProps {
  className?: string;
  limit?: number;
  refreshInterval?: number;
  onTransactionClick?: (hash: string) => void;
}

/**
 * LatestTransactions Component
 * Displays a live feed of the latest transactions using real Movement Network indexer data
 * Auto-refreshes to show real-time blockchain activity
 */
const LatestTransactions: React.FC<LatestTransactionsProps> = ({
  className,
  limit = 10,
  refreshInterval = 15000, // 15 seconds
  onTransactionClick
}) => {
  const [data, setData] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data function
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const transactions = await fetchLatestTransactions(limit);
      setData(transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions data');
      console.error('Error loading latest transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle transaction click
  const handleTransactionClick = (hash: string) => {
    if (onTransactionClick) {
      onTransactionClick(hash);
    } else {
      window.open(`https://explorer.movementlabs.xyz/txn/${hash}`, '_blank');
    }
  };

  // Load data on component mount and set up refresh interval
  useEffect(() => {
    loadData();

    if (refreshInterval > 0) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, limit]);

  // Column definitions for the table
  const columns: ColumnDef<TransactionData>[] = [
    {
      key: 'hash',
      header: 'Transaction Hash',
      className: 'min-w-[140px]',
      cell: (value: string, row: TransactionData) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            className="p-0 h-auto font-mono text-sm text-primary hover:text-primary/80"
            onClick={() => handleTransactionClick(value)}
          >
            {truncateAddress(value)}
          </Button>
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </div>
      )
    },
    {
      key: 'sender',
      header: 'From',
      className: 'min-w-[100px]',
      cell: (value: string) => (
        <span className="font-mono text-sm text-muted-foreground">
          {truncateAddress(value)}
        </span>
      )
    },
    {
      key: 'timestamp',
      header: 'Time',
      className: 'min-w-[80px]',
      cell: (value: string, row: TransactionData) => (
        <span
          className="text-sm text-muted-foreground cursor-help"
          title={formatFullDateTime(row.timestamp)}
        >
          {formatRelativeTime(row.timestamp)}
        </span>
      )
    },
    {
      key: 'gasUsed',
      header: 'Gas Used',
      className: 'text-right w-20',
      cell: (value: number) => (
        <span className="font-mono text-sm text-foreground">
          {value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'success',
      header: 'Status',
      className: 'text-center w-16',
      cell: (value: boolean) => (
        <div className="flex justify-center">
          {value ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
      )
    }
  ];

  return (
    <BaseDataTable
      data={data}
      columns={columns}
      title="Latest Transactions"
      maxEntries={limit}
      viewAllRoute="/transactions"
      viewAllLabel="View All Transactions"
      loading={loading}
      error={error || undefined}
      emptyMessage="No transactions available"
      className={cn('cyberpunk-card-transactions', className)}
    />
  );
};

export default LatestTransactions;
