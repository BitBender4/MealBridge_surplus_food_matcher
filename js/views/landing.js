/**
 * MealBridge - Polished Landing & Home View
 * High-conversion hero, visual product preview, 3-step explanation, demo impact metrics,
 * and concise food-safety statement
 */

class LandingView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="landing-page">
        <!-- Hero Section -->
        <section class="hero-section">
          <div class="container hero-grid">
            <div class="hero-content">
              <div class="hero-pill">
                <span class="status-pulse-dot"></span>
                <span>MealBridge Food Rescue Platform</span>
              </div>
              <h1 class="hero-title">
                Every surplus meal has a deadline.
              </h1>
              <p class="hero-subtitle">
                MealBridge uses AI to turn rushed surplus-food messages into structured donations and quickly connect them with nearby shelters.
              </p>
              <div class="hero-cta-group">
                <button class="btn btn-primary btn-lg" id="heroDonateBtn">
                  <span>Donate surplus food</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <button class="btn btn-secondary btn-lg" id="heroShelterBtn">
                  <span>Find food for a shelter</span>
                </button>
              </div>

              <div class="hero-trust-bar">
                <div class="trust-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>AI Ingestion in 1s</span>
                </div>
                <div class="trust-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Smart Shelter Matching</span>
                </div>
                <div class="trust-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Real-time Coordination</span>
                </div>
              </div>
            </div>

            <!-- Visual Preview of Actual Product -->
            <div class="hero-card-col">
              <div class="live-card-wrapper">
                <div class="live-card-header-badge">
                  <span class="status-pulse-dot"></span>
                  <span>LIVE ACTIVE RESCUE PREVIEW</span>
                </div>

                <div class="live-donation-card">
                  <!-- Photo Banner of verified catering trays -->
                  <div class="live-card-photo-header">
                    <img src="assets/images/banquet_meals_packed.jpg" alt="120 Packed Vegetarian Catering Meals" class="live-card-hero-img" />
                    <div class="live-card-photo-overlay">
                      <span class="live-photo-badge">
                        <span class="status-pulse-dot" style="background:#10B981;"></span>
                        <span>Hot-Holding Temp: 63.8°C</span>
                      </span>
                      <span class="live-photo-venue">Orchid Banquet Hall, Andheri West</span>
                    </div>
                  </div>

                  <div class="preview-top-row">
                    <span class="preview-status-pill">
                      <span class="status-pulse-dot"></span> Ready now
                    </span>
                    <span style="font-family: var(--font-display); font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">
                      Manifest #MB-894
                    </span>
                  </div>

                  <div class="preview-meals-hero text-emerald">120 meals</div>
                  <div class="preview-meta-line">
                    <span>Vegetarian</span>
                    <span>·</span>
                    <span>Packed in catering trays</span>
                  </div>

                  <div class="preview-deadline-box">
                    <div>
                      <div class="deadline-k">COORDINATION DEADLINE</div>
                      <div class="deadline-v">1h 42m remaining</div>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>

                  <div class="recipient-preview-banner">
                    <div class="recipient-avatar-box">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    </div>
                    <div class="recipient-info-col">
                      <span class="rec-label">MATCHED SHELTER</span>
                      <strong class="rec-name">Hope Haven Shelter</strong>
                      <span class="rec-dist"><strong>1.4 km</strong> away · Pickup van en route (Andheri West)</span>
                    </div>
                  </div>

                  <button class="btn btn-outline btn-block" id="previewLaunchBtn">
                    <span>Open Quick Donate Flow &rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3-Step Simple Explanation with High-Impact Visuals -->
        <section class="steps-section">
          <div class="container">
            <h2 class="section-headline">How MealBridge Works</h2>
            <p class="section-subtext">Engineered for urgent surplus. Turn a quick message into a verified shelter dispatch.</p>

            <div class="three-steps-grid">
              <!-- Step 1 -->
              <div class="step-card-clean">
                <div class="step-img-wrapper">
                  <img src="assets/images/step_describe_food.jpg" alt="Commercial kitchen preparing surplus food for donation" class="step-card-img" />
                  <div class="step-number-tag">01</div>
                </div>
                <div class="step-card-body">
                  <h3 class="step-title-clean">Describe the surplus</h3>
                  <p class="step-desc-clean">
                    Send a natural-language message mentioning portions, food type, cooking time, and pickup location.
                  </p>
                </div>
              </div>

              <!-- Step 2 -->
              <div class="step-card-clean">
                <div class="step-img-wrapper">
                  <img src="assets/images/step_ai_routing.jpg" alt="AI logistics matching routes to shelters" class="step-card-img" />
                  <div class="step-number-tag">02</div>
                </div>
                <div class="step-card-body">
                  <h3 class="step-title-clean">AI finds the right recipient</h3>
                  <p class="step-desc-clean">
                    MealBridge structures the manifest and matches the best nearby shelter with matching capacity and active pickup.
                  </p>
                </div>
              </div>

              <!-- Step 3 -->
              <div class="step-card-clean">
                <div class="step-img-wrapper">
                  <img src="assets/images/step_shelter_delivery.jpg" alt="Courier delivering food to shelter director" class="step-card-img" />
                  <div class="step-number-tag">03</div>
                </div>
                <div class="step-card-body">
                  <h3 class="step-title-clean">Track the rescue</h3>
                  <p class="step-desc-clean">
                    Follow the live timeline and coordination deadline until meals are safely handed over to shelter volunteers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Small Demo Impact Metrics Section (Clearly Labeled) -->
        <section class="demo-impact-section">
          <div class="container">
            <div class="demo-impact-card">
              <div class="demo-impact-header">
                <div>
                  <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-charcoal-dark); margin-bottom: 2px;">
                    Network Impact
                  </h3>
                  <p style="font-size: 0.88rem; color: var(--text-muted);">
                    Simulated activity across Mumbai Andheri-Versova food rescue corridor
                  </p>
                </div>
                <span class="demo-data-badge">DEMO NETWORK METRICS</span>
              </div>

              <div class="demo-stats-grid">
                <div class="stat-item-clean">
                  <div class="stat-val-giant text-emerald">2,840</div>
                  <div class="stat-title-clean">Meals Rescued</div>
                  <div class="stat-sub-clean">Diverted from waste to nutritious meals</div>
                </div>

                <div class="stat-item-clean">
                  <div class="stat-val-giant text-emerald">11 min</div>
                  <div class="stat-title-clean">Average Matching Time</div>
                  <div class="stat-sub-clean">From donor message to shelter dispatch</div>
                </div>

                <div class="stat-item-clean">
                  <div class="stat-val-giant">17</div>
                  <div class="stat-title-clean">Active Donations</div>
                  <div class="stat-sub-clean">Coordinating on the urban dispatch grid</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Trust & Food Safety Concise Statement -->
        <section class="container">
          <div class="safety-statement-card">
            <div class="safety-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <strong>Food Safety Protocol:</strong> MealBridge coordinates food donations. Food-safety decisions remain the responsibility of donors and receiving organizations and should follow applicable local guidance.
            </div>
          </div>
        </section>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const donateBtn = document.getElementById("heroDonateBtn");
    const previewBtn = document.getElementById("previewLaunchBtn");
    const shelterBtn = document.getElementById("heroShelterBtn");

    if (donateBtn) {
      donateBtn.addEventListener("click", () => {
        if (window.appState) window.appState.setView("quick-donate", "donor");
      });
    }

    if (previewBtn) {
      previewBtn.addEventListener("click", () => {
        if (window.appState) window.appState.setView("quick-donate", "donor");
      });
    }

    if (shelterBtn) {
      shelterBtn.addEventListener("click", () => {
        if (window.appState) window.appState.setView("find-donations", "ngo");
      });
    }
  }

  destroy() {}
}

window.LandingView = LandingView;
