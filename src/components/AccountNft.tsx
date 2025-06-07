import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAccount } from "@razorlabs/razorkit";
import { FiSearch, FiGrid } from 'react-icons/fi';
import { HiViewGrid, HiViewGridAdd } from 'react-icons/hi';
import TokenLogo from '../assets/TokenLogo.png';

interface NftData {
  collection_id: string;
  largest_property_version_v1: string;
  current_collection: {
    collection_id: string;
    collection_name: string;
    description: string;
    creator_address: string;
    uri: string;
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
}

type LayoutSize = 'small' | 'medium' | 'large';

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
      <div className="nft-image-placeholder">
        <img src={TokenLogo} alt="Placeholder" width={48} height={48} />
      </div>
    );
  }

  return (
    <img
      src={allUrls[currentUrlIndex]}
      alt={nft.current_token_data.token_name}
      className="nft-image"
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

  const fetchAccountNfts = async (walletAddress: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const query = `
        query GetAccountNfts($address: String) {
          current_token_ownerships_v2(
            where: {owner_address: {_eq: $address}, amount: {_gt: "0"}}
          ) {
            current_token_data {
              collection_id
              largest_property_version_v1
              current_collection {
                collection_id
                collection_name
                description
                creator_address
                uri
              }
              description
              token_name
              token_data_id
              token_standard
              token_uri
            }
            owner_address
            amount
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
          variables: { address: walletAddress }
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const nftData = result.data.current_token_ownerships_v2 || [];
      setNfts(nftData);
      setLoading(false);

      // Batch fetch metadata after NFTs are loaded and displayed
      if (nftData.length > 0) {
        setMetadataLoading(true);
        try {
          const imageMap = await batchFetchMetadata(nftData);
          setImageUrls(imageMap);
        } catch (err) {
          console.warn('Error batch fetching metadata:', err);
        } finally {
          setMetadataLoading(false);
        }
      }

    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchAccountNfts(address);
    } else {
      setLoading(false);
    }
  }, [address]);

  // Memoize filtered NFTs for better performance
  const filteredNfts = useMemo(() => 
    nfts.filter(nft => 
      nft.current_token_data.token_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.current_token_data.current_collection?.collection_name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [nfts, searchQuery]
  );

  // Memoize grid class
  const gridClass = useMemo(() => {
    switch (layoutSize) {
      case 'small':
        return 'nft-grid nft-grid-small';
      case 'large':
        return 'nft-grid nft-grid-large';
      default:
        return 'nft-grid nft-grid-medium';
    }
  }, [layoutSize]);

  // Memoize collection count
  const collectionCount = useMemo(() => 
    new Set(nfts.map(nft => nft.current_token_data.collection_id)).size,
    [nfts]
  );

  if (loading) return <div className="nft-container">Loading NFTs...</div>;
  if (error) return <div className="nft-container">Error: {error}</div>;
  if (!address) return <div className="nft-container">Please connect your wallet</div>;

  return (
    <div className="nft-container">
      <div className="nft-header">
        <h1 className="nft-title">
          NFT Collection
          {metadataLoading && <span className="metadata-loading"> (Loading images...)</span>}
        </h1>
        <div className="nft-header-controls">
          <div className="nft-search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search NFTs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="layout-selector">
            <button
              className={`layout-btn ${layoutSize === 'small' ? 'active' : ''}`}
              onClick={() => setLayoutSize('small')}
              title="Small grid"
            >
              <HiViewGridAdd className="layout-icon" />
            </button>
            <button
              className={`layout-btn ${layoutSize === 'medium' ? 'active' : ''}`}
              onClick={() => setLayoutSize('medium')}
              title="Medium grid"
            >
              <HiViewGrid className="layout-icon" />
            </button>
            <button
              className={`layout-btn ${layoutSize === 'large' ? 'active' : ''}`}
              onClick={() => setLayoutSize('large')}
              title="Large grid"
            >
              <FiGrid className="layout-icon" />
            </button>
          </div>
        </div>
      </div>

      <div className="nft-stats">
        <div className="nft-stat">
          <span className="stat-value">{nfts.length}</span>
          <span className="stat-label">Total NFTs</span>
        </div>
        <div className="nft-stat">
          <span className="stat-value">{collectionCount}</span>
          <span className="stat-label">Collections</span>
        </div>
      </div>

      {filteredNfts.length === 0 ? (
        <div className="nft-empty">
          {searchQuery ? 'No matching NFTs found' : 'No NFTs in your collection'}
        </div>
      ) : (
        <div className={gridClass}>
          {filteredNfts.map((nft, index) => {
            const tokenId = nft.current_token_data.token_data_id;
            const imageUrl = imageUrls.get(tokenId);
            
            return (
              <div key={`${tokenId}-${index}`} className="nft-card">
                <div className="nft-image-container">
                  <NFTImage
                    nft={nft}
                    imageUrl={imageUrl}
                  />
                </div>
                <div className="nft-info">
                  <h3 className="nft-name">{nft.current_token_data.token_name}</h3>
                  <p className="nft-collection">
                    {nft.current_token_data.current_collection?.collection_name || 'Unnamed Collection'}
                  </p>
                  <div className="nft-meta">
                    <span className="nft-amount">Qty: {nft.amount}</span>
                    <span className="nft-standard">{nft.current_token_data.token_standard}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AccountNfts;