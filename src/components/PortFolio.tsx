import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet, ConnectModal } from "@razorlabs/razorkit";
import { FiArrowRight } from 'react-icons/fi';
import modalillustration from '../assets/modalillustration.webm';
import { useConditionalAnimation } from '@/contexts/AnimationContext';
import { fadeIn, slideUp } from '@/lib/animations';

function PortfolioContent() {
  const { connected, account } = useWallet();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();

  // Animation refs
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { shouldAnimate } = useConditionalAnimation();

  // Handle successful connection and navigation
  useEffect(() => {
    if (connected && account) {
      navigate('/dashboard');
    }
  }, [connected, account, navigate]);

  // Animation effects
  useEffect(() => {
    if (!shouldAnimate) return;

    const animateElements = () => {
      // Animate hero section
      if (heroRef.current) {
        fadeIn(heroRef.current, { delay: 0.1 });
      }

      // Animate title with slide up
      if (titleRef.current) {
        slideUp(titleRef.current, { delay: 0.3 });
      }

      // Animate subtitle
      if (subtitleRef.current) {
        slideUp(subtitleRef.current, { delay: 0.5 });
      }

      // Animate button
      if (buttonRef.current) {
        slideUp(buttonRef.current, { delay: 0.7 });
      }
    };

    // Small delay to ensure DOM is ready
    const animationTimer = setTimeout(animateElements, 100);
    return () => clearTimeout(animationTimer);
  }, [shouldAnimate]);

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
    <div ref={heroRef} className="portfolio-container opacity-0">
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
          <h1 ref={titleRef} className="opacity-0">
            <span className="text-light">Get deep insights on any wallet,</span>
            <br />
            <span className="text-light">token or dApp on </span>
            <span className="gradient-text">Movement</span>
          </h1>
        </div>
      </div>

      {/* Original Footer - Unchanged */}
      <div className="footer">
        <p ref={subtitleRef} className="opacity-0">
          <span>Monitor Performance.</span>
          <span>Identify Alpha.</span>
          <span>Elevate Your Strategy -</span>
        </p>
        <div className="cta" onClick={handleCreatePortfolio}>
          <button ref={buttonRef} className="custom-connect-button opacity-0" disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : connected ? 'Go to Dashboard' : 'Connect Wallet'}
          </button>
          <FiArrowRight />
        </div>
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