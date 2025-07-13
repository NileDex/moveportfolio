import React, { useState } from 'react';
import { 
  FaCode, 
  FaBook, 
  FaRocket, 
  FaTools, 
  FaGithub,
  FaExternalLinkAlt,
  FaDownload,
  FaShieldAlt,
  FaGlobe,
  FaTerminal,
  FaCopy,
  FaCheck,
  FaPlay
} from 'react-icons/fa';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

export interface DeveloperResource {
  title: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  category: 'docs' | 'tools' | 'sdk' | 'api';
  featured?: boolean;
}

export interface CodeExample {
  title: string;
  language: string;
  code: string;
  description: string;
}

export interface DeveloperCornerProps {
  className?: string;
  showQuickStart?: boolean;
  showCodeExamples?: boolean;
}

/**
 * DeveloperCorner Component
 * Comprehensive developer resources and tools section
 * Provides quick access to documentation, APIs, SDKs, and development tools
 */
const DeveloperCorner: React.FC<DeveloperCornerProps> = ({
  className,
  showQuickStart = true,
  showCodeExamples = true
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const developerResources: DeveloperResource[] = [
    {
      title: 'Movement Documentation',
      description: 'Complete guide to building on Movement Network',
      url: 'https://docs.movementlabs.xyz',
      icon: <FaBook />,
      category: 'docs',
      featured: true
    },
    {
      title: 'API Reference',
      description: 'REST and GraphQL API documentation',
      url: 'https://api.movementlabs.xyz/docs',
      icon: <FaCode />,
      category: 'api',
      featured: true
    },
    {
      title: 'Movement SDK',
      description: 'TypeScript/JavaScript SDK for Movement',
      url: 'https://github.com/movementlabs/movement-sdk',
      icon: <FaDownload />,
      category: 'sdk',
      featured: true
    },
    {
      title: 'Contract Verification',
      description: 'Verify and publish your smart contracts',
      url: '/tools/verify-contract',
      icon: <FaShieldAlt />,
      category: 'tools'
    },
    {
      title: 'Movement CLI',
      description: 'Command-line tools for developers',
      url: 'https://github.com/movementlabs/movement-cli',
      icon: <FaTerminal />,
      category: 'tools'
    },
    {
      title: 'GitHub Repository',
      description: 'Open source code and examples',
      url: 'https://github.com/movementlabs',
      icon: <FaGithub />,
      category: 'tools'
    },
    {
      title: 'Domain Services',
      description: 'Register and manage .move domains',
      url: '/tools/domains',
      icon: <FaGlobe />,
      category: 'tools'
    },
    {
      title: 'Testnet Faucet',
      description: 'Get test tokens for development',
      url: 'https://faucet.movementlabs.xyz',
      icon: <FaRocket />,
      category: 'tools'
    }
  ];

  const codeExamples: CodeExample[] = [
    {
      title: 'Connect to Movement Network',
      language: 'typescript',
      description: 'Initialize connection to Movement Network',
      code: `import { AptosConfig, Aptos, Network } from "@aptos-labs/ts-sdk";

const config = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: "https://mainnet.movementnetwork.xyz/v1"
});

const aptos = new Aptos(config);

// Get account info
const account = await aptos.getAccountInfo({
  accountAddress: "0x1234..."
});`
    },
    {
      title: 'Query Transaction History',
      language: 'typescript',
      description: 'Fetch account transactions using GraphQL',
      code: `const query = \`
  query GetTransactions($address: String!) {
    user_transactions(
      where: {sender: {_eq: $address}}
      order_by: {version: desc}
      limit: 10
    ) {
      version
      sender
      timestamp
      gas_used
      gas_unit_price
      entry_function_id_str
    }
  }
\`;

const graphqlEndpoint = import.meta.env.DEV
  ? '/api/graphql'
  : 'https://indexer.mainnet.movementnetwork.xyz/v1/graphql';

const response = await fetch(graphqlEndpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables: { address } })
});`
    },
    {
      title: 'Submit Transaction',
      language: 'typescript',
      description: 'Send a transaction to the network',
      code: `import { Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

const privateKey = new Ed25519PrivateKey("0x...");
const account = Account.fromPrivateKey({ privateKey });

const transaction = await aptos.transaction.build.simple({
  sender: account.accountAddress,
  data: {
    function: "0x1::coin::transfer",
    typeArguments: ["0x1::aptos_coin::AptosCoin"],
    functionArguments: [recipient, amount]
  }
});

const response = await aptos.signAndSubmitTransaction({
  signer: account,
  transaction
});`
    }
  ];

  const copyToClipboard = async (code: string, title: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(title);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const featuredResources = developerResources.filter(resource => resource.featured);
  const toolsResources = developerResources.filter(resource => resource.category === 'tools' && !resource.featured);

  return (
    <div className={cn('developer-corner', className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="developer-corner__header">
          <div className="flex items-center gap-2">
            <FaCode className="developer-corner__header-icon" />
            <div>
              <h2 className="developer-corner__title">Developer Corner</h2>
              <p className="developer-corner__subtitle">
                Everything you need to build on Movement Network
              </p>
            </div>
          </div>
        </div>

        {/* Featured Resources */}
        <Card>
          <CardHeader
            title="Getting Started"
            subtitle="Essential resources for Movement developers"
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredResources.map((resource, index) => (
                <div key={index}>
                  <div className="developer-corner__resource-card">
                    <div className="developer-corner__resource-icon">
                      {resource.icon}
                    </div>
                    <div className="developer-corner__resource-content">
                      <h4 className="developer-corner__resource-title">
                        {resource.title}
                      </h4>
                      <p className="developer-corner__resource-description">
                        {resource.description}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="inline-flex items-center gap-2 developer-corner__resource-button"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        Open
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Start Guide */}
        {showQuickStart && (
          <Card>
            <CardHeader
              title="Quick Start"
              subtitle="Get up and running in minutes"
            />
            <CardContent>
              <div className="developer-corner__quick-start">
                <div className="developer-corner__step">
                  <div className="developer-corner__step-number">1</div>
                  <div className="developer-corner__step-content">
                    <h4>Install the SDK</h4>
                    <code>npm install @aptos-labs/ts-sdk</code>
                  </div>
                </div>
                <div className="developer-corner__step">
                  <div className="developer-corner__step-number">2</div>
                  <div className="developer-corner__step-content">
                    <h4>Configure Network</h4>
                    <p>Set up connection to Movement Network</p>
                  </div>
                </div>
                <div className="developer-corner__step">
                  <div className="developer-corner__step-number">3</div>
                  <div className="developer-corner__step-content">
                    <h4>Start Building</h4>
                    <p>Create your first transaction or query</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Code Examples */}
        {showCodeExamples && (
          <Card>
            <CardHeader
              title="Code Examples"
              subtitle="Common patterns and implementations"
            />
            <CardContent>
              <div className="space-y-4">
                {codeExamples.map((example, index) => (
                  <div key={index} className="developer-corner__code-example">
                    <div className="developer-corner__code-header">
                      <div>
                        <h4 className="developer-corner__code-title">
                          {example.title}
                        </h4>
                        <p className="developer-corner__code-description">
                          {example.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="inline-flex items-center gap-2 developer-corner__copy-button"
                        onClick={() => copyToClipboard(example.code, example.title)}
                      >
                        {copiedCode === example.title ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <div className="developer-corner__code-block">
                      <pre>
                        <code className={`language-${example.language}`}>
                          {example.code}
                        </code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Developer Tools */}
        <Card>
          <CardHeader
            title="Developer Tools"
            subtitle="Utilities and services for development"
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {toolsResources.map((tool, index) => (
                <div key={index}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="inline-flex items-center gap-2 developer-corner__tool-button"
                    onClick={() => window.open(tool.url, '_blank')}
                  >
                    {tool.title}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Community & Support */}
        <Card>
          <CardHeader
            title="Community & Support"
            subtitle="Get help and connect with other developers"
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <div className="developer-corner__support-item">
                  <FaGithub className="developer-corner__support-icon" />
                  <div>
                    <h4>GitHub Discussions</h4>
                    <p>Ask questions and share ideas</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="developer-corner__support-item">
                  <FaBook className="developer-corner__support-icon" />
                  <div>
                    <h4>Documentation</h4>
                    <p>Comprehensive guides and tutorials</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="developer-corner__support-item">
                  <FaRocket className="developer-corner__support-icon" />
                  <div>
                    <h4>Developer Portal</h4>
                    <p>Advanced tools and resources</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeveloperCorner;
export type { DeveloperResource, CodeExample, DeveloperCornerProps };
