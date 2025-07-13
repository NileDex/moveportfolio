import { useState, useEffect, useRef } from "react";
import { useWallet } from "@razorlabs/razorkit";
import { useAccount } from "@razorlabs/razorkit";
import { useAnimation, useConditionalAnimation } from "@/contexts/AnimationContext";
import { fadeIn, staggerFadeIn } from "@/lib/animations";

// Import shadcn/ui components
import { Button } from "@/components/ui/button";
import AccountActivityChart from "./charts/AccountActivityChart";
import NetworkPerformanceChart from "./charts/NetworkPerformanceChart";
import DeFiDashboard from "./charts/DeFiDashboard";
import LatestTransactions from "./LatestTransactions";
import LatestBlocks from "./LatestBlocks";
import MoveSupplyCard from "./metrics/MoveSupplyCard";
import NetworkMetricsCard from "./metrics/NetworkMetricsCard";
import StakeMetricsCard from "./metrics/StakeMetricsCard";
import CurrentEpochCard from "./metrics/CurrentEpochCard";
import TopDataTabs from "./tables/TopDataTabs";



export default function Dashboard() {
  const { connected } = useWallet();
  const { isConnected, isConnecting } = useAccount();
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  // Animation refs and hooks
  const containerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const tablesRef = useRef<HTMLDivElement>(null);

  const { isAnimationEnabled } = useAnimation();
  const { shouldAnimate, shouldUseStagger } = useConditionalAnimation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingConnection(false);
    }, 2000);

    if (connected && isConnected) {
      setIsCheckingConnection(false);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [connected, isConnected, isConnecting]);

  // Animation effects
  useEffect(() => {
    if (!shouldAnimate || !connected || !isConnected) return;

    const animateElements = () => {
      // Animate container
      if (containerRef.current) {
        fadeIn(containerRef.current, { delay: 0.1 });
      }

      // Animate metrics cards with stagger
      if (metricsRef.current && shouldUseStagger) {
        const cards = metricsRef.current.querySelectorAll('.metric-card');
        if (cards.length > 0) {
          staggerFadeIn(Array.from(cards), { stagger: 0.1 });
        }
      }

      // Animate charts section
      if (chartsRef.current) {
        fadeIn(chartsRef.current, { delay: 0.3 });
      }

      // Animate tables section
      if (tablesRef.current) {
        fadeIn(tablesRef.current, { delay: 0.5 });
      }
    };

    // Small delay to ensure DOM is ready
    const animationTimer = setTimeout(animateElements, 100);
    return () => clearTimeout(animationTimer);
  }, [shouldAnimate, shouldUseStagger, connected, isConnected]);



  if (isCheckingConnection || isConnecting) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-8">
          <p>Checking wallet connection...</p>
        </div>
      </div>
    );
  }

  if (!connected && !isConnected) {
    return null;
  }



  return (
    <div ref={containerRef} className="container mx-auto px-4 py-6 max-w-7xl opacity-0">
      <div className="space-y-8">
        {/* Top Metrics Grid */}
        <div ref={metricsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="metric-card opacity-0"><MoveSupplyCard /></div>
          <div className="metric-card opacity-0"><CurrentEpochCard /></div>
          <div className="metric-card opacity-0"><NetworkMetricsCard /></div>
          <div className="metric-card opacity-0"><StakeMetricsCard /></div>
        </div>

        {/* Analytics Grid - Consistent 24px spacing */}
        <div ref={chartsRef} className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-[600px] lg:min-h-[700px] xl:min-h-[800px] opacity-0">
          {/* Left Column: 2 Charts Stacked */}
          <div className="flex flex-col gap-6 h-full min-h-[600px] lg:min-h-[700px] xl:min-h-[800px]">
            <div className="flex-1 min-h-[280px] lg:min-h-[320px] xl:min-h-[380px]">
              <AccountActivityChart />
            </div>
            <div className="flex-1 min-h-[280px] lg:min-h-[320px] xl:min-h-[380px]">
              <NetworkPerformanceChart />
            </div>
          </div>

          {/* Right Column: DeFi Dashboard (Full Height) */}
          <div className="h-full min-h-[600px] lg:min-h-[700px] xl:min-h-[800px]">
            <DeFiDashboard />
          </div>
        </div>

        {/* Top Data Tables with Tabs */}
        <TopDataTabs />

        {/* Tables Grid - Moved Below */}
        <div ref={tablesRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-0">
          <LatestTransactions limit={5} />
          <LatestBlocks limit={5} />
        </div>
      </div>
    </div>
  );
}
