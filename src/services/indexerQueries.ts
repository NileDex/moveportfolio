import { gql } from 'graphql-request';

// Movement Network Indexer GraphQL endpoint
export const INDEXER_ENDPOINT = 'https://indexer.mainnet.movementnetwork.xyz/v1/graphql';

// GraphQL Queries for Dashboard Components

// Top Accounts Data
export const GET_TOP_ACCOUNTS = gql`
  query GetTopAccounts($limit: Int = 8) {
    current_coin_balances(
      limit: $limit
      order_by: {amount: desc}
      where: {coin_type: {_eq: "0x1::aptos_coin::AptosCoin"}}
    ) {
      owner_address
      amount
      coin_type
      last_transaction_version
    }
  }
`;

// Account Transaction Count
export const GET_ACCOUNT_TRANSACTIONS_COUNT = gql`
  query GetAccountTransactionsCount($addresses: [String!]!) {
    account_transactions_aggregate(
      where: {account_address: {_in: $addresses}}
    ) {
      aggregate {
        count
      }
      nodes {
        account_address
      }
    }
  }
`;

// Top Validators Data
export const GET_TOP_VALIDATORS = gql`
  query GetTopValidators($limit: Int = 8) {
    current_delegated_staking_pool_balances(
      limit: $limit
      order_by: {total_coins: desc}
    ) {
      staking_pool_address
      total_coins
      total_shares
      operator_commission_percentage
    }
  }
`;

// Validator Information
export const GET_VALIDATOR_INFO = gql`
  query GetValidatorInfo($pool_addresses: [String!]!) {
    events(
      where: {
        account_address: {_in: $pool_addresses}
        type: {_like: "%ValidatorConfig%"}
      }
      limit: 10
      order_by: {transaction_version: desc}
    ) {
      account_address
      data
      type
      transaction_version
    }
  }
`;

// Top Tokens Data
export const GET_TOP_TOKENS = gql`
  query GetTopTokens($limit: Int = 8) {
    coin_infos(
      limit: $limit
      order_by: {transaction_version_created: desc}
    ) {
      coin_type
      name
      symbol
      decimals
      supply_aggregator_table_handle
      supply_aggregator_table_key
      transaction_version_created
    }
  }
`;

// Token Activities
export const GET_TOKEN_ACTIVITIES = gql`
  query GetTokenActivities($coin_types: [String!]!) {
    coin_activities_aggregate(
      where: {coin_type: {_in: $coin_types}}
    ) {
      aggregate {
        count
        sum {
          amount
        }
      }
      nodes {
        coin_type
      }
    }
  }
`;

// Recent Packages Data
export const GET_RECENT_PACKAGES = gql`
  query GetRecentPackages($limit: Int = 8) {
    move_resources(
      where: {type: {_like: "%::code::PackageRegistry%"}}
      limit: $limit
      order_by: {transaction_version: desc}
    ) {
      address
      type
      data
      transaction_version
    }
  }
`;

// Latest Transactions
export const GET_LATEST_TRANSACTIONS = gql`
  query GetLatestTransactions($limit: Int = 10) {
    user_transactions(
      limit: $limit
      order_by: {version: desc}
    ) {
      version
      sender
      sequence_number
      max_gas_amount
      gas_unit_price
      timestamp
      entry_function_id_str
    }
  }
`;

// Latest Blocks
export const GET_LATEST_BLOCKS = gql`
  query GetLatestBlocks($limit: Int = 10) {
    block_metadata_transactions(
      limit: $limit
      order_by: {version: desc}
    ) {
      version
      timestamp
      epoch
      round
      proposer
      failed_proposer_indices
      block_height
    }
  }
`;

// Network Information
export const GET_NETWORK_INFO = gql`
  query GetNetworkInfo {
    ledger_infos(
      limit: 1
      order_by: {chain_id: desc}
    ) {
      chain_id
      epoch
      ledger_version
      oldest_ledger_version
      ledger_timestamp
    }
  }
`;

// Account Activity Over Time
export const GET_ACCOUNT_ACTIVITY = gql`
  query GetAccountActivity($start_date: timestamp, $end_date: timestamp) {
    account_transactions(
      where: {inserted_at: {_gte: $start_date, _lte: $end_date}}
      order_by: {inserted_at: asc}
    ) {
      account_address
      inserted_at
      transaction_version
    }
  }
`;

// Transaction Volume Over Time
export const GET_TRANSACTION_VOLUME = gql`
  query GetTransactionVolume($start_date: timestamp, $end_date: timestamp) {
    user_transactions_aggregate(
      where: {timestamp: {_gte: $start_date, _lte: $end_date}}
    ) {
      aggregate {
        count
      }
      nodes {
        timestamp
        version
      }
    }
  }
`;

// Block Data for Performance Charts
export const GET_BLOCK_DATA = gql`
  query GetBlockData($start_date: timestamp, $end_date: timestamp) {
    block_metadata_transactions(
      where: {timestamp: {_gte: $start_date, _lte: $end_date}}
      order_by: {timestamp: asc}
    ) {
      timestamp
      round
      epoch
      version
    }
  }
`;

// Coin Supply Information
export const GET_COIN_SUPPLY = gql`
  query GetCoinSupply($coin_type: String = "0x1::aptos_coin::AptosCoin") {
    coin_supply(
      where: {coin_type: {_eq: $coin_type}}
      limit: 1
      order_by: {transaction_version: desc}
    ) {
      coin_type
      supply
      transaction_version
    }
  }
`;

// Staking Activities
export const GET_STAKING_ACTIVITIES = gql`
  query GetStakingActivities($limit: Int = 100) {
    delegated_staking_activities(
      limit: $limit
      order_by: {transaction_version: desc}
    ) {
      delegator_address
      pool_address
      amount
      event_type
      transaction_version
    }
  }
`;

// Enhanced Network Activity Data
export const GET_DAILY_TRANSACTION_STATS = gql`
  query GetDailyTransactionStats($start_date: timestamp!, $end_date: timestamp!) {
    user_transactions(
      where: {timestamp: {_gte: $start_date, _lte: $end_date}}
      order_by: {timestamp: asc}
    ) {
      timestamp
      gas_used
      gas_unit_price
      success
      version
    }
  }
`;

export const GET_DAILY_BLOCK_STATS = gql`
  query GetDailyBlockStats($start_date: timestamp!, $end_date: timestamp!) {
    block_metadata_transactions(
      where: {timestamp: {_gte: $start_date, _lte: $end_date}}
      order_by: {timestamp: asc}
    ) {
      timestamp
      version
      epoch
      round
    }
  }
`;

export const GET_DAILY_ACCOUNT_ACTIVITY = gql`
  query GetDailyAccountActivity($start_date: timestamp!, $end_date: timestamp!) {
    account_transactions(
      where: {transaction_version: {_gte: 0}}
      distinct_on: [account_address]
    ) {
      account_address
      transaction_version
    }
  }
`;

// Data Interfaces
export interface AccountData {
  rank: number;
  address: string;
  balance: string;
  percentage: number;
  transactions24h: number;
  lastSeen?: string;
}

export interface ValidatorData {
  rank: number;
  validator: string;
  stakeAmount: string;
  commission: number;
  apy: number;
  status: 'active' | 'inactive' | 'jailed';
}

export interface TokenData {
  rank: number;
  token: string;
  symbol: string;
  coinType: string;
  decimals: number;
  totalActivities: number;
  totalVolume: string;
  deployedAt: string;
}

export interface PackageData {
  packageAddress: string;
  creator: string;
  deployTime: string;
  transactionVersion: number;
  resourceType: string;
  packageData: any;
}

export interface TransactionData {
  version: number;
  hash: string;
  sender: string;
  timestamp: string;
  gasUsed: number;
  success: boolean;
}

export interface BlockData {
  version: number;
  hash: string;
  timestamp: string;
  epoch: number;
  round: number;
  proposer: string;
}
