export interface Transaction {
  version: string;
  timestamp: string;
  type: string;
  sender: string;
  recipient?: string;
  amount?: string;
  status: string;
  hash: string;
  gasUsed?: string;
  fee?: string;
  functionName?: string;
}