import { useState, useEffect } from 'react';
import { useAccount } from '@razorlabs/razorkit';
import { Aptos, Network, AptosConfig } from '@aptos-labs/ts-sdk';
import { FaSpinner } from 'react-icons/fa';
import Penguin from '../assets/Penguin.png';

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

  const aptosConfig = new AptosConfig({
    fullnode: 'https://mainnet.movementnetwork.xyz/v1',
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
    if (!amountArg) return '0';
    
    try {
      let amount = String(amountArg);
      if (amount.startsWith('0x')) {
        amount = parseInt(amount, 16).toString();
      }
      return (Number(amount) / 10**8).toFixed(4); // Assuming 8 decimals for MOVE
    } catch {
      return '0';
    }
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
      // Verify account existence
      try {
        await aptos.getAccountInfo({ accountAddress: walletAddress });
      } catch (error) {
        if ((error as { errorCode?: string }).errorCode === 'account_not_found') {
          setTransactions([]);
          setLoading(false);
          return;
        }
        throw error;
      }

      // Fetch transactions
      const accountTransactions = await aptos.getAccountTransactions({
        accountAddress: walletAddress,
        options: {
          limit: TRANSACTIONS_PER_PAGE,
          offset: (page - 1) * TRANSACTIONS_PER_PAGE,
        },
      });

      // Calculate total pages
      const accountInfo = await aptos.getAccountInfo({ accountAddress: walletAddress });
      const totalTransactions = Number(accountInfo.sequence_number) || 100;
      setTotalPages(Math.ceil(totalTransactions / TRANSACTIONS_PER_PAGE));

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

      setTransactions(processedTransactions);
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
    <div className="profiz-transaction-hub">
      <div className="transactions-container">
        <div className="transactions-header">
          <div className="wallet-address-display">
            {walletAddress ? (
              <span className="wallet-address">
                {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
              </span>
            ) : (
              <span className="no-wallet">No wallet connected</span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="transactions-loading">
            <FaSpinner className="spinner-icon" />
            <p>Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="transactions-error">
            <img src={Penguin} alt="Error" className="error-image" />
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={() => fetchTransactions(currentPage)}>
              Try Again
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="no-transactions">
            <img src={Penguin} alt="No transactions" className="no-transactions-image" />
            <p>No transactions found for this wallet</p>
          </div>
        ) : (
          <>
            <div className="transactions-table-container">
              <table className="transactions-table">
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
                        <div className="tx-type-container">
                          {getTransactionTypeIcon(tx.type, tx.sender)}
                          <span className="tx-type">{tx.type}</span>
                        </div>
                      </td>
                      <td>{tx.timestamp}</td>
                      <td>{truncateAddress(tx.sender)}</td>
                      <td>
                        <div className={`status-badge ${tx.status.toLowerCase()}`}>
                          {tx.status}
                        </div>
                      </td>
                      <td>
                        <a 
                          href={`${EXPLORER_BASE_URL}/txn/${tx.hash}?network=mainnet&account=${walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="explorer-link"
                        >
                          View on Explorer
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="skip-last"
              >
                Skip to Last
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}