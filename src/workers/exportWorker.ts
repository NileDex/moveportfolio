import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

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

const TRANSACTIONS_PER_PAGE = 20;

const aptosConfig = new AptosConfig({
  fullnode: '/api',
  network: Network.CUSTOM,
});
const aptos = new Aptos(aptosConfig);

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

const fetchAllTransactionsForExport = async (walletAddress: string): Promise<Transaction[]> => {
  if (!walletAddress) return [];

  let accountInfo;
  try {
    accountInfo = await aptos.getAccountInfo({ accountAddress: walletAddress });
  } catch {
    return []; // Account not found or other error
  }

  const totalTransactions = Number(accountInfo.sequence_number) || 0;
  if (totalTransactions === 0) return [];

  const allTransactions: Transaction[] = [];
  const totalPagesToFetch = Math.ceil(totalTransactions / TRANSACTIONS_PER_PAGE);

  for (let page = 1; page <= totalPagesToFetch; page++) {
    const offset = totalTransactions - page * TRANSACTIONS_PER_PAGE;
    const limit = offset < 0 ? TRANSACTIONS_PER_PAGE + offset : TRANSACTIONS_PER_PAGE;
    const actualOffset = Math.max(0, offset);

    if (limit <= 0) continue;

    const accountTransactions = await aptos.getAccountTransactions({
      accountAddress: walletAddress,
      options: { limit, offset: actualOffset },
    });

    const processed = accountTransactions.map((tx: any) => {
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
    allTransactions.push(...processed.reverse());
  }
  // The final list needs to be reversed because we fetch from latest to oldest
  return allTransactions.reverse();
};

self.onmessage = async (e: MessageEvent<{ walletAddress: string }>) => {
  const { walletAddress } = e.data;
  if (walletAddress) {
    try {
      const allTransactions = await fetchAllTransactionsForExport(walletAddress);
      
      const headers = ["Version", "Timestamp", "Type", "Sender", "Recipient", "Amount", "Status", "Hash"];
      const csvContent = [
        headers.join(','),
        ...allTransactions.map(tx => [
          `"${tx.version}"`,
          `"${tx.timestamp}"`,
          `"${tx.type}"`,
          `"${tx.sender}"`,
          `"${tx.recipient || ''}"`,
          `"${tx.amount || ''}"`,
          `"${tx.status}"`,
          `"${tx.hash}"`
        ].join(','))
      ].join('\n');
      
      postMessage({ status: 'completed', csvContent });
    } catch (error) {
      postMessage({ status: 'error', error: (error as Error).message });
    }
  }
};

export {};