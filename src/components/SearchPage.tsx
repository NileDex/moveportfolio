import React, { useState } from 'react';
import AdvancedSearch, { SearchFilter } from './AdvancedSearch';
import EnhancedTransactionTable, { EnhancedTransaction } from './EnhancedTransactionTable';
import MovementDataService from '../services/MovementDataService';

/**
 * SearchPage Component
 * Dedicated search page with advanced filtering and results display
 * Showcases the comprehensive search functionality
 */
const SearchPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState<EnhancedTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState('');

  const handleSearch = async (query: string, filters: SearchFilter) => {
    setLoading(true);
    setLastQuery(query);
    
    try {
      // In a real implementation, you would pass the filters to the API
      // For now, we'll fetch recent transactions and simulate filtering
      const transactions = await MovementDataService.getLatestTransactions(50);
      
      // Convert to EnhancedTransaction format
      const enhancedTransactions: EnhancedTransaction[] = transactions.map(tx => ({
        version: tx.version,
        timestamp: tx.timestamp,
        type: tx.type,
        sender: tx.sender,
        recipient: tx.recipient,
        amount: tx.amount,
        status: tx.status,
        hash: tx.hash,
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice,
        fee: tx.fee,
        functionName: tx.functionName
      }));
      
      // Apply client-side filtering (in production, this would be server-side)
      let filteredResults = enhancedTransactions;
      
      // Filter by query (search in hash, sender, recipient)
      if (query.trim()) {
        const searchTerm = query.toLowerCase();
        filteredResults = filteredResults.filter(tx =>
          tx.hash.toLowerCase().includes(searchTerm) ||
          tx.sender.toLowerCase().includes(searchTerm) ||
          (tx.recipient && tx.recipient.toLowerCase().includes(searchTerm))
        );
      }
      
      // Filter by transaction types
      if (filters.transactionTypes.length > 0) {
        filteredResults = filteredResults.filter(tx =>
          filters.transactionTypes.includes(tx.type)
        );
      }
      
      // Filter by status
      if (filters.status.length > 0) {
        filteredResults = filteredResults.filter(tx =>
          filters.status.includes(tx.status)
        );
      }
      
      // Filter by amount range
      if (filters.amountRange.min || filters.amountRange.max) {
        filteredResults = filteredResults.filter(tx => {
          if (!tx.amount) return false;
          
          const amount = parseFloat(tx.amount.replace(/[^\d.]/g, ''));
          const min = filters.amountRange.min ? parseFloat(filters.amountRange.min) : 0;
          const max = filters.amountRange.max ? parseFloat(filters.amountRange.max) : Infinity;
          
          return amount >= min && amount <= max;
        });
      }
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-3">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 style={{ 
            fontSize: 'var(--font-size-2xl)', 
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-color)',
            margin: '0 0 var(--spacing-2) 0'
          }}>
            Advanced Search
          </h1>
          <p style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            Search transactions, addresses, blocks, and more with advanced filtering options
          </p>
        </div>

        {/* Advanced Search Component */}
        <AdvancedSearch
          onSearch={handleSearch}
          placeholder="Search by transaction hash, address, block number..."
          showFilters={true}
        />

        {/* Search Results */}
        {(loading || searchResults.length > 0 || lastQuery) && (
          <Card>
            <CardHeader
              title={loading ? 'Searching...' : `Search Results`}
              subtitle={
                loading 
                  ? 'Please wait while we search the blockchain...'
                  : lastQuery 
                    ? `${searchResults.length} results found for "${lastQuery}"`
                    : undefined
              }
            />
            <CardContent>
              {loading ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 'var(--spacing-8)',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid var(--border-color)',
                    borderTop: '3px solid var(--primary-color)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: 'var(--spacing-3)'
                  }}></div>
                  Searching blockchain data...
                </div>
              ) : searchResults.length > 0 ? (
                <EnhancedTransactionTable
                  transactions={searchResults}
                  walletAddress="0x0" // Placeholder
                  onTransactionClick={(hash) => {
                    window.open(
                      `https://explorer.movementlabs.xyz/txn/${hash}?network=mainnet`,
                      '_blank'
                    );
                  }}
                />
              ) : lastQuery ? (
                <div style={{
                  textAlign: 'center',
                  padding: 'var(--spacing-8)',
                  color: 'var(--text-secondary)'
                }}>
                  <h3>No results found</h3>
                  <p>Try adjusting your search terms or filters</p>
                  <ul style={{
                    textAlign: 'left',
                    maxWidth: '400px',
                    margin: 'var(--spacing-4) auto 0',
                    listStyle: 'none',
                    padding: 0
                  }}>
                    <li>• Check for typos in addresses or transaction hashes</li>
                    <li>• Try searching with fewer filters</li>
                    <li>• Use partial addresses (first 6-8 characters)</li>
                    <li>• Expand your date range if using date filters</li>
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Search Tips */}
        {!lastQuery && (
          <Card>
            <CardHeader>
              <h3>Search Examples</h3>
            </CardHeader>
            <CardContent>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'var(--spacing-4)'
              }}>
                <div>
                  <h4 style={{ 
                    color: 'var(--text-color)', 
                    margin: '0 0 var(--spacing-2) 0',
                    fontSize: 'var(--font-size-base)'
                  }}>
                    What you can search:
                  </h4>
                  <ul style={{
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                    lineHeight: 1.6,
                    margin: 0,
                    paddingLeft: 'var(--spacing-4)'
                  }}>
                    <li>Transaction hashes (full or partial)</li>
                    <li>Wallet addresses (full or partial)</li>
                    <li>Block numbers and hashes</li>
                    <li>Contract addresses</li>
                    <li>Token symbols and names</li>
                  </ul>
                </div>
                
                <div>
                  <h4 style={{ 
                    color: 'var(--text-color)', 
                    margin: '0 0 var(--spacing-2) 0',
                    fontSize: 'var(--font-size-base)'
                  }}>
                    Advanced features:
                  </h4>
                  <ul style={{
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                    lineHeight: 1.6,
                    margin: 0,
                    paddingLeft: 'var(--spacing-4)'
                  }}>
                    <li>Filter by transaction type</li>
                    <li>Set date and amount ranges</li>
                    <li>Save frequently used searches</li>
                    <li>View search history</li>
                    <li>Export search results</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
