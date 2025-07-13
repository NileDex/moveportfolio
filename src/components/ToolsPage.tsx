import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ExportDataTools from './ExportDataTools';
import { 
  FaTools, 
  FaDownload, 
  FaChartLine, 
  FaFileContract,
  FaShieldAlt,
  FaGlobe,
  FaCalculator
} from 'react-icons/fa';

/**
 * ToolsPage Component
 * Comprehensive tools and utilities page for developers and power users
 * Includes data export, analytics, and various blockchain utilities
 */
const ToolsPage: React.FC = () => {
  const toolCategories = [
    {
      title: 'Data & Analytics',
      icon: <FaChartLine />,
      tools: [
        { name: 'Data Export', description: 'Export blockchain data in multiple formats', available: true },
        { name: 'Transaction Analytics', description: 'Analyze transaction patterns and trends', available: true },
        { name: 'Portfolio Tracker', description: 'Track portfolio performance over time', available: true },
        { name: 'Custom Reports', description: 'Generate custom analytical reports', available: false }
      ]
    },
    {
      title: 'Developer Tools',
      icon: <FaTools />,
      tools: [
        { name: 'Contract Verification', description: 'Verify and publish smart contracts', available: false },
        { name: 'API Testing', description: 'Test Movement Network APIs', available: false },
        { name: 'Gas Calculator', description: 'Estimate transaction costs', available: false },
        { name: 'Address Converter', description: 'Convert between address formats', available: false }
      ]
    },
    {
      title: 'Security & Utilities',
      icon: <FaShieldAlt />,
      tools: [
        { name: 'Address Checker', description: 'Verify address safety and reputation', available: false },
        { name: 'Transaction Decoder', description: 'Decode transaction input data', available: false },
        { name: 'Domain Services', description: 'Register and manage .move domains', available: false },
        { name: 'Multi-sig Tools', description: 'Multi-signature wallet utilities', available: false }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4">
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
            <FaTools style={{ color: 'var(--primary-color)' }} />
            Developer Tools & Utilities
          </h1>
          <p style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            Comprehensive tools for developers, analysts, and power users of the Movement Network
          </p>
        </div>

        {/* Data Export Tools */}
        <ExportDataTools />

        {/* Tool Categories Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Available Tools</CardTitle>
            <p className="text-sm text-muted-foreground">Explore our comprehensive suite of blockchain tools and utilities</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {toolCategories.map((category, index) => (
                <div key={index}>
                  <div style={{
                    padding: 'var(--spacing-4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-base)',
                    backgroundColor: 'var(--surface-color)',
                    height: '100%'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-2)',
                      marginBottom: 'var(--spacing-3)'
                    }}>
                      <div style={{
                        fontSize: 'var(--font-size-xl)',
                        color: 'var(--primary-color)'
                      }}>
                        {category.icon}
                      </div>
                      <h3 style={{
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--text-color)',
                        margin: 0
                      }}>
                        {category.title}
                      </h3>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--spacing-2)'
                    }}>
                      {category.tools.map((tool, toolIndex) => (
                        <div key={toolIndex} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 'var(--spacing-2)',
                          backgroundColor: 'var(--bg-color)',
                          borderRadius: 'var(--radius-sm)',
                          opacity: tool.available ? 1 : 0.6
                        }}>
                          <div>
                            <div style={{
                              fontSize: 'var(--font-size-sm)',
                              fontWeight: 'var(--font-weight-medium)',
                              color: 'var(--text-color)',
                              marginBottom: 'var(--spacing-1)'
                            }}>
                              {tool.name}
                            </div>
                            <div style={{
                              fontSize: 'var(--font-size-xs)',
                              color: 'var(--text-secondary)'
                            }}>
                              {tool.description}
                            </div>
                          </div>
                          
                          <div style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '10px',
                            fontWeight: 'var(--font-weight-semibold)',
                            backgroundColor: tool.available ? 'var(--success-color)' : 'var(--warning-color)',
                            color: 'white'
                          }}>
                            {tool.available ? 'Available' : 'Coming Soon'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-sm text-muted-foreground">Frequently used tools and shortcuts</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <button style={{
                  width: '100%',
                  padding: 'var(--spacing-3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-base)',
                  backgroundColor: 'var(--surface-color)',
                  color: 'var(--text-color)',
                  cursor: 'pointer',
                  transition: 'var(--transition-all)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)'
                }}>
                  <FaDownload style={{ fontSize: 'var(--font-size-xl)', color: 'var(--primary-color)' }} />
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    Export Data
                  </span>
                </button>
              </div>

              <div>
                <button style={{
                  width: '100%',
                  padding: 'var(--spacing-3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-base)',
                  backgroundColor: 'var(--surface-color)',
                  color: 'var(--text-color)',
                  cursor: 'pointer',
                  transition: 'var(--transition-all)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  opacity: 0.6
                }}>
                  <FaFileContract style={{ fontSize: 'var(--font-size-xl)', color: 'var(--primary-color)' }} />
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    Verify Contract
                  </span>
                </button>
              </div>

              <div>
                <button style={{
                  width: '100%',
                  padding: 'var(--spacing-3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-base)',
                  backgroundColor: 'var(--surface-color)',
                  color: 'var(--text-color)',
                  cursor: 'pointer',
                  transition: 'var(--transition-all)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  opacity: 0.6
                }}>
                  <FaCalculator style={{ fontSize: 'var(--font-size-xl)', color: 'var(--primary-color)' }} />
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    Gas Calculator
                  </span>
                </button>
              </div>

              <div>
                <button style={{
                  width: '100%',
                  padding: 'var(--spacing-3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-base)',
                  backgroundColor: 'var(--surface-color)',
                  color: 'var(--text-color)',
                  cursor: 'pointer',
                  transition: 'var(--transition-all)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  opacity: 0.6
                }}>
                  <FaGlobe style={{ fontSize: 'var(--font-size-xl)', color: 'var(--primary-color)' }} />
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    Domain Services
                  </span>
                </button>
              </div>

              <div>
                <button style={{
                  width: '100%',
                  padding: 'var(--spacing-3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-base)',
                  backgroundColor: 'var(--surface-color)',
                  color: 'var(--text-color)',
                  cursor: 'pointer',
                  transition: 'var(--transition-all)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  opacity: 0.6
                }}>
                  <FaShieldAlt style={{ fontSize: 'var(--font-size-xl)', color: 'var(--primary-color)' }} />
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    Address Checker
                  </span>
                </button>
              </div>

              <div>
                <button style={{
                  width: '100%',
                  padding: 'var(--spacing-3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-base)',
                  backgroundColor: 'var(--surface-color)',
                  color: 'var(--text-color)',
                  cursor: 'pointer',
                  transition: 'var(--transition-all)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  opacity: 0.6
                }}>
                  <FaChartLine style={{ fontSize: 'var(--font-size-xl)', color: 'var(--primary-color)' }} />
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    Analytics
                  </span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ToolsPage;
