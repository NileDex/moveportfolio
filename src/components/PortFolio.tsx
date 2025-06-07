// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useWallet, ConnectModal } from "@razorlabs/razorkit";
// import { FiArrowRight, FiMessageSquare } from 'react-icons/fi';

// function PortfolioContent() {
//   const { connected, account } = useWallet();
//   const [showConnectModal, setShowConnectModal] = useState(false);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const navigate = useNavigate();

//   // Handle successful connection and navigation
//   useEffect(() => {
//     if (connected && account) {
//       navigate('/dashboard');
//     }
//   }, [connected, account, navigate]);

//   const handleCreatePortfolio = () => {
//     if (connected) {
//       navigate('/dashboard');
//     } else {
//       setIsConnecting(true);
//       setShowConnectModal(true);
//     }
//   };

//   const handleConnectModalChange = (open: boolean) => {
//     setShowConnectModal(open);
    
//     // If modal closes and we're connected, navigate
//     if (!open && connected) {
//       navigate('/dashboard');
//     } else if (!open) {
//       setIsConnecting(false);
//     }
//   };

//   return (
//     <div className="container">
//       <div className="content-wrapper">
//         {/* Logo */}
//         <div className="logo">
//           <div className="logo-placeholder">Your Logo Here</div>
//         </div>

//         {/* Headline */}
//         <div className="headline">
//           <h1>
//             <span className="text-light">Get deep insights on any wallet,</span>
//             <br />
//             <span className="text-light">token or dApp on </span>
//             <span className="gradient-text">Movement</span>
//           </h1>
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="footer">
//         <span>Monitor Performance.</span>
//         <span>Identify Alpha.</span>
//         <span>Elevate Your Strategy -</span>
//         <div className="cta" onClick={handleCreatePortfolio}>
//           <button className="custom-connect-button" disabled={isConnecting}>
//             {isConnecting ? 'Connecting...' : connected ? 'Go to Dashboard' : 'Connect Wallet'}
//           </button>
//           <FiArrowRight />
//         </div>
//       </div>

//       {/* Chat Button */}
//       <div className="chat-button">
//         <button>
//           <FiMessageSquare />
//         </button>
//       </div>

//       {/* Connect Modal */}
//       <ConnectModal
//         open={showConnectModal}
//         onOpenChange={handleConnectModalChange}
//       />
//     </div>
//   );
// }

// export default function Portfolio() {
//   return <PortfolioContent />;
// }








import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet, ConnectModal } from "@razorlabs/razorkit";
import { FiArrowRight, FiMessageSquare } from 'react-icons/fi';
import modalillustration from '../assets/modalillustration.webm';

function PortfolioContent() {
  const { connected, account } = useWallet();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();

  // Handle successful connection and navigation
  useEffect(() => {
    if (connected && account) {
      navigate('/dashboard');
    }
  }, [connected, account, navigate]);

  const handleCreatePortfolio = () => {
    if (connected) {
      navigate('/dashboard');
    } else {
      setIsConnecting(true);
      setShowConnectModal(true);
    }
  };

  const handleConnectModalChange = (open: boolean) => {
    setShowConnectModal(open);
    
    // If modal closes and we're connected, navigate
    if (!open && connected) {
      navigate('/dashboard');
    } else if (!open) {
      setIsConnecting(false);
    }
  };

  return (
    <div className="container">
      <div className="content-wrapper">
        {/* Video Logo - Only Changed Element */}
        <div className="logo">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="logo-video"
          >
            <source src={modalillustration} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Original Headline - Unchanged */}
        <div className="headline">
          <h1>
            <span className="text-light">Get deep insights on any wallet,</span>
            <br />
            <span className="text-light">token or dApp on </span>
            <span className="gradient-text">Movement</span>
          </h1>
        </div>
      </div>

      {/* Original Footer - Unchanged */}
      <div className="footer">
        <span>Monitor Performance.</span>
        <span>Identify Alpha.</span>
        <span>Elevate Your Strategy -</span>
        <div className="cta" onClick={handleCreatePortfolio}>
          <button className="custom-connect-button" disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : connected ? 'Go to Dashboard' : 'Connect Wallet'}
          </button>
          <FiArrowRight />
        </div>
      </div>

      {/* Original Chat Button - Unchanged */}
      <div className="chat-button">
        <button>
          <FiMessageSquare />
        </button>
      </div>

      {/* Original Connect Modal - Unchanged */}
      <ConnectModal
        open={showConnectModal}
        onOpenChange={handleConnectModalChange}
      />
    </div>
  );
}

export default function Portfolio() {
  return <PortfolioContent />;
}