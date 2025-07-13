import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationContext } from '@/contexts/NavigationContext';

export interface ColumnDef<T> {
  key: keyof T;
  header: string;
  cell?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface BaseDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  title: string;
  maxEntries?: number;
  viewAllRoute?: string;
  viewAllLabel?: string;
  loading?: boolean;
  error?: string;
  className?: string;
  showPagination?: boolean;
  sortable?: boolean;
  emptyMessage?: string;
}

/**
 * BaseDataTable Component
 * Reusable table component with cyberpunk theme, loading states, and "View All" functionality
 */
export function BaseDataTable<T>({
  data,
  columns,
  title,
  maxEntries = 10,
  viewAllRoute,
  viewAllLabel = 'View All',
  loading = false,
  error,
  className,
  showPagination = false,
  sortable = false,
  emptyMessage = 'No data available'
}: BaseDataTableProps<T>) {
  const { navigateWithState } = useNavigationContext();

  // Limit data to maxEntries
  const displayData = data.slice(0, maxEntries);

  const handleViewAll = () => {
    if (viewAllRoute) {
      navigateWithState(viewAllRoute);
    }
  };

  const renderCell = (column: ColumnDef<T>, row: T) => {
    const value = row[column.key];
    if (column.cell) {
      return column.cell(value, row);
    }
    return value?.toString() || '-';
  };

  const renderLoadingSkeleton = () => (
    <TableBody>
      {Array.from({ length: maxEntries }).map((_, index) => (
        <TableRow key={index}>
          {columns.map((column, colIndex) => (
            <TableCell key={colIndex} className={column.className}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );

  const renderError = () => (
    <div className="flex items-center justify-center p-8 text-muted-foreground">
      <AlertCircle className="mr-2 h-4 w-4" />
      <span>{error}</span>
    </div>
  );

  const renderEmpty = () => (
    <div className="flex items-center justify-center p-8 text-muted-foreground">
      <span>{emptyMessage}</span>
    </div>
  );

  return (
    <Card className={cn('cyberpunk-card', className)}>
      {title && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">
            {title}
          </CardTitle>
          {viewAllRoute && !loading && !error && data.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAll}
              className="cyberpunk-button-secondary"
            >
              {viewAllLabel}
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          )}
        </CardHeader>
      )}
      {!title && viewAllRoute && !loading && !error && data.length > 0 && (
        <div className="flex justify-end px-6 pt-4 pb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewAll}
            className="cyberpunk-button-secondary"
          >
            {viewAllLabel}
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        </div>
      )}
      <CardContent className={title ? "p-6" : "px-6 pb-6 pt-2"}>
        {error ? (
          renderError()
        ) : (
          <div className="rounded-md border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-muted/50">
                    {columns.map((column, index) => (
                      <TableHead
                        key={index}
                        className={cn(
                          'text-muted-foreground font-medium whitespace-nowrap',
                          column.className
                        )}
                      >
                        {column.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
              {loading ? (
                renderLoadingSkeleton()
              ) : data.length === 0 ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      {renderEmpty()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {displayData.map((row, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      className="border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      {columns.map((column, colIndex) => (
                        <TableCell
                          key={colIndex}
                          className={cn(
                            'text-foreground whitespace-nowrap',
                            column.className
                          )}
                        >
                          {renderCell(column, row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              )}
              </Table>
            </div>
          </div>
        )}
        {data.length > maxEntries && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Showing {maxEntries} of {data.length} entries
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BaseDataTable;
