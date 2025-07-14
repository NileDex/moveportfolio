import React, { useState, useEffect } from 'react';
import { ExternalLink, User, Box } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BaseDataTable, { ColumnDef } from './tables/BaseDataTable';
import { BlockData, fetchLatestBlocks, truncateAddress } from '@/services/indexerApi';

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

export interface LatestBlocksProps {
  className?: string;
  limit?: number;
  refreshInterval?: number;
  onBlockClick?: (blockNumber: number) => void;
}

/**
 * LatestBlocks Component
 * Displays a live feed of the latest blocks using real Movement Network indexer data
 * Auto-refreshes to show real-time blockchain activity
 */
const LatestBlocks: React.FC<LatestBlocksProps> = ({
  className,
  limit = 10,
  refreshInterval = 15000, // 15 seconds
  onBlockClick
}) => {
  const [data, setData] = useState<BlockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data function
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const blocks = await fetchLatestBlocks(limit);
      setData(blocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blocks data');
      console.error('Error loading latest blocks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle block click
  const handleBlockClick = (blockNumber: number) => {
    if (onBlockClick) {
      onBlockClick(blockNumber);
    } else {
      window.open(`https://explorer.movementlabs.xyz/block/${blockNumber}`, '_blank');
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
  const columns: ColumnDef<BlockData>[] = [
    {
      key: 'version',
      header: 'Block',
      className: 'min-w-[100px]',
      cell: (value: number, row: BlockData) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
            <Box className="h-3 w-3 text-primary" />
          </div>
          <Button
            variant="ghost"
            className="p-0 h-auto font-semibold text-primary hover:text-primary/80"
            onClick={() => handleBlockClick(value)}
          >
            #{value.toLocaleString()}
          </Button>
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </div>
      )
    },
    {
      key: 'hash',
      header: 'Hash',
      className: 'min-w-[120px]',
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
      cell: (value: string, row: BlockData) => (
        <span
          className="text-sm text-muted-foreground cursor-help"
          title={formatFullDateTime(row.timestamp)}
        >
          {formatRelativeTime(row.timestamp)}
        </span>
      )
    },
    {
      key: 'epoch',
      header: 'Epoch',
      className: 'text-right w-16',
      cell: (value: number) => (
        <span className="font-mono text-sm text-foreground">
          {value}
        </span>
      )
    },
    {
      key: 'proposer',
      header: 'Proposer',
      className: 'min-w-[100px]',
      cell: (value: string) => (
        <div className="flex items-center space-x-2">
          <User className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono text-sm text-muted-foreground">
            {truncateAddress(value)}
          </span>
        </div>
      )
    }
  ];

  return (
    <BaseDataTable
      data={data}
      columns={columns}
      title="Latest Blocks"
      maxEntries={limit}
      viewAllRoute="/blocks"
      viewAllLabel="View All Blocks"
      loading={loading}
      error={error || undefined}
      emptyMessage="No blocks available"
      className={cn('cyberpunk-card-blocks', className)}
    />
  );
};

export default LatestBlocks;
