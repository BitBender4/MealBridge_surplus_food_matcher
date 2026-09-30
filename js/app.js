/**
 * MealBridge - Main Application Orchestrator & Router
 * Manages routing, persona switching, global toast notifications, and component lifecycle
 */

class MealBridgeApp {
  constructor() {
    this.currentViewInstance = null;
    this.init();
  }

  init() {
    // Bind state events
    window.appState.on("view:changed", ({ view, role }) => this.onRouteChanged(view, role));
    window.appState.on("donations:updated", () => this.refreshCurrentView());

    // Bind navigation buttons
    this.bindGlobalNav();

    // Setup Toast container
    this.setupToastContainer();

    // Initial route (Start on Home as requested for the competition showcase)
    const initialView = window.appState.currentView || "home";
    this.onRouteChanged(initialView, window.appState.currentRole);
  }

  bindGlobalNav() {
    // Brand logo -> Home
    const brand = document.getElementById("brandLogo");
    if (brand) {
      brand.addEventListener("click", (e) => {
        e.preventDefault();
        window.appState.setView("home");
      });
    }

    // Nav links
    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetView = link.getAttribute("data-view");
        const targetRole = link.getAttribute("data-role");
        if (targetView) {
          window.appState.setView(targetView, targetRole);
        }
      });
    });

    // Quick AI Donate button in navbar
    const navDonateBtn = document.getElementById("navDonateBtn");
    if (navDonateBtn) {
      navDonateBtn.addEventListener("click", () => {
        window.appState.setView("quick-donate", "donor");
      });
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const navLinksGroup = document.getElementById("navLinksGroup");
    if (mobileMenuBtn && navLinksGroup) {
      mobileMenuBtn.addEventListener("click", () => {
        navLinksGroup.classList.toggle("mobile-open");
      });
    }
  }

  onRouteChanged(view, role) {
    // Cleanup existing view
    if (this.currentViewInstance && typeof this.currentViewInstance.destroy === "function") {
      this.currentViewInstance.destroy();
    }

    // Normalize home/landing
    const activeRouteKey = (view === "landing" || view === "home") ? "home" : view;

    // Update active nav link styling
    document.querySelectorAll(".nav-link").forEach(link => {
      const linkView = link.getAttribute("data-view");
      link.classList.toggle("active", linkView === activeRouteKey);
    });

    // Close mobile menu if open
    const navLinksGroup = document.getElementById("navLinksGroup");
    if (navLinksGroup) navLinksGroup.classList.remove("mobile-open");

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Mount corresponding view component
    const appMain = "appViewContainer";
    switch (view) {
      case "home":
      case "landing":
        this.currentViewInstance = new LandingView(appMain);
        this.currentViewInstance.render();
        break;

      case "quick-donate":
        this.currentViewInstance = new QuickDonateController(appMain);
        this.currentViewInstance.render();
        break;

      case "find-donations":
        this.currentViewInstance = new NgoDashboardView(appMain);
        this.currentViewInstance.render();
        break;

      case "tracking":
        if (window._mealbridgeQuickDonateSession && ["matched", "tracking", "completed"].includes(window._mealbridgeQuickDonateSession.state)) {
          this.currentViewInstance = new QuickDonateController(appMain);
          this.currentViewInstance.render();
          break;
        }
        this.currentViewInstance = new LiveTrackingView(appMain);
        this.currentViewInstance.render();
        break;

      case "impact":
        this.renderImpactView(appMain);
        break;

      case "donor":
        this.currentViewInstance = new DonorDashboardView(appMain);
        this.currentViewInstance.render();
        break;

      case "ngo":
        this.currentViewInstance = new NgoDashboardView(appMain);
        this.currentViewInstance.render();
        break;

      case "admin":
        this.currentViewInstance = new AdminOperationsView(appMain);
        this.currentViewInstance.render();
        break;

      default:
        this.currentViewInstance = new LandingView(appMain);
        this.currentViewInstance.render();
        break;
    }
  }

  renderImpactView(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="container" style="padding: 40px 24px 80px; max-width: 900px;">
        <div style="text-align: center; margin-bottom: 36px;">
          <div class="hero-pill">
            <span class="status-pulse-dot"></span>
            <span>Verified Impact Registry</span>
          </div>
          <h1 style="font-size: clamp(2rem, 4vw, 2.7rem); font-weight: 800; color: var(--text-charcoal-dark); margin-bottom: 8px;">
            Food Rescue Network Impact
          </h1>
          <p style="font-size: 1.05rem; color: var(--text-muted); max-width: 580px; margin: 0 auto;">
            Real-time telemetry measuring surplus meals rescued, carbon averted, and partner shelters supported.
          </p>
        </div>

        <div style="background-color: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: var(--radius-xl); padding: 36px; box-shadow: var(--shadow-md); margin-bottom: 28px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 18px; margin-bottom: 24px; flex-wrap: wrap; gap: 10px;">
            <strong style="font-size: 1.15rem; color: var(--text-charcoal-dark);">Simulated Urban Corridor Summary</strong>
            <span class="demo-data-badge">DEMO NETWORK METRICS</span>
          </div>

          <div class="demo-stats-grid" style="margin-bottom: 30px;">
            <div class="stat-item-clean">
              <div class="stat-val-giant text-emerald">2,840</div>
              <div class="stat-title-clean">Nutritious Meals Rescued</div>
              <div class="stat-sub-clean">Delivered to youth homes & elder shelters</div>
            </div>
            <div class="stat-item-clean">
              <div class="stat-val-giant text-emerald">11 min</div>
              <div class="stat-title-clean">Average Match Speed</div>
              <div class="stat-sub-clean">AI message to shelter dispatch</div>
            </div>
            <div class="stat-item-clean">
              <div class="stat-val-giant">17</div>
              <div class="stat-title-clean">Active Donations</div>
              <div class="stat-sub-clean">Live on city transit radar</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; background-color: var(--bg-subtle); border-radius: var(--radius-lg); padding: 20px;">
            <div>
              <span style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Methane & Carbon Prevented</span>
              <div style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: #15803D;">18.4 Metric Tons CO₂e</div>
            </div>
            <div>
              <span style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Verified Recipient Shelters</span>
              <div style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--text-charcoal-dark);">94 Active Shelters</div>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: center; gap: 14px;">
          <button class="btn btn-primary btn-lg" id="btnImpactDonateNow">
            <span>+ Donate Surplus Food Now</span>
          </button>
          <button class="btn btn-secondary btn-lg" id="btnImpactBackHome">
            <span>Return to Home</span>
          </button>
        </div>
      </div>
    `;

    const dBtn = document.getElementById("btnImpactDonateNow");
    const hBtn = document.getElementById("btnImpactBackHome");
    if (dBtn) dBtn.addEventListener("click", () => window.appState.setView("quick-donate", "donor"));
    if (hBtn) hBtn.addEventListener("click", () => window.appState.setView("home"));
  }

  refreshCurrentView() {
    if (this.currentViewInstance && typeof this.currentViewInstance.render === "function") {
      this.currentViewInstance.render();
    }
  }

  setupToastContainer() {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    window.appToast = (message, type = "info") => {
      const toast = document.createElement("div");
      toast.className = `toast toast-${type} animate-slide-in`;

      let icon = "✓";
      if (type === "error" || type === "danger") icon = "✕";
      else if (type === "warning") icon = "⚠";
      else if (type === "info") icon = "ℹ";

      toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.add("toast-fade-out");
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    };
  }
}

// Bootstrap once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new MealBridgeApp();
});
