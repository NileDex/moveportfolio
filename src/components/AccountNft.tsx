import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAccount } from "@razorlabs/razorkit";
import { FiSearch, FiGrid } from 'react-icons/fi';
import { HiViewGrid, HiViewGridAdd } from 'react-icons/hi';
import { FaList } from 'react-icons/fa';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent } from './ui/card';
import TokenLogo from '../assets/TokenLogo.png';

interface NftData {
  collection_id: string;
  largest_property_version_v1: string;
  token_properties: any;
  supply: number | null;
  maximum: number | null;
  decimals: number | null;
  last_transaction_timestamp: string;
  current_collection: {
    collection_id: string;
    collection_name: string;
    description: string;
    creator_address: string;
    uri: string;
    current_supply: number;
    max_supply: number | null;
    total_minted_v2: number | null;
    last_transaction_timestamp: string;
  };
  description: string;
  token_name: string;
  token_data_id: string;
  token_standard: string;
  token_uri: string;
}

interface NftOwnership {
  current_token_data: NftData;
  owner_address: string;
  amount: string;
  last_transaction_timestamp: string;
  is_fungible_v2: boolean | null;
  is_soulbound_v2: boolean | null;
  property_version_v1: number;
}

type LayoutSize = 'small' | 'medium' | 'large' | 'list';

interface EnhancedMetadata {
  name?: string;
  description?: string;
  image?: string;
  animation_url?: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
    max_value?: number;
    rarity?: number;
    frequency?: number;
  }>;
  properties?: Record<string, any>;
  rarity?: {
    rank?: number;
    score?: number;
    percentile?: number;
    trait_count?: number;
  };
  market_data?: {
    floor_price?: number;
    last_sale_price?: number;
    estimated_value?: number;
    price_change_24h?: number;
    volume_24h?: number;
  };
  collection_stats?: {
    total_supply?: number;
    holders?: number;
    volume_24h?: number;
    floor_price?: number;
    total_volume?: number;
    sales_count?: number;
  };
  transfer_history?: Array<{
    from_address?: string;
    to_address?: string;
    transaction_timestamp: string;
    transaction_version: string;
    type: string;
    price?: number;
  }>;
}

// Global cache for metadata to persist across component remounts
const globalMetadataCache = new Map<string, Promise<string | null>>();
const globalImageCache = new Map<string, string>();

// Enhanced helper function to convert IPFS URI to HTTP URL with prioritized gateways
const convertIpfsToHttp = (ipfsUri: string): string[] => {
  if (!ipfsUri) return [];
  
  if (ipfsUri.startsWith('ipfs://')) {
    const hash = ipfsUri.replace('ipfs://', '');
    // Prioritized gateways - fastest first
    return [
      `https://cloudflare-ipfs.com/ipfs/${hash}`,
      `https://ipfs.io/ipfs/${hash}`,
      `https://gateway.pinata.cloud/ipfs/${hash}`,
      `https://dweb.link/ipfs/${hash}`
    ];
  }
  
  if (ipfsUri.startsWith('http')) {
    return [ipfsUri];
  }
  
  return [];
};

// Optimized metadata fetching with caching and faster timeout
const fetchNftMetadata = async (uri: string): Promise<string | null> => {
  if (!uri) return null;
  
  // Check global cache first
  if (globalImageCache.has(uri)) {
    return globalImageCache.get(uri)!;
  }
  
  // Check if we already have a pending request
  if (globalMetadataCache.has(uri)) {
    return globalMetadataCache.get(uri)!;
  }
  
  const fetchPromise = (async () => {
    try {
      const urls = convertIpfsToHttp(uri);
      
      // Use Promise.allSettled with shorter timeout for faster fallback
      const fetchPromises = urls.map(async (url) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
        
        try {
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            }
          });
          clearTimeout(timeoutId);
          
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const metadata = await response.json();
          
          // Extract image URL from various possible fields
          const imageUri = metadata.image || metadata.image_uri || metadata.imageUri || metadata.animation_url;
          if (imageUri) {
            const imageUrls = convertIpfsToHttp(imageUri);
            const finalImageUrl = imageUrls[0];
            if (finalImageUrl) {
              globalImageCache.set(uri, finalImageUrl);
              return finalImageUrl;
            }
          }
          return null;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      });
      
      // Return the first successful result
      const results = await Promise.allSettled(fetchPromises);
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          return result.value;
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Error fetching NFT metadata:', error);
      return null;
    }
  })();
  
  globalMetadataCache.set(uri, fetchPromise);
  return fetchPromise;
};

// Batch metadata fetching for better performance
const batchFetchMetadata = async (nfts: NftOwnership[]): Promise<Map<string, string>> => {
  const imageMap = new Map<string, string>();
  
  // Filter out already cached items
  const uncachedNfts = nfts.filter(nft => 
    !globalImageCache.has(nft.current_token_data.token_uri)
  );
  
  if (uncachedNfts.length === 0) {
    // Return cached results
    nfts.forEach(nft => {
      const cached = globalImageCache.get(nft.current_token_data.token_uri);
      if (cached) {
        imageMap.set(nft.current_token_data.token_data_id, cached);
      }
    });
    return imageMap;
  }
  
  // Batch fetch with concurrency limit
  const BATCH_SIZE = 10;
  const batches = [];
  
  for (let i = 0; i < uncachedNfts.length; i += BATCH_SIZE) {
    batches.push(uncachedNfts.slice(i, i + BATCH_SIZE));
  }
  
  for (const batch of batches) {
    const promises = batch.map(async (nft) => {
      const imageUrl = await fetchNftMetadata(nft.current_token_data.token_uri);
      if (imageUrl) {
        imageMap.set(nft.current_token_data.token_data_id, imageUrl);
      }
    });
    
    await Promise.allSettled(promises);
  }
  
  // Also add already cached items
  nfts.forEach(nft => {
    if (!imageMap.has(nft.current_token_data.token_data_id)) {
      const cached = globalImageCache.get(nft.current_token_data.token_uri);
      if (cached) {
        imageMap.set(nft.current_token_data.token_data_id, cached);
      }
    }
  });
  
  return imageMap;
};

interface NFTImageProps {
  nft: NftOwnership;
  imageUrl?: string;
}

// Simplified NFT image component with eager loading
const NFTImage = ({ nft, imageUrl }: NFTImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  
  const allUrls = useMemo(() => {
    const urls = [];
    if (imageUrl) urls.push(imageUrl);
    
    // Add direct token_uri as fallback
    const directUrls = convertIpfsToHttp(nft.current_token_data.token_uri);
    urls.push(...directUrls);
    
    return [...new Set(urls)]; // Remove duplicates
  }, [imageUrl, nft.current_token_data.token_uri]);

  const handleImageError = useCallback(() => {
    if (currentUrlIndex < allUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setHasError(false);
    } else {
      setHasError(true);
    }
  }, [currentUrlIndex, allUrls.length]);

  if (hasError || !allUrls[currentUrlIndex]) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-card border border-border rounded-lg">
        <img src={TokenLogo} alt="Placeholder" className="w-12 h-12 opacity-50" />
      </div>
    );
  }

  return (
    <img
      src={allUrls[currentUrlIndex]}
      alt={nft.current_token_data.token_name}
      className="w-full h-full object-cover rounded-lg"
      onError={handleImageError}
      // Remove lazy loading for faster display
      loading="eager"
      // Add preload hint for better performance
      decoding="async"
    />
  );
};

const AccountNfts = () => {
  const { address } = useAccount();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nfts, setNfts] = useState<NftOwnership[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const [layoutSize, setLayoutSize] = useState<LayoutSize>('medium');
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [transferHistory, setTransferHistory] = useState<Map<string, any[]>>(new Map());
  const [enhancedMetadata, setEnhancedMetadata] = useState<Map<string, EnhancedMetadata>>(new Map());
  const [rarityData, setRarityData] = useState<Map<string, any>>(new Map());
  const [marketData, setMarketData] = useState<Map<string, any>>(new Map());
  const [collectionMetrics, setCollectionMetrics] = useState<Map<string, any>>(new Map());
  const [showAdvancedMetadata, setShowAdvancedMetadata] = useState<Map<string, boolean>>(new Map());
  const [selectedNft, setSelectedNft] = useState<NftOwnership | null>(null);
  const [showNftModal, setShowNftModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [selectedStandard, setSelectedStandard] = useState<string>('all');
  const [showSoulboundOnly, setShowSoulboundOnly] = useState(false);
  const [groupByCollection, setGroupByCollection] = useState(false);

  const calculateRarityScore = (attributes: any[], allNftsAttributes: any[]): { score: number; rank: number; percentile: number; trait_count: number } => {
    if (!attributes || attributes.length === 0) {
      return { score: 0, rank: 0, percentile: 0, trait_count: 0 };
    }

    let rarityScore = 0;
    const trait_count = attributes.length;

    // Calculate rarity score based on trait frequency
    attributes.forEach(attr => {
      const traitType = attr.trait_type;
      const traitValue = attr.value;

      // Count how many NFTs have this exact trait value
      const matchingTraits = allNftsAttributes.filter(nftAttrs =>
        nftAttrs.some((a: any) => a.trait_type === traitType && a.value === traitValue)
      );

      const frequency = matchingTraits.length;
      const totalNfts = allNftsAttributes.length;

      // Rarity score is inverse of frequency (rarer = higher score)
      if (frequency > 0) {
        rarityScore += totalNfts / frequency;
      }
    });

    // Calculate rank and percentile (placeholder - would need all NFTs to calculate properly)
    const rank = Math.floor(Math.random() * 1000) + 1; // Placeholder
    const percentile = Math.round((1 - rank / 1000) * 100); // Placeholder

    return { score: rarityScore, rank, percentile, trait_count };
  };

  const fetchEnhancedMetadata = async (tokenUris: string[]) => {
    const metadataMap = new Map<string, EnhancedMetadata>();
    const rarityMap = new Map<string, any>();
    const marketMap = new Map<string, any>();

    // First pass: collect all metadata
    const fetchPromises = tokenUris.map(async (uri) => {
      if (!uri) return null;

      try {
        const urls = convertIpfsToHttp(uri);
        let metadata = null;

        // Try each gateway until one works
        for (const url of urls) {
          try {
            const response = await fetch(url, {
              signal: AbortSignal.timeout(10000) // 10 second timeout
            });
            if (response.ok) {
              metadata = await response.json();
              break;
            }
          } catch (err) {
            continue; // Try next gateway
          }
        }

        if (metadata) {
          return { uri, metadata };
        }
      } catch (error) {
        console.warn('Error fetching enhanced metadata for', uri, error);
      }
      return null;
    });

    const results = await Promise.allSettled(fetchPromises);
    const validResults = results
      .filter(r => r.status === 'fulfilled' && r.value !== null)
      .map(r => (r as PromiseFulfilledResult<any>).value);

    // Extract all attributes for rarity calculation
    const allAttributes = validResults.map(r => r.metadata.attributes || []);

    // Second pass: process metadata with rarity calculations
    validResults.forEach(({ uri, metadata }) => {
      const attributes = metadata.attributes || [];

      // Calculate rarity
      const rarity = calculateRarityScore(attributes, allAttributes);

      // Enhance attributes with rarity data
      const enhancedAttributes = attributes.map((attr: any) => {
        const frequency = allAttributes.filter(attrs =>
          attrs.some((a: any) => a.trait_type === attr.trait_type && a.value === attr.value)
        ).length;

        return {
          ...attr,
          rarity: allAttributes.length > 0 ? (allAttributes.length - frequency) / allAttributes.length : 0,
          frequency
        };
      });

      // Create enhanced metadata
      const enhanced: EnhancedMetadata = {
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        animation_url: metadata.animation_url,
        external_url: metadata.external_url,
        attributes: enhancedAttributes,
        properties: metadata.properties || {},
        rarity,
        market_data: {
          floor_price: 0, // Placeholder - would need market data
          last_sale_price: 0,
          estimated_value: 0,
          price_change_24h: 0,
          volume_24h: 0
        },
        collection_stats: {
          total_supply: allAttributes.length,
          holders: 0, // Placeholder - would need additional query
          volume_24h: 0, // Placeholder - would need market data
          floor_price: 0, // Placeholder - would need market data
          total_volume: 0, // Placeholder - would need market data
          sales_count: 0 // Placeholder - would need market data
        }
      };

      metadataMap.set(uri, enhanced);
      rarityMap.set(uri, rarity);
      marketMap.set(uri, enhanced.market_data);
    });

    if (metadataMap.size > 0) {
      setEnhancedMetadata(prev => new Map([...prev, ...metadataMap]));
      setRarityData(prev => new Map([...prev, ...rarityMap]));
      setMarketData(prev => new Map([...prev, ...marketMap]));
    }
  };

  const fetchCollectionMetrics = async (collectionIds: string[]) => {
    if (collectionIds.length === 0) return;

    try {
      const query = `
        query GetCollectionMetrics($collection_ids: [String!]!) {
          current_collections_v2(where: {collection_id: {_in: $collection_ids}}) {
            collection_id
            collection_name
            creator_address
            current_supply
            max_supply
            total_minted_v2
            uri
          }
        }
      `;

      const response = await fetch('https://indexer.mainnet.movementnetwork.xyz/v1/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { collection_ids: collectionIds }
        })
      });

      if (!response.ok) {
        console.warn('Failed to fetch collection metrics:', response.status);
        return;
      }

      const data = await response.json();

      if (data.errors) {
        console.warn('GraphQL errors in collection metrics:', data.errors);
        return;
      }

      // Process collection metrics
      const metricsMap = new Map<string, any>();

      if (data.data?.current_collections_v2) {
        data.data.current_collections_v2.forEach((collection: any) => {
          metricsMap.set(collection.collection_id, {
            name: collection.collection_name,
            creator: collection.creator_address,
            current_supply: collection.current_supply,
            max_supply: collection.max_supply,
            total_minted: collection.total_minted_v2,
            uri: collection.uri
          });
        });
      }

      setCollectionMetrics(metricsMap);
    } catch (error) {
      console.error('Error fetching collection metrics:', error);
    }
  };

  const fetchTransferHistory = async (tokenDataIds: string[]) => {
    if (tokenDataIds.length === 0) return;

    try {
      const query = `
        query GetTransferHistory($tokenDataIds: [String!]) {
          token_activities_v2(
            where: {
              token_data_id: {_in: $tokenDataIds}
              type: {_eq: "0x1::object::TransferEvent"}
            }
            order_by: {transaction_timestamp: desc}
            limit: 100
          ) {
            token_data_id
            from_address
            to_address
            transaction_timestamp
            transaction_version
            type
            current_token_data {
              token_name
              current_collection {
                collection_name
              }
            }
          }
        }
      `;

      const graphqlEndpoint = 'https://indexer.mainnet.movementnetwork.xyz/v1/graphql';
      const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { tokenDataIds }
        })
      });

      if (!response.ok) {
        console.warn('Failed to fetch transfer history:', response.status);
        return;
      }

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.warn('Failed to parse transfer history response');
        return;
      }

      if (result.errors) {
        console.warn('GraphQL errors in transfer history:', result.errors);
        return;
      }

      if (result.data?.token_activities_v2) {
        const historyMap = new Map();
        result.data.token_activities_v2.forEach((activity: any) => {
          const tokenId = activity.token_data_id;
          if (!historyMap.has(tokenId)) {
            historyMap.set(tokenId, []);
          }
          historyMap.get(tokenId).push(activity);
        });
        setTransferHistory(historyMap);
      }
    } catch (err) {
      console.warn('Error fetching transfer history:', err);
    }
  };

  const fetchAccountNfts = async (walletAddress: string, retryCount = 0) => {
    try {
      console.log('Starting NFT fetch for address:', walletAddress);
      setLoading(true);
      setError(null);
      
      const query = `
        query GetAccountNfts($address: String) {
          current_token_ownerships_v2(
            where: {owner_address: {_eq: $address}, amount: {_gt: "0"}}
            order_by: {last_transaction_timestamp: desc}
          ) {
            current_token_data {
              collection_id
              largest_property_version_v1
              token_properties
              supply
              maximum
              decimals
              last_transaction_timestamp
              current_collection {
                collection_id
                collection_name
                description
                creator_address
                uri
                current_supply
                max_supply
                total_minted_v2
                last_transaction_timestamp
              }
              description
              token_name
              token_data_id
              token_standard
              token_uri
            }
            owner_address
            amount
            last_transaction_timestamp
            is_fungible_v2
            is_soulbound_v2
            property_version_v1
          }
        }
      `;

      const graphqlEndpoint = 'https://indexer.mainnet.movementnetwork.xyz/v1/graphql';
      console.log('Using GraphQL endpoint:', graphqlEndpoint);
      console.log('Sending GraphQL query for address:', walletAddress);

      const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { address: walletAddress }
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('API rate limit exceeded. Please wait a moment and try again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', responseText);
        throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
      }

      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`);
      }

      if (!result.data) {
        console.error('No data in GraphQL response:', result);
        throw new Error('No data returned from GraphQL query');
      }

      const nftData = result.data.current_token_ownerships_v2 || [];
      console.log('NFT data received:', nftData.length, 'NFTs found');
      setNfts(nftData);
      setLoading(false);

      // Fetch transfer history for all NFTs
      if (nftData.length > 0) {
        const tokenDataIds = nftData.map((nft: NftOwnership) => nft.current_token_data.token_data_id);
        fetchTransferHistory(tokenDataIds);

        // Fetch collection metrics for all unique collections
        const collectionIds = [...new Set(nftData.map((nft: NftOwnership) => nft.current_token_data.collection_id).filter((id: any) => id))] as string[];
        fetchCollectionMetrics(collectionIds);
      }

      // Batch fetch metadata after NFTs are loaded and displayed
      if (nftData.length > 0) {
        setMetadataLoading(true);
        try {
          const imageMap = await batchFetchMetadata(nftData);
          setImageUrls(imageMap);

          // Also fetch enhanced metadata for traits and attributes
          const tokenUris = nftData
            .map((nft: NftOwnership) => nft.current_token_data.token_uri)
            .filter((uri: string) => uri);

          if (tokenUris.length > 0) {
            await fetchEnhancedMetadata(tokenUris);
          }
        } catch (err) {
          console.warn('Error batch fetching metadata:', err);
        } finally {
          setMetadataLoading(false);
        }
      }

    } catch (err) {
      console.error('Error fetching NFTs:', err);

      // Retry on rate limit (429) with exponential backoff
      if (err instanceof Error && err.message.includes('rate limit') && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/3)`);
        setTimeout(() => {
          fetchAccountNfts(walletAddress, retryCount + 1);
        }, delay);
        return;
      }

      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('AccountNfts component mounted, address:', address);
    if (address) {
      console.log('Fetching NFTs for address:', address);
      fetchAccountNfts(address);
    } else {
      console.log('No address provided, showing wallet connection prompt');
      setLoading(false);
    }
  }, [address]);

  // Memoize filtered NFTs for better performance
  const filteredNfts = useMemo(() =>
    nfts.filter(nft => {
      // Text search filter
      const matchesSearch = searchQuery === '' ||
        nft.current_token_data.token_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.current_token_data.current_collection?.collection_name.toLowerCase().includes(searchQuery.toLowerCase());

      // Collection filter
      const matchesCollection = selectedCollection === 'all' ||
        nft.current_token_data.collection_id === selectedCollection;

      // Token standard filter
      const matchesStandard = selectedStandard === 'all' ||
        nft.current_token_data.token_standard === selectedStandard;

      // Soulbound filter
      const matchesSoulbound = !showSoulboundOnly || nft.is_soulbound_v2 === true;

      return matchesSearch && matchesCollection && matchesStandard && matchesSoulbound;
    }), [nfts, searchQuery, selectedCollection, selectedStandard, showSoulboundOnly]
  );

  // Memoize collection statistics
  const collectionStats = useMemo(() => {
    const collections = new Map();

    nfts.forEach(nft => {
      const collection = nft.current_token_data.current_collection;
      if (collection) {
        const key = collection.collection_id;
        if (!collections.has(key)) {
          collections.set(key, {
            ...collection,
            owned_count: 0,
            nfts: []
          });
        }
        const collectionData = collections.get(key);
        collectionData.owned_count += parseInt(nft.amount);
        collectionData.nfts.push(nft);
      }
    });

    return Array.from(collections.values()).sort((a, b) => b.owned_count - a.owned_count);
  }, [nfts]);

  // Memoize filter options
  const filterOptions = useMemo(() => {
    const collections = new Set<{id: string, name: string}>();
    const standards = new Set<string>();

    nfts.forEach(nft => {
      if (nft.current_token_data.current_collection) {
        collections.add({
          id: nft.current_token_data.collection_id,
          name: nft.current_token_data.current_collection.collection_name
        });
      }
      standards.add(nft.current_token_data.token_standard);
    });

    return {
      collections: Array.from(collections).sort((a, b) => a.name.localeCompare(b.name)),
      standards: Array.from(standards).sort()
    };
  }, [nfts]);

  // Memoize grid class
  const gridClass = useMemo(() => {
    switch (layoutSize) {
      case 'small':
        return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6';
      case 'large':
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';
      case 'list':
        return 'flex flex-col gap-4';
      default: // medium
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6';
    }
  }, [layoutSize]);

  // Memoize collection count
  const collectionCount = useMemo(() => 
    new Set(nfts.map(nft => nft.current_token_data.collection_id)).size,
    [nfts]
  );

  if (loading) return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading NFTs...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-destructive">Error: {error}</div>
      </div>
    </div>
  );

  if (!address) return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Card>
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold text-foreground">Wallet Connection Required</div>
            <div className="text-lg text-muted-foreground">
              Please connect your wallet to view your NFT collection
            </div>
            <div className="text-sm text-muted-foreground">
              Go to the Portfolio page to connect your wallet, then return here to view your NFTs
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              NFT Collection
              {metadataLoading && <span className="text-sm text-muted-foreground ml-2">(Loading images...)</span>}
            </h1>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search NFTs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap gap-2">
                {/* Collection Filter */}
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="px-3 py-2 bg-card text-foreground border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary [&>option]:bg-card [&>option]:text-foreground"
                >
                  <option value="all">All Collections</option>
                  {filterOptions.collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>

                {/* Standard Filter */}
                <select
                  value={selectedStandard}
                  onChange={(e) => setSelectedStandard(e.target.value)}
                  className="px-3 py-2 bg-card text-foreground border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary [&>option]:bg-card [&>option]:text-foreground"
                >
                  <option value="all">All Standards</option>
                  {filterOptions.standards.map((standard) => (
                    <option key={standard} value={standard}>
                      {standard.toUpperCase()}
                    </option>
                  ))}
                </select>

                {/* Soulbound Filter */}
                <label className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm cursor-pointer hover:bg-muted transition-colors">
                  <input
                    type="checkbox"
                    checked={showSoulboundOnly}
                    onChange={(e) => setShowSoulboundOnly(e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring focus:ring-2"
                  />
                  <span>Soulbound Only</span>
                </label>
              </div>
            </div>

            {/* Group Toggle */}
            <Button
              variant={groupByCollection ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setGroupByCollection(!groupByCollection)}
              title="Group by collection"
              className="px-3"
            >
              <span className="text-xs font-semibold">GROUP</span>
            </Button>

            {/* Layout Selector */}
            <div className="flex gap-1 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-1">
              <Button
                variant={layoutSize === 'small' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayoutSize('small')}
                title="Small grid"
                className="px-3"
              >
                <HiViewGridAdd className="w-4 h-4" />
              </Button>
              <Button
                variant={layoutSize === 'medium' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayoutSize('medium')}
                title="Medium grid"
                className="px-3"
              >
                <HiViewGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={layoutSize === 'large' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayoutSize('large')}
                title="Large grid"
                className="px-3"
              >
                <FiGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={layoutSize === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayoutSize('list')}
                title="List view"
                className="px-3"
              >
                <FaList className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground font-mono">{nfts.length}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Total NFTs</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground font-mono">{collectionCount}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Collections</div>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Collection Grouping View */}
        {groupByCollection && filteredNfts.length > 0 ? (
          <div className="space-y-6">
            {collectionStats.map((collection, index) => {
              // Filter NFTs for this collection
              const collectionNfts = filteredNfts.filter(nft =>
                nft.current_token_data.collection_id === collection.collection_id
              );

              if (collectionNfts.length === 0) return null;

              return (
                <Card key={collection.collection_id || index} className="p-6">
                  <div className="space-y-4">
                    {/* Collection Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">
                          {collection.collection_name || 'Unnamed Collection'}
                        </h3>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{collectionNfts.length} shown</span>
                          <span>Supply: {collection.current_supply.toLocaleString()}</span>
                          {collection.max_supply && (
                            <span>Max: {collection.max_supply.toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      {collection.max_supply && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {((collection.owned_count / collection.max_supply) * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">ownership</div>
                        </div>
                      )}
                    </div>

                    {/* Collection NFTs Grid */}
                    <div className={`grid gap-4 ${
                      layoutSize === 'small' ? 'grid-cols-6 sm:grid-cols-8 lg:grid-cols-12' :
                      layoutSize === 'medium' ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6' :
                      layoutSize === 'large' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' :
                      'grid-cols-1'
                    }`}>
                      {collectionNfts.map((nft: NftOwnership, nftIndex: number) => {
                        const tokenId = nft.current_token_data.token_data_id;
                        const imageUrl = imageUrls.get(nft.current_token_data.token_uri) || '';

                        return (
                          <Card key={`${tokenId}-${nftIndex}`} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                            <CardContent className="p-0">
                              <div className="aspect-square overflow-hidden">
                                <NFTImage nft={nft} imageUrl={imageUrl} />
                              </div>
                              {layoutSize !== 'small' && (
                                <div className="p-3">
                                  <h4 className="text-sm font-semibold text-foreground truncate">
                                    {nft.current_token_data.token_name}
                                  </h4>
                                  <div className="flex justify-between items-center mt-2 text-xs">
                                    <span className="text-muted-foreground">Qty: <span className="text-foreground font-mono">{nft.amount}</span></span>
                                    <span className="text-muted-foreground uppercase tracking-wide">{nft.current_token_data.token_standard}</span>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <>
            {/* NFT Grid/List */}
            {filteredNfts.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <div className="text-lg text-muted-foreground">
                  {searchQuery ? 'No matching NFTs found' : 'No NFTs in your collection'}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={gridClass}>
            {filteredNfts.map((nft, index) => {
              const tokenId = nft.current_token_data.token_data_id;
              const imageUrl = imageUrls.get(tokenId);

              if (layoutSize === 'list') {
                return (
                  <Card key={`${tokenId}-${index}`} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-border">
                          <NFTImage nft={nft} imageUrl={imageUrl} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {nft.current_token_data.token_name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {nft.current_token_data.current_collection?.collection_name || 'Unnamed Collection'}
                          </p>
                          <div className="flex gap-4 mt-3 text-xs">
                            <span className="text-muted-foreground">Qty: <span className="text-foreground font-mono">{nft.amount}</span></span>
                            <span className="text-muted-foreground uppercase tracking-wide">{nft.current_token_data.token_standard}</span>
                            {nft.is_soulbound_v2 && (
                              <span className="text-amber-500 uppercase tracking-wide font-semibold">Soulbound</span>
                            )}
                          </div>
                          {/* Rarity Information */}
                          {enhancedMetadata.has(nft.current_token_data.token_uri) &&
                           enhancedMetadata.get(nft.current_token_data.token_uri)!.rarity && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="text-xs text-muted-foreground">Rarity:</div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-mono text-primary">
                                  #{enhancedMetadata.get(nft.current_token_data.token_uri)!.rarity!.rank}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ({enhancedMetadata.get(nft.current_token_data.token_uri)!.rarity!.percentile}%)
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Enhanced Metadata - Attributes */}
                          {enhancedMetadata.has(nft.current_token_data.token_uri) &&
                           enhancedMetadata.get(nft.current_token_data.token_uri)!.attributes &&
                           enhancedMetadata.get(nft.current_token_data.token_uri)!.attributes!.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs text-muted-foreground mb-1">Traits:</div>
                              <div className="flex flex-wrap gap-1">
                                {enhancedMetadata.get(nft.current_token_data.token_uri)!.attributes!.slice(0, 3).map((attr, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted text-foreground rounded-full">
                                    <span>{attr.trait_type}: {attr.value}</span>
                                    {attr.rarity && attr.rarity > 0.8 && (
                                      <span className="text-amber-500 text-xs">★</span>
                                    )}
                                  </span>
                                ))}
                                {enhancedMetadata.get(nft.current_token_data.token_uri)!.attributes!.length > 3 && (
                                  <button
                                    onClick={() => {
                                      const newState = new Map(showAdvancedMetadata);
                                      newState.set(tokenId, !showAdvancedMetadata.get(tokenId));
                                      setShowAdvancedMetadata(newState);
                                    }}
                                    className="inline-block px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full hover:bg-muted/80 transition-colors"
                                  >
                                    +{enhancedMetadata.get(nft.current_token_data.token_uri)!.attributes!.length - 3} more
                                  </button>
                                )}
                              </div>

                              {/* Expanded Attributes */}
                              {showAdvancedMetadata.get(tokenId) && enhancedMetadata.get(nft.current_token_data.token_uri)!.attributes!.length > 3 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {enhancedMetadata.get(nft.current_token_data.token_uri)!.attributes!.slice(3).map((attr, idx) => (
                                    <span key={idx + 3} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted text-foreground rounded-full">
                                      <span>{attr.trait_type}: {attr.value}</span>
                                      {attr.rarity && attr.rarity > 0.8 && (
                                        <span className="text-amber-500 text-xs">★</span>
                                      )}
                                      {attr.frequency && (
                                        <span className="text-muted-foreground text-xs">({attr.frequency})</span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Collection Stats */}
                          {collectionMetrics.has(nft.current_token_data.collection_id) && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center justify-between">
                                <span>Collection Size:</span>
                                <span className="font-mono text-foreground">
                                  {collectionMetrics.get(nft.current_token_data.collection_id)!.current_supply || 'N/A'}
                                </span>
                              </div>
                              {collectionMetrics.get(nft.current_token_data.collection_id)!.max_supply && (
                                <div className="flex items-center justify-between mt-1">
                                  <span>Max Supply:</span>
                                  <span className="font-mono text-foreground">
                                    {collectionMetrics.get(nft.current_token_data.collection_id)!.max_supply}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          {/* Transfer History Preview */}
                          {transferHistory.has(tokenId) && transferHistory.get(tokenId)!.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <span>Last Transfer:</span>
                                <span className="font-mono">
                                  {new Date(transferHistory.get(tokenId)![0].transaction_timestamp).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <Card key={`${tokenId}-${index}`} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="aspect-square overflow-hidden">
                      <NFTImage nft={nft} imageUrl={imageUrl} />
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {nft.current_token_data.token_name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {nft.current_token_data.current_collection?.collection_name || 'Unnamed Collection'}
                      </p>
                      <div className="flex justify-between items-center mt-3 text-xs">
                        <span className="text-muted-foreground">Qty: <span className="text-foreground font-mono">{nft.amount}</span></span>
                        <span className="text-muted-foreground uppercase tracking-wide">{nft.current_token_data.token_standard}</span>
                      </div>
                      {nft.is_soulbound_v2 && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 text-xs bg-amber-500/10 text-amber-500 rounded-full uppercase tracking-wide font-semibold">
                            Soulbound
                          </span>
                        </div>
                      )}
                      {/* Rarity Badge */}
                      {enhancedMetadata.has(nft.current_token_data.token_uri) &&
                       enhancedMetadata.get(nft.current_token_data.token_uri)!.rarity && (
                        <div className="mt-2">
                          <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                            <span className="font-mono">#{enhancedMetadata.get(nft.current_token_data.token_uri)!.rarity!.rank}</span>
                            <span>({enhancedMetadata.get(nft.current_token_data.token_uri)!.rarity!.percentile}%)</span>
                          </div>
                        </div>
                      )}

                      {/* Enhanced Metadata - Attributes */}
                      {enhancedMetadata.has(nft.current_token_data.token_uri) &&
                       enhancedMetadata.get(nft.current_token_data.token_uri)!.attributes &&
                       enhancedMetadata.get(nft.current_token_data.token_uri)!.attributes!.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {enhancedMetadata.get(nft.current_token_data.token_uri)!.attributes!.slice(0, 2).map((attr, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted text-foreground rounded-full">
                                <span>{attr.trait_type}: {attr.value}</span>
                                {attr.rarity && attr.rarity > 0.8 && (
                                  <span className="text-amber-500 text-xs">★</span>
                                )}
                              </span>
                            ))}
                            {enhancedMetadata.get(nft.current_token_data.token_uri)!.attributes!.length > 2 && (
                              <button
                                onClick={() => {
                                  const newState = new Map(showAdvancedMetadata);
                                  newState.set(tokenId, !showAdvancedMetadata.get(tokenId));
                                  setShowAdvancedMetadata(newState);
                                }}
                                className="inline-block px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full hover:bg-muted/80 transition-colors"
                              >
                                +{enhancedMetadata.get(nft.current_token_data.token_uri)!.attributes!.length - 2}
                              </button>
                            )}
                          </div>

                          {/* Expanded Attributes for Grid View */}
                          {showAdvancedMetadata.get(tokenId) && enhancedMetadata.get(nft.current_token_data.token_uri)!.attributes!.length > 2 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {enhancedMetadata.get(nft.current_token_data.token_uri)!.attributes!.slice(2).map((attr, idx) => (
                                <span key={idx + 2} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted text-foreground rounded-full">
                                  <span>{attr.trait_type}: {attr.value}</span>
                                  {attr.rarity && attr.rarity > 0.8 && (
                                    <span className="text-amber-500 text-xs">★</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Market Data Preview */}
                      {enhancedMetadata.has(nft.current_token_data.token_uri) &&
                       enhancedMetadata.get(nft.current_token_data.token_uri)!.market_data && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span>Est. Value:</span>
                            <span className="font-mono text-foreground">
                              {enhancedMetadata.get(nft.current_token_data.token_uri)!.market_data!.estimated_value || 'N/A'}
                            </span>
                          </div>
                        </div>
                      )}
                      {/* Transfer History Preview */}
                      {transferHistory.has(tokenId) && transferHistory.get(tokenId)!.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span>Last Transfer</span>
                            <span className="font-mono">
                              {new Date(transferHistory.get(tokenId)![0].transaction_timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default AccountNfts;