import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaCheck, FaCircle, FaPlus, FaTimes, FaGlobe, FaFlask } from 'react-icons/fa';
import { cn } from '../lib/utils';

export interface Network {
  id: string;
  name: string;
  displayName: string;
  rpcUrl: string;
  explorerUrl: string;
  chainId: number;
  isTestnet?: boolean;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface NetworkSelectorProps {
  currentNetwork: Network;
  networks: Network[];
  onNetworkChange: (network: Network) => void;
  className?: string;
  disabled?: boolean;
  showStatus?: boolean;
  allowCustomRpc?: boolean;
  onCustomRpcAdd?: (network: Network) => void;
}

const DEFAULT_NETWORKS: Network[] = [
  {
    id: 'mainnet',
    name: 'mainnet',
    displayName: 'Movement Mainnet',
    rpcUrl: 'https://mainnet.movementnetwork.xyz/v1',
    explorerUrl: 'https://explorer.movementlabs.xyz',
    chainId: 1,
    status: 'active'
  },
  {
    id: 'testnet',
    name: 'testnet',
    displayName: 'Movement Testnet',
    rpcUrl: 'https://testnet.movementnetwork.xyz/v1',
    explorerUrl: 'https://explorer.testnet.movementlabs.xyz',
    chainId: 2,
    isTestnet: true,
    status: 'active'
  },
  {
    id: 'devnet',
    name: 'devnet',
    displayName: 'Movement Devnet',
    rpcUrl: 'https://devnet.movementnetwork.xyz/v1',
    explorerUrl: 'https://explorer.devnet.movementlabs.xyz',
    chainId: 3,
    isTestnet: true,
    status: 'active'
  }
];

/**
 * NetworkSelector Component
 * Dropdown for selecting blockchain network (Mainnet, Testnet, Devnet)
 * Essential component for any blockchain explorer
 */
const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  currentNetwork,
  networks = DEFAULT_NETWORKS,
  onNetworkChange,
  className,
  disabled = false,
  showStatus = true,
  allowCustomRpc = true,
  onCustomRpcAdd
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomRpc, setShowCustomRpc] = useState(false);
  const [customRpcForm, setCustomRpcForm] = useState({
    name: '',
    rpcUrl: '',
    chainId: '',
    explorerUrl: ''
  });
  const [customRpcError, setCustomRpcError] = useState<string | null>(null);
  const [networkStatuses, setNetworkStatuses] = useState<{ [key: string]: Network['status'] }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Monitor network status in real-time
  useEffect(() => {
    const checkNetworkStatus = async (network: Network): Promise<Network['status']> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(network.rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return 'active';
        } else {
          return 'maintenance';
        }
      } catch (error) {
        return 'inactive';
      }
    };

    const updateNetworkStatuses = async () => {
      const statusPromises = networks.map(async (network) => {
        const status = await checkNetworkStatus(network);
        return { id: network.id, status };
      });

      const results = await Promise.all(statusPromises);
      const statusMap = results.reduce((acc, { id, status }) => {
        acc[id] = status;
        return acc;
      }, {} as { [key: string]: Network['status'] });

      setNetworkStatuses(statusMap);
    };

    // Initial check
    updateNetworkStatuses();

    // Check every 2 minutes
    const interval = setInterval(updateNetworkStatuses, 120000);

    return () => clearInterval(interval);
  }, [networks]);

  const handleNetworkSelect = (network: Network) => {
    if (network.id !== currentNetwork.id && !disabled) {
      onNetworkChange(network);
    }
    setIsOpen(false);
    setShowCustomRpc(false);
  };

  const handleCustomRpcSubmit = () => {
    setCustomRpcError(null);

    // Validate form
    if (!customRpcForm.name.trim()) {
      setCustomRpcError('Network name is required');
      return;
    }

    if (!customRpcForm.rpcUrl.trim()) {
      setCustomRpcError('RPC URL is required');
      return;
    }

    if (!customRpcForm.chainId.trim() || isNaN(Number(customRpcForm.chainId))) {
      setCustomRpcError('Valid Chain ID is required');
      return;
    }

    // Create custom network
    const customNetwork: Network = {
      id: `custom-${Date.now()}`,
      name: customRpcForm.name.toLowerCase().replace(/\s+/g, '-'),
      displayName: customRpcForm.name,
      rpcUrl: customRpcForm.rpcUrl,
      explorerUrl: customRpcForm.explorerUrl || '',
      chainId: Number(customRpcForm.chainId),
      status: 'active',
      isTestnet: customRpcForm.name.toLowerCase().includes('test')
    };

    // Add to networks and select
    if (onCustomRpcAdd) {
      onCustomRpcAdd(customNetwork);
    }
    onNetworkChange(customNetwork);

    // Reset form and close
    setCustomRpcForm({ name: '', rpcUrl: '', chainId: '', explorerUrl: '' });
    setShowCustomRpc(false);
    setIsOpen(false);
  };

  const handleCustomRpcCancel = () => {
    setCustomRpcForm({ name: '', rpcUrl: '', chainId: '', explorerUrl: '' });
    setCustomRpcError(null);
    setShowCustomRpc(false);
  };

  const getNetworkStatus = (network: Network): Network['status'] => {
    return networkStatuses[network.id] || network.status;
  };

  const getStatusColor = (status: Network['status']) => {
    switch (status) {
      case 'active':
        return 'var(--success-color)';
      case 'maintenance':
        return 'var(--warning-color)';
      case 'inactive':
        return 'var(--error-color)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getStatusText = (status: Network['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'maintenance':
        return 'Maintenance';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Unknown';
    }
  };

  return (
    <div
      className={cn('relative', className)}
      ref={dropdownRef}
    >
      {/* Trigger Button */}
      <button
        className={cn(
          'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none',
          {
            'bg-accent text-accent-foreground': isOpen,
            'opacity-50 cursor-not-allowed': disabled
          }
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current network: ${currentNetwork.displayName}`}
      >
        <div className="flex items-center gap-2">
          <FaCircle
            className="h-2 w-2"
            style={{ color: getStatusColor(getNetworkStatus(currentNetwork)) }}
          />
        </div>
        <FaChevronDown
          className={cn('h-3 w-3 transition-transform duration-200', {
            'rotate-180': isOpen
          })}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="network-selector__dropdown">
          {!showCustomRpc ? (
            <div className="network-selector__list" role="listbox">
              {/* Mainnet Section */}
              <div className="network-selector__section">
                <div className="network-selector__section-header">
                  <FaGlobe className="network-selector__section-icon" />
                  <span className="network-selector__section-title">Mainnet</span>
                </div>
                {networks.filter(network => !network.isTestnet).map((network) => {
                  const networkStatus = getNetworkStatus(network);
                  return (
                    <button
                      key={network.id}
                      className={cn('network-selector__option', {
                        'network-selector__option--selected': network.id === currentNetwork.id,
                        'network-selector__option--disabled': networkStatus === 'inactive'
                      })}
                      onClick={() => handleNetworkSelect(network)}
                      disabled={networkStatus === 'inactive'}
                      role="option"
                      aria-selected={network.id === currentNetwork.id}
                    >
                      <div className="network-selector__option-content">
                        <div className="network-selector__option-main">
                          {showStatus && (
                            <FaCircle
                              className="network-selector__status-dot"
                              style={{ color: getStatusColor(networkStatus) }}
                            />
                          )}
                          <span className="network-selector__option-name">
                            {network.displayName}
                          </span>
                        </div>

                        {showStatus && (
                          <span className="network-selector__status-text">
                            {getStatusText(networkStatus)}
                          </span>
                        )}
                      </div>

                      {network.id === currentNetwork.id && (
                        <FaCheck className="network-selector__check" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Testnet Section */}
              <div className="network-selector__section">
                <div className="network-selector__section-header">
                  <FaFlask className="network-selector__section-icon" />
                  <span className="network-selector__section-title">Testnet</span>
                </div>
                {networks.filter(network => network.isTestnet).map((network) => {
                  const networkStatus = getNetworkStatus(network);
                  return (
                    <button
                      key={network.id}
                      className={cn('network-selector__option', {
                        'network-selector__option--selected': network.id === currentNetwork.id,
                        'network-selector__option--disabled': networkStatus === 'inactive'
                      })}
                      onClick={() => handleNetworkSelect(network)}
                      disabled={networkStatus === 'inactive'}
                      role="option"
                      aria-selected={network.id === currentNetwork.id}
                    >
                      <div className="network-selector__option-content">
                        <div className="network-selector__option-main">
                          {showStatus && (
                            <FaCircle
                              className="network-selector__status-dot"
                              style={{ color: getStatusColor(networkStatus) }}
                            />
                          )}
                          <span className="network-selector__option-name">
                            {network.displayName}
                          </span>
                          <span className="network-selector__badge network-selector__badge--small">
                            Testnet
                          </span>
                        </div>

                        {showStatus && (
                          <span className="network-selector__status-text">
                            {getStatusText(networkStatus)}
                          </span>
                        )}
                      </div>

                      {network.id === currentNetwork.id && (
                        <FaCheck className="network-selector__check" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom RPC Button */}
              {allowCustomRpc && (
                <div className="network-selector__section">
                  <button
                    className="network-selector__custom-rpc-trigger"
                    onClick={() => setShowCustomRpc(true)}
                  >
                    <FaPlus className="network-selector__custom-rpc-icon" />
                    <span>Add Custom RPC</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Custom RPC Form */
            <div className="network-selector__custom-rpc-form">
              <div className="network-selector__custom-rpc-header">
                <h3 className="network-selector__custom-rpc-title">Add Custom RPC</h3>
                <button
                  className="network-selector__custom-rpc-close"
                  onClick={handleCustomRpcCancel}
                  aria-label="Close custom RPC form"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="network-selector__custom-rpc-fields">
                <div className="network-selector__field">
                  <label className="network-selector__field-label">Network Name</label>
                  <input
                    type="text"
                    className="network-selector__field-input"
                    placeholder="e.g., Movement Custom"
                    value={customRpcForm.name}
                    onChange={(e) => setCustomRpcForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="network-selector__field">
                  <label className="network-selector__field-label">RPC URL</label>
                  <input
                    type="url"
                    className="network-selector__field-input"
                    placeholder="https://your-rpc-url.com"
                    value={customRpcForm.rpcUrl}
                    onChange={(e) => setCustomRpcForm(prev => ({ ...prev, rpcUrl: e.target.value }))}
                  />
                </div>

                <div className="network-selector__field">
                  <label className="network-selector__field-label">Chain ID</label>
                  <input
                    type="number"
                    className="network-selector__field-input"
                    placeholder="1"
                    value={customRpcForm.chainId}
                    onChange={(e) => setCustomRpcForm(prev => ({ ...prev, chainId: e.target.value }))}
                  />
                </div>

                <div className="network-selector__field">
                  <label className="network-selector__field-label">Explorer URL (Optional)</label>
                  <input
                    type="url"
                    className="network-selector__field-input"
                    placeholder="https://explorer.example.com"
                    value={customRpcForm.explorerUrl}
                    onChange={(e) => setCustomRpcForm(prev => ({ ...prev, explorerUrl: e.target.value }))}
                  />
                </div>

                {customRpcError && (
                  <div className="network-selector__error">
                    {customRpcError}
                  </div>
                )}

                <div className="network-selector__custom-rpc-actions">
                  <button
                    className="network-selector__custom-rpc-cancel"
                    onClick={handleCustomRpcCancel}
                  >
                    Cancel
                  </button>
                  <button
                    className="network-selector__custom-rpc-submit"
                    onClick={handleCustomRpcSubmit}
                  >
                    Add Network
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;
export { DEFAULT_NETWORKS };
export type { Network };
