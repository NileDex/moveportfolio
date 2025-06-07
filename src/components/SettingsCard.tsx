import React from 'react';


interface SettingsCardProps {
  show: boolean;
  onClose: () => void;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ show, onClose }) => {
  if (!show) return null; // Don't render if not shown

  // We'll add a simple backdrop for closing the card when clicking outside
  return (
    <>
      <div className="settings-card-backdrop" onClick={onClose} />
      <div className="settings-card">
        <div className="settings-section">
          <div className="section-title">Global Display</div>
          <div className="setting-item">
            <span className="setting-label">Show Net Worth</span>
            {/* Placeholder for Toggle Switch - Implement later */}
            <div className="toggle-switch-placeholder"></div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">Portfolio Display</div>
          <div className="setting-item">
            <span className="setting-label">Show Net Worth</span>
            {/* Placeholder for Toggle Switch - Implement later */}
            <div className="toggle-switch-placeholder"></div>
          </div>
        </div>

      </div>
    </>
  );
};

export default SettingsCard; 