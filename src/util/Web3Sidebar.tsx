import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaHistory, 
  FaLock, 
  FaUnlock,
  FaTimes,
  FaTwitter,
  FaDiscord,
  FaTelegram,
  FaGithub,
  FaLinkedin,
  FaEllipsisH
} from "react-icons/fa";
import { GrAd } from "react-icons/gr";
import { FaRegImages } from "react-icons/fa6";
import { RiDashboardHorizontalFill } from "react-icons/ri";
import "./Web3Sidebar.css";
import TokenLogo from '../assets/TokenLogo.png'; // Import the image

interface Web3SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const Web3Sidebar = ({ mobileOpen, setMobileOpen }: Web3SidebarProps) => {
  const [isLocked, setIsLocked] = useState(false);

  const socialLinks = [
    { icon: FaTwitter, url: "https://twitter.com/yourhandle", label: "Twitter" },
    { icon: FaDiscord, url: "https://discord.gg/yourserver", label: "Discord" },
    { icon: FaTelegram, url: "https://t.me/yourchannel", label: "Telegram" },
    { icon: FaGithub, url: "https://github.com/yourrepo", label: "GitHub" },
    { icon: FaLinkedin, url: "https://linkedin.com/company/yourcompany", label: "LinkedIn" }
  ];

  return (
    <aside className={`web3-sidebar ${isLocked ? 'locked' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {/* Replace text logo with image */}
          <img 
            src={TokenLogo} 
            alt="Metacoms Logo" 
            className="logo-icon"
          />
        </div>
        <button 
          className="sidebar-lock" 
          onClick={() => setIsLocked(!isLocked)}
          title={isLocked ? "Unlock sidebar" : "Lock sidebar"}
        >
          {isLocked ? <FaUnlock /> : <FaLock />}
        </button>
        <button 
          className="mobile-close-btn"
          onClick={() => setMobileOpen(false)}
        >
          <FaTimes />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/dashboard" className="nav-link">
              <RiDashboardHorizontalFill className="nav-icon" />
              <span className="nav-text">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/transactions" className="nav-link">
              <FaHistory className="nav-icon" />
              <span className="nav-text">Transactions</span>
            </Link>
          </li>
          <li>
            <Link to="/NetworthDistribution" className="nav-link">
              <GrAd className="nav-icon" />
              <span className="nav-text">Networth</span>
            </Link>
          </li>
          <li>
            <Link to="/AccountNfts" className="nav-link">
              <FaRegImages className="nav-icon" />
              <span className="nav-text">NFTs</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Social Links Section */}
      <div className="sidebar-footer">
        <div className="social-links">
          {/* Show 3-dot menu when collapsed */}
          <div className="social-collapsed">
            <FaEllipsisH className="social-indicator" />
          </div>
          
          {/* Show all social icons when expanded */}
          <div className="social-expanded">
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  title={social.label}
                >
                  <IconComponent className="social-icon" />
                </a>
              );
            })}
          </div>
        </div>
        <div className="copyright">
          <span className="copyright-text">© 2025 Metacoms</span>
        </div>
      </div>
    </aside>
  );
};

export default Web3Sidebar;