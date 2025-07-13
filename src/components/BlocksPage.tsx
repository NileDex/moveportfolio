import React from 'react';

import { FaCube } from 'react-icons/fa';
import LatestBlocks from './LatestBlocks';

/**
 * BlocksPage Component
 * Enhanced blocks explorer with latest block data
 */
const BlocksPage: React.FC = () => {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-3">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-color)',
            margin: '0 0 var(--spacing-2) 0',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-3)'
          }}>
            <FaCube style={{ color: 'var(--primary-color)' }} />
            Latest Blocks
          </h1>
          <p style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            Explore the latest blocks on the Movement Network
          </p>
        </div>

        {/* Latest Blocks */}
        <LatestBlocks limit={50} />
      </div>
    </div>
  );
};

export default BlocksPage;
