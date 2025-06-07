import React, { useState } from 'react';
import { FaUserCircle, FaChevronDown, FaCopy, FaTrash, FaCog, FaBars } from 'react-icons/fa';
import AccountInfoCard from './AccountSidebar/AccountInfoCard';
import SettingsCard from './SettingsCard';
import TokenLogo from '../assets/TokenLogo.png'; // Make sure this path is correct

interface DashboardHeaderProps {
  toggleSidebar: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ toggleSidebar }) => {
  const [savedAddresses, setSavedAddresses] = useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const [showSettingsCard, setShowSettingsCard] = useState(false);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  const handleAddressSelect = (address: string) => {
    setSelectedAddress(address);
  };

  const handleAddressRemove = (index: number) => {
    const updatedAddresses = [...savedAddresses];
    updatedAddresses.splice(index, 1);
    setSavedAddresses(updatedAddresses);
    
    if (selectedAddress === savedAddresses[index]) {
      setSelectedAddress(updatedAddresses[0] || '');
    }
  };

  const toggleSettingsCard = () => {
    setShowSettingsCard(!showSettingsCard);
    setShowAccountInfo(false);
  };

  const closeSettingsCard = () => {
    setShowSettingsCard(false);
  };

  const handleAccountButtonClick = () => {
    setShowAccountInfo(!showAccountInfo);
    closeSettingsCard();
  };

  return (
    <>
      <header className="dashboard-header">
        <div className="header-left">
          <button 
            className="sidebar-toggle mobile-only"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FaBars size={18} />
          </button>
          <div className="breadcrumb mobile-only">
            <img 
              src={TokenLogo} 
              alt="Metacoms Logo" 
              className="header-logo"
            />
          </div>
        </div>

        <div className="brand">
          <div className="saved-addresses">
            {savedAddresses.length > 0 && (
              <div className="address-list">
                {savedAddresses.map((addr, index) => (
                  <div 
                    key={index} 
                    className={`address-item ${selectedAddress === addr ? 'active' : ''}`}
                    onClick={() => handleAddressSelect(addr)}
                  >
                    <span className="address-value">
                      {`${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`}
                    </span>
                    <div className="address-actions">
                      <button 
                        className="action-button" 
                        title="Copy address"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyAddress(addr);
                        }}
                      >
                        <FaCopy size={14} />
                      </button>
                      <button 
                        className="action-button" 
                        title="Remove address"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddressRemove(index);
                        }}
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="header-actions">
          <div className="account-settings-group">
            <button
              className="settings-button"
              title="Open settings"
              onClick={toggleSettingsCard}
            >
              <FaCog size={16} />
            </button>
            <button 
              className="account-button" 
              onClick={handleAccountButtonClick}
            >
              <FaUserCircle size={20} />
              <span>Account</span>
              <FaChevronDown size={16} />
            </button>

            <SettingsCard show={showSettingsCard} onClose={closeSettingsCard} />
          </div>
        </div>
      </header>

      {showAccountInfo && (
        <div 
          className={`account-info-backdrop ${showAccountInfo ? 'active' : ''}`}
          onClick={() => setShowAccountInfo(false)}
        />
      )}
      <AccountInfoCard 
        show={showAccountInfo} 
        onClose={() => setShowAccountInfo(false)} 
      />
    </>
  );
};

export default DashboardHeader;