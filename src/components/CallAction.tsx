import React, { useState, useEffect } from "react";

interface Web3Project {
  name: string;
  banner: string;
  logo: string;
}

const web3Projects: Web3Project[] = [
  {
    name: "Capy Go",
    banner:
      "https://pbs.twimg.com/media/GsmSVwEasAEoRV-?format=jpg&name=small",
    logo: "https://pbs.twimg.com/profile_images/1876145039640027136/lYgxlfPM_400x400.jpg",
  },
  {
    name: "Move Industries",
    banner:
      "https://pbs.twimg.com/media/Gsi3_VuasAIbyDc?format=jpg&name=small",
    logo: "https://pbs.twimg.com/profile_images/1917733930217664512/y52zNrEW_400x400.jpg",
  },
  {
    name: "Move Position",
    banner:
      "https://pbs.twimg.com/profile_banners/1806181514406993920/1722267816/1080x360",
    logo: "https://pbs.twimg.com/profile_images/1817949096486858752/Je9zWQrK_400x400.jpg",
  },
  
];

const CallAction: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % web3Projects.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    target.style.display = "none";
  };

  const handleBannerError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    target.src =
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop";
  };

  const handleLogoError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    target.src = "https://via.placeholder.com/40x40/121212/AAFF00?text=?";
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="call-action-container">
      <h2 className="call-action-title">Get More Out of The Movement</h2>

      <div className="call-action-grid">
        {/* Left Section - CTA Cards */}
        <div>
          <div className="call-action-card">
            <img
            className="call-action-img"
              src="https://pbs.twimg.com/profile_images/1917733930217664512/y52zNrEW_400x400.jpg"
              alt="Education"
              onError={handleImageError}
            />
            <div className="call-action-card-content">
              <h3 className="call-action-card-title">Education Hub</h3>
              <p className="call-action-card-description">
                This is your starting point to get up to speed in
                all-things-Move
              </p>
              <a href="#" className="call-action-learn-more">
                Learn More <span>↗</span>
              </a>
            </div>
          </div>

          <div className="call-action-card">
        
              <img
                className="call-action-img"
                src="https://pbs.twimg.com/profile_images/1850502037970022402/s7UTE4Cl_400x400.png"
                alt="Community"
                onError={handleImageError}
              />
           
            <div className="call-action-card-content">
              <h3 className="call-action-card-title">
                Connect with the Community
              </h3>
              <p className="call-action-card-description">
                Meet builders, network with like-minded people, and discover...
              </p>
              <a href="#" className="call-action-learn-more">
                Learn More <span>↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Section - Web3 Carousel */}
        <div>
          <div className="call-action-carousel">
            <h3 className="call-action-carousel-title">Featured Projects</h3>

            {/* Carousel Content */}
            <div className="call-action-carousel-content">
              {web3Projects.map((project, index) => (
                <div
                  key={index}
                  className="call-action-carousel-slide"
                  style={{
                    transform: `translateX(${(index - currentSlide) * 100}%)`,
                    opacity: index === currentSlide ? 1 : 0,
                  }}
                >
                  <img
                    src={project.banner}
                    alt={project.name}
                    className="call-action-project-banner"
                    onError={handleBannerError}
                  />
                  <div className="call-action-project-overlay" />
                  <div className="call-action-project-info">
                    <img
                      src={project.logo}
                      alt={`${project.name} logo`}
                      className="call-action-project-logo"
                      onError={handleLogoError}
                    />
                    <h4 className="call-action-project-name">{project.name}</h4>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Footer with Controls */}
            <div className="call-action-carousel-footer">
              {/* Carousel Indicators */}
              <div className="call-action-indicators">
                {web3Projects.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`call-action-indicator ${
                      index === currentSlide
                        ? "call-action-indicator-active"
                        : "call-action-indicator-inactive"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="call-action-navigation">
                <button
                  onClick={() =>
                    goToSlide(
                      currentSlide === 0
                        ? web3Projects.length - 1
                        : currentSlide - 1
                    )
                  }
                  className="call-action-nav-button"
                  aria-label="Previous slide"
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span className="call-action-nav-counter">
                  {currentSlide + 1} / {web3Projects.length}
                </span>
                <button
                  onClick={() =>
                    goToSlide(
                      currentSlide === web3Projects.length - 1
                        ? 0
                        : currentSlide + 1
                    )
                  }
                  className="call-action-nav-button"
                  aria-label="Next slide"
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="call-action-progress-bar">
              <div
                className="call-action-progress-fill"
                style={{
                  width: `${((currentSlide + 1) / web3Projects.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallAction;
