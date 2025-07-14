import { useState, useEffect } from 'react';
import { useAccount } from '@razorlabs/razorkit';
import { Aptos, Network, AptosConfig } from '@aptos-labs/ts-sdk';
import { FaSpinner, FaExternalLinkAlt, FaDownload, FaSearch } from 'react-icons/fa';
// import '../components/TransactionTable.css'; // Removed - using only Tailwind + shadcn

// Import design system components
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface Transaction {
  version: string;
  timestamp: string;
  type: string;
  sender: string;
  recipient?: string;
  amount?: string;
  status: string;
  hash: string;
}

interface WalletTransactionsProps {
  walletAddress?: string;
}

const TRANSACTIONS_PER_PAGE = 20;
const EXPLORER_BASE_URL = 'https://explorer.movementlabs.xyz';

export default function WalletTransactions({ walletAddress: propWalletAddress }: WalletTransactionsProps) {
  const { address: connectedAddress } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress] = useState<string>(propWalletAddress || connectedAddress || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);

  const aptosConfig = new AptosConfig({
    fullnode: '/api',
    network: Network.CUSTOM,
  });
  const aptos = new Aptos(aptosConfig);

  useEffect(() => {
    if (walletAddress) {
      fetchTransactions(currentPage);
    } else {
      setLoading(false);
      setTransactions([]);
      setError('No wallet address provided');
    }
  }, [walletAddress, currentPage]);

  const parseRecipient = (recipient: unknown): string => {
    if (!recipient) return '[Unknown]';
    
    if (typeof recipient === 'object' && recipient !== null) {
      if ('inner' in recipient) return `0x${String(recipient.inner)}`;
      if ('address' in recipient) return `0x${String(recipient.address)}`;
      if ('recipient' in recipient) return `0x${String(recipient.recipient)}`;
      return '[Contract]';
    }
    
    return typeof recipient === 'string' 
      ? recipient.startsWith('0x') ? recipient : `0x${recipient}`
      : String(recipient);
  };

  const parseAmount = (amountArg: unknown): string => {
    if (amountArg === null || typeof amountArg === 'undefined') return '';
    
    try {
      let amount = String(amountArg);
      if (amount.startsWith('0x')) {
        amount = parseInt(amount, 16).toString();
      }
      const numericAmount = Number(amount) / 10**8;
      return isNaN(numericAmount) ? '' : numericAmount.toFixed(4); // Assuming 8 decimals for MOVE
    } catch {
      return '';
    }
  };

  const exportToCsv = () => {
    if (!transactions.length || exporting) return;

    setExporting(true);

    const worker = new Worker(new URL('../workers/exportWorker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = (e: MessageEvent) => {
      const { status, csvContent, error } = e.data;

      if (status === 'completed') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', `transactions_${walletAddress}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (status === 'error') {
        console.error('Export failed:', error);
        // Optionally, show an error message to the user
      }

      setExporting(false);
      worker.terminate();
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      setExporting(false);
      worker.terminate();
    };

    worker.postMessage({ walletAddress });
  };

  const formatTimestamp = (timestampMicros: string): string => {
    try {
      const dateValue = new Date(Number(timestampMicros) / 1000);
      return isNaN(dateValue.getTime()) 
        ? 'Unknown date' 
        : dateValue.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Africa/Lagos',
          });
    } catch {
      return 'Unknown date';
    }
  };

  const fetchTransactions = async (page: number) => {
    if (!walletAddress) {
      setLoading(false);
      setError('No wallet address available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verify account existence and get info
      let accountInfo;
      try {
        accountInfo = await aptos.getAccountInfo({ accountAddress: walletAddress });
      } catch (error) {
        if ((error as { errorCode?: string }).errorCode === 'account_not_found') {
          setTransactions([]);
          setLoading(false);
          return;
        }
        throw error;
      }
      
      const totalTransactions = Number(accountInfo.sequence_number) || 0;
      if (totalTransactions === 0) {
        setTransactions([]);
        setLoading(false);
        return;
      }
      
      setTotalPages(Math.ceil(totalTransactions / TRANSACTIONS_PER_PAGE));

      // Calculate offset to get latest transactions.
      const offset = totalTransactions - page * TRANSACTIONS_PER_PAGE;

      const limit = offset < 0 ? TRANSACTIONS_PER_PAGE + offset : TRANSACTIONS_PER_PAGE;
      const actualOffset = Math.max(0, offset);
      
      if (limit <= 0) {
          setTransactions([]);
          setLoading(false);
          return;
      }

      // Fetch transactions
      const accountTransactions = await aptos.getAccountTransactions({
        accountAddress: walletAddress,
        options: {
          limit,
          offset: actualOffset,
        },
      });

      // Process transactions
      const processedTransactions = accountTransactions.map((tx: any) => {
        const type = tx.payload?.function?.includes('::transfer') ? 'Transfer'
          : tx.payload?.function?.includes('::swap') ? 'Swap'
          : tx.payload?.function?.includes('::stake') ? 'Staking'
          : 'Transaction';

        return {
          version: String(tx.version) || 'Unknown',
          timestamp: formatTimestamp(tx.timestamp),
          type,
          sender: `0x${tx.sender}` || walletAddress,
          recipient: tx.payload?.arguments?.[0] ? parseRecipient(tx.payload.arguments[0]) : undefined,
          amount: tx.payload?.arguments?.[1] ? parseAmount(tx.payload.arguments[1]) : undefined,
          status: tx.success ? 'Success' : 'Failed',
          hash: String(tx.hash) || 'Unknown',
        };
      });

      // The fetched transactions are the latest, but in ascending order. Reverse them.
      setTransactions(processedTransactions.reverse());
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(
        error instanceof Error && error.message.includes('network') ? 'Network error. Please check your connection.'
        : error instanceof Error && error.message.includes('rate limit') ? 'Too many requests. Please try again later.'
        : 'Unable to fetch transactions. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeIcon = (type: string, sender: string) => {
    const hue = sender.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0) % 360;
    const bgStyle = {
      background: `linear-gradient(45deg, hsl(${hue}, 70%, 50%), hsl(${hue + 60}, 70%, 50%))`,
    };

    return (
      <div className="tx-pfp-container">
        <div className={`tx-pfp ${type !== 'Transfer' ? 'swap-pfp' : ''}`} style={bgStyle} />
      </div>
    );
  };

  const truncateAddress = (addr: string) => {
    if (!addr || addr === '[Unknown]') return 'Unknown';
    if (addr === '[Contract]') return <span className="tx-contract">Contract</span>;
    return addr.startsWith('0x') 
      ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
      : addr;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-3">
      <div className="space-y-6">
        {/* Header Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3>Wallet Transactions</h3>
              <Button
                onClick={exportTransactions}
                disabled={!transactions.length || exporting}
                variant="secondary"
                className="export-button"
              >
                {exporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  Connected Wallet:
                </span>
                <div style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: '600',
                  fontFamily: 'monospace',
                  color: 'var(--primary-color)'
                }}>
                  {walletAddress ? (
                    `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>No wallet connected</span>
                  )}
                </div>
              </div>

              <div className="hidden md:block text-sm text-muted-foreground text-right">
                <div>Total Transactions: {transactions.length}</div>
                <div>Page {currentPage} of {totalPages}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Section */}
        {loading ? (
          <Card>
            <CardContent>
              <div className="flex items-center gap-2">
                <FaSpinner
                  style={{
                    fontSize: '2rem',
                    color: 'var(--primary-color)',
                    animation: 'spin 1s linear infinite'
                  }}
                />
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                  Loading transactions...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card style={{ borderColor: 'var(--error-color)' }}>
            <CardContent>
              <div className="flex items-center gap-2">
                <p style={{
                  color: 'var(--error-color)',
                  fontSize: 'var(--font-size-lg)',
                  marginBottom: '1rem'
                }}>
                  {error}
                </p>
                <Button
                  variant="secondary"
                  onClick={() => fetchTransactions(currentPage)}
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : transactions.length === 0 ? (
          <Card>
            <CardContent>
              <div className="flex items-center gap-2">
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                  No transactions found for this wallet
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Transactions Table */}
            <Card>
              <CardContent style={{ padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="transaction-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Timestamp</th>
                        <th>From</th>
                        <th>Status</th>
                        <th>View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.hash}>
                          <td>
                            <div className="transaction-type">
                              <div className={`transaction-type-icon transaction-type-icon--${tx.type.toLowerCase()}`}>
                                {getTransactionTypeIcon(tx.type, tx.sender)}
                              </div>
                              <span>{tx.type}</span>
                            </div>
                          </td>
                          <td>
                            <span className="transaction-timestamp">{tx.timestamp}</span>
                          </td>
                          <td>
                            <span className="transaction-address">{truncateAddress(tx.sender)}</span>
                          </td>
                          <td>
                            <span className={`transaction-status transaction-status--${tx.status.toLowerCase()}`}>
                              {tx.status}
                            </span>
                          </td>
                          <td>
                            <div className="transaction-actions">
                              <button
                                className="transaction-action-btn"
                                onClick={() => window.open(
                                  `${EXPLORER_BASE_URL}/txn/${tx.hash}?network=mainnet&account=${walletAddress}`,
                                  '_blank'
                                )}
                                title="View on Explorer"
                              >
                                <FaExternalLinkAlt />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Pagination */}
            <Card>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    Showing {((currentPage - 1) * TRANSACTIONS_PER_PAGE) + 1} to {Math.min(currentPage * TRANSACTIONS_PER_PAGE, transactions.length)} of {transactions.length} transactions
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span style={{
                      padding: '0 var(--spacing-3)',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--text-color)',
                      fontWeight: '600'
                    }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}