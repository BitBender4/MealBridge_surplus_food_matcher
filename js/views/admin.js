/**
 * MealBridge Operations & Admin Dispatch View
 * Live tactical map radar, multi-parameter filtering, and real-time operational event audit logs
 */

class AdminOperationsView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.radarMap = null;
    this.activeFilters = {
      urgent: false,
      veg: false,
      nonVeg: false,
      within5km: false,
      pickupRequired: false,
      expiringSoon: false
    };
  }

  render() {
    if (!this.container) return;

    const donations = window.appState.getDonations();
    const shelters = SEED_DATA.shelters;
    const now = Date.now();

    const urgentCount = donations.filter(d => {
      const remainingMs = d.expiryTimestamp - now;
      return remainingMs > 0 && remainingMs < (90 * 60 * 1000) && d.status !== "delivered";
    }).length;

    this.container.innerHTML = `
      <div class="admin-page">
        <!-- Operations Top Header -->
        <div class="admin-header-bar">
          <div>
            <div class="admin-title-row">
              <span class="live-beacon"></span>
              <h1 class="admin-heading">City Operations & Dispatch Radar</h1>
              <span class="pill-badge pill-badge-emerald">Mumbai Andheri Hub</span>
            </div>
            <p class="admin-subheading">
              Real-time monitoring of food surplus, thermal safety windows, and emergency shelter dispatch.
            </p>
          </div>

          <div class="admin-actions">
            <button class="btn btn-outline btn-sm" id="btnRefreshRadar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              <span>Refresh Telemetry</span>
            </button>
            <button class="btn btn-primary btn-sm" id="btnCreateDonationOps">
              + Ingest New Surplus
            </button>
          </div>
        </div>

        <!-- Telemetry Stats Strip -->
        <div class="admin-stats-strip">
          <div class="stat-box">
            <span class="stat-num text-emerald">${donations.filter(d => d.status !== 'delivered').length}</span>
            <span class="stat-tag">Active Surpluses</span>
          </div>
          <div class="stat-box">
            <span class="stat-num text-blue">${shelters.length}</span>
            <span class="stat-tag">Shelters Active</span>
          </div>
          <div class="stat-box">
            <span class="stat-num ${urgentCount > 0 ? 'text-amber' : 'text-emerald'}">${urgentCount}</span>
            <span class="stat-tag">Urgent (< 90m)</span>
          </div>
          <div class="stat-box">
            <span class="stat-num text-emerald">8.4m</span>
            <span class="stat-tag">Avg Match Speed</span>
          </div>
          <div class="stat-box">
            <span class="stat-num text-charcoal">99.8%</span>
            <span class="stat-tag">Thermal Pass Rate</span>
          </div>
        </div>

        <!-- Interactive Map & Filter Control Bar -->
        <div class="radar-card">
          <div class="radar-control-bar">
            <div class="filter-group-label">FILTER RADAR:</div>
            <div class="filter-chips">
              <button class="filter-chip ${this.activeFilters.urgent ? 'active' : ''}" data-filter="urgent">
                ⚡ Urgent (< 90m)
              </button>
              <button class="filter-chip ${this.activeFilters.veg ? 'active' : ''}" data-filter="veg">
                🥬 Vegetarian
              </button>
              <button class="filter-chip ${this.activeFilters.nonVeg ? 'active' : ''}" data-filter="nonVeg">
                🍗 Non-Vegetarian
              </button>
              <button class="filter-chip ${this.activeFilters.within5km ? 'active' : ''}" data-filter="within5km">
                📍 Within 5 km
              </button>
              <button class="filter-chip ${this.activeFilters.pickupRequired ? 'active' : ''}" data-filter="pickupRequired">
                🚚 Pickup Required
              </button>
              <button class="filter-chip ${this.activeFilters.expiringSoon ? 'active' : ''}" data-filter="expiringSoon">
                ⏳ Expiring Soon (< 2h)
              </button>
            </div>
            <button class="btn btn-ghost btn-xs text-muted" id="btnResetFilters">Clear Filters</button>
          </div>

          <!-- Radar Map Container -->
          <div class="radar-canvas-box" id="adminRadarMapCanvas"></div>

          <!-- Map Legend -->
          <div class="radar-legend">
            <div class="legend-item"><span class="legend-dot dot-green"></span> Food Donor (Active)</div>
            <div class="legend-item"><span class="legend-dot dot-amber"></span> Urgent Expiry (< 2h)</div>
            <div class="legend-item"><span class="legend-dot dot-red"></span> Critical Expiry (< 1h)</div>
            <div class="legend-item"><span class="legend-dot dot-blue"></span> Partner Shelter / NGO</div>
            <div class="legend-item"><span class="legend-line"></span> Active Insulated Transit Route</div>
          </div>
        </div>

        <!-- Lower Section: Real-Time Event Audit Log & Master Manifests -->
        <div class="admin-grid-lower">
          <!-- Real-Time Activity Feed -->
          <div class="admin-card">
            <div class="card-header-clean">
              <h3 class="card-title">Real-Time Operational Audit Feed</h3>
              <span class="live-beacon"></span>
            </div>

            <div class="audit-feed-list">
              <div class="audit-item">
                <div class="audit-time">Just now</div>
                <div class="audit-badge badge-emerald">TELEMETRY</div>
                <div class="audit-text">Driver Ramesh van temp verified at <strong>63.8°C</strong> en route to Hope Haven.</div>
              </div>
              <div class="audit-item">
                <div class="audit-time">8 mins ago</div>
                <div class="audit-badge badge-blue">MATCHED</div>
                <div class="audit-text">Orchid Banquet surplus (120 meals) matched with <strong>Hope Haven Shelter</strong> (1.8 km).</div>
              </div>
              <div class="audit-item">
                <div class="audit-time">14 mins ago</div>
                <div class="audit-badge badge-purple">AI PARSER</div>
                <div class="audit-text">Natural language donation parsed with <strong>96% confidence</strong> from WhatsApp feed.</div>
              </div>
              <div class="audit-item">
                <div class="audit-time">32 mins ago</div>
                <div class="audit-badge badge-amber">URGENT ALERT</div>
                <div class="audit-text">Grand Horizon Hotel (65 meals) safe consumption window below 60 minutes. Priority broadcast issued.</div>
              </div>
              <div class="audit-item">
                <div class="audit-time">1h 15m ago</div>
                <div class="audit-badge badge-emerald">DELIVERED</div>
                <div class="audit-text">St. Jude Hostel breakfast (95 meals) verified delivered at Asha Deep Soup Kitchen. 80G receipt issued.</div>
              </div>
            </div>
          </div>

          <!-- Master Live Manifests -->
          <div class="admin-card">
            <div class="card-header-clean">
              <h3 class="card-title">All City Surplus Feasts</h3>
              <span class="text-sm text-muted">${donations.length} Manifests In Database</span>
            </div>

            <div class="manifests-compact-list">
              ${donations.map(d => `
                <div class="manifest-compact-row" data-id="${d.id}">
                  <div class="m-left">
                    <span class="manifest-pill">${d.id}</span>
                    <strong class="m-title">${d.title}</strong>
                    <div class="m-sub">${d.donorName} &rarr; ${d.matchedNgoName || "Evaluating..."}</div>
                  </div>
                  <div class="m-right">
                    <span class="badge-meals">${d.estimatedMeals} Meals</span>
                    <span class="status-pill status-${d.status}">${d.status.toUpperCase()}</span>
                    <button class="btn btn-outline btn-xs btn-open-manifest" data-id="${d.id}">Track</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.mountMap();
  }

  mountMap() {
    this.radarMap = new MealBridgeMap("adminRadarMapCanvas", {
      mode: "operations",
      interactive: true
    });
    this.radarMap.setFilters(this.activeFilters);
  }

  bindEvents() {
    const refreshBtn = document.getElementById("btnRefreshRadar");
    if (refreshBtn) refreshBtn.addEventListener("click", () => {
      this.render();
      window.appToast("City radar telemetry updated!", "info");
    });

    const createBtn = document.getElementById("btnCreateDonationOps");
    if (createBtn) createBtn.addEventListener("click", () => window.appState.setView("wizard", "donor"));

    // Filter chip buttons
    this.container.querySelectorAll(".filter-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const filterKey = chip.getAttribute("data-filter");
        this.activeFilters[filterKey] = !this.activeFilters[filterKey];
        chip.classList.toggle("active", this.activeFilters[filterKey]);
        if (this.radarMap) {
          this.radarMap.setFilters(this.activeFilters);
        }
      });
    });

    // Reset filters
    const resetBtn = document.getElementById("btnResetFilters");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.activeFilters = { urgent: false, veg: false, nonVeg: false, within5km: false, pickupRequired: false, expiringSoon: false };
        this.container.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
        if (this.radarMap) {
          this.radarMap.setFilters(this.activeFilters);
        }
      });
    }

    // Manifest click to track
    this.container.querySelectorAll(".btn-open-manifest").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        window.appState.setActiveTrackingId(id);
        window.appState.setView("tracking");
      });
    });
  }

  destroy() {
    this.radarMap = null;
  }
}

window.AdminOperationsView = AdminOperationsView;
