/**
 * MealBridge NGO / Shelter Dashboard View
 * Focused on community kitchens, youth shelters, and night shelters
 * Shows Available nearby donations, Accepted donations, Incoming pickups, and Meals received
 */

class NgoDashboardView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.timerInterval = null;
  }

  render() {
    if (!this.container) return;

    const donations = window.appState.getDonations();
    const ngoProfile = SEED_DATA.shelters[0]; // Hope Haven Children's Home

    // Filter into categories
    const availableNearby = donations.filter(d => ["created", "verified", "matched", "available"].includes(d.status) && d.matchedNgoId !== ngoProfile.id);
    const acceptedByThisNgo = donations.filter(d => d.matchedNgoId === ngoProfile.id && ["accepted", "pickup_assigned", "picked_up"].includes(d.status));
    const deliveredToThisNgo = donations.filter(d => d.matchedNgoId === ngoProfile.id && d.status === "delivered");

    // Urgent donation check
    const now = Date.now();
    const urgentNear = availableNearby.find(d => {
      const remainingMs = d.expiryTimestamp - now;
      return remainingMs > 0 && remainingMs < (60 * 60 * 1000);
    });

    const mealsReceivedToday = deliveredToThisNgo.reduce((acc, d) => acc + (d.estimatedMeals || 0), 0) + 120;

    this.container.innerHTML = `
      <div class="dashboard-page ngo-dashboard">
        <!-- Shelter Header Bar -->
        <div class="dashboard-header-bar">
          <div class="donor-profile-info">
            <div class="ngo-badge-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <div class="donor-title-row">
                <h1 class="dashboard-page-title">${ngoProfile.name}</h1>
                <span class="pill-badge pill-badge-blue">80G Certified Shelter</span>
              </div>
              <p class="dashboard-page-sub">
                ${ngoProfile.address} · Capacity: ${ngoProfile.capacity} meals · Active Shelter Need: ${ngoProfile.mealsRequested} children dinner
              </p>
            </div>
          </div>

          <div class="dashboard-actions-header">
            <div class="shelter-capacity-pill">
              <span class="cap-label">Tonight's Demand Status:</span>
              <strong class="text-emerald">${ngoProfile.mealsRequested} Dinners Needed</strong>
            </div>
          </div>
        </div>

        <!-- High-Urgency Expiry Banner if applicable -->
        ${urgentNear ? `
          <div class="urgent-alert-banner">
            <div class="alert-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>
              </svg>
            </div>
            <div class="alert-content">
              <strong>URGENT SURPLUS ALERT (< 60m remaining):</strong>
              <span>${urgentNear.donorName} has ${urgentNear.estimatedMeals} meals ready for immediate pickup. Can your shelter absorb this?</span>
            </div>
            <button class="btn btn-danger btn-sm btn-accept-urgent" data-id="${urgentNear.id}">
              Claim & Dispatch Van Now
            </button>
          </div>
        ` : ''}

        <!-- Metric Stat Cards -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-title">AVAILABLE NEARBY</span>
              <span class="metric-icon-wrap bg-emerald-light">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </span>
            </div>
            <div class="metric-num text-emerald">${availableNearby.length}</div>
            <div class="metric-note">Within 5 km radius of Andheri West / East</div>
          </div>

          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-title">ACCEPTED & EN ROUTE</span>
              <span class="metric-icon-wrap bg-blue-light">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2">
                  <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </span>
            </div>
            <div class="metric-num text-blue">${acceptedByThisNgo.length}</div>
            <div class="metric-note">Incoming deliveries scheduled tonight</div>
          </div>

          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-title">INCOMING MEALS</span>
              <span class="metric-icon-wrap bg-amber-light">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/>
                </svg>
              </span>
            </div>
            <div class="metric-num text-amber">
              ${acceptedByThisNgo.reduce((acc, d) => acc + (d.estimatedMeals || 0), 0)}
            </div>
            <div class="metric-note">Sufficient for 100% of children dinner</div>
          </div>

          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-title">MEALS RECEIVED TODAY</span>
              <span class="metric-icon-wrap bg-purple-light">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </span>
            </div>
            <div class="metric-num">${mealsReceivedToday}</div>
            <div class="metric-note">Zero food expense today for shelter</div>
          </div>
        </div>

        <!-- Section: Incoming Deliveries / Active Pickups -->
        ${acceptedByThisNgo.length > 0 ? `
          <div class="dashboard-section">
            <div class="section-title-row">
              <h2 class="dashboard-section-heading">Active Incoming Pickups & Deliveries</h2>
              <span class="badge-tag badge-ready"><span class="status-pulse-dot"></span> Live Telemetry Connected</span>
            </div>

            <div class="incoming-pickups-list">
              ${acceptedByThisNgo.map(d => this.renderIncomingPickupCard(d)).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Section: Available Nearby Surplus Feasts -->
        <div class="dashboard-section">
          <div class="section-title-row">
            <div>
              <h2 class="dashboard-section-heading">Available Nearby Surplus Feasts</h2>
              <p class="section-subtitle">Real-time surplus ready for pickup. Review dietary specs and claim for immediate dispatch.</p>
            </div>
          </div>

          ${availableNearby.length === 0 ? `
            <div class="empty-state-box">
              <div class="empty-icon">✅</div>
              <h3>All nearby donations have been claimed!</h3>
              <p>We will alert your dispatch team as soon as a donor posts new surplus nearby.</p>
            </div>
          ` : `
            <div class="ngo-feed-grid">
              ${availableNearby.map(d => this.renderAvailableFeedCard(d)).join('')}
            </div>
          `}
        </div>

        <!-- Section: Shelter Rescues History -->
        <div class="dashboard-section">
          <h2 class="dashboard-section-heading">Shelter Reception Log</h2>
          <div class="history-table-card">
            <table class="history-table">
              <thead>
                <tr>
                  <th>MANIFEST ID</th>
                  <th>DONOR VENUE</th>
                  <th>PORTIONS</th>
                  <th>DIET</th>
                  <th>RECEIVING LOG</th>
                  <th>ARRIVAL TEMP</th>
                  <th>CHAIN-OF-CUSTODY</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="manifest-pill">MB-2026-642</span></td>
                  <td><strong>Weekend Corporate Gala Buffet</strong></td>
                  <td><span class="badge-meals">140 Meals</span></td>
                  <td><span class="badge-tag badge-veg">Vegetarian</span></td>
                  <td>Served at 11:15 PM</td>
                  <td><span class="badge-tag badge-ready">63.1°C Verified</span></td>
                  <td><span class="text-emerald">✓ Verified by Sis. Agnes</span></td>
                </tr>
                <tr>
                  <td><span class="manifest-pill">MB-2026-519</span></td>
                  <td><strong>The Leela Palace Kitchen</strong></td>
                  <td><span class="badge-meals">85 Meals</span></td>
                  <td><span class="badge-tag badge-veg">Vegetarian</span></td>
                  <td>Served at 2:30 PM</td>
                  <td><span class="badge-tag badge-ready">64.0°C Verified</span></td>
                  <td><span class="text-emerald">✓ Verified by Sis. Agnes</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.startTimers();
  }

  renderIncomingPickupCard(donation) {
    const driver = donation.assignedDriver || {
      name: "Ramesh Kumar",
      phone: "+91 98201 55670",
      vehicle: "Shelter Van (MH-02-MB-4412)",
      etaMinutes: 12,
      currentTempLog: "63.8°C"
    };

    return `
      <div class="incoming-card">
        <div class="incoming-header">
          <div class="incoming-status-pill">
            <span class="status-pulse-dot"></span>
            <span>DRIVER EN ROUTE · ETA ${driver.etaMinutes} MINS</span>
          </div>
          <div class="expiry-timer-box expiry-urgent">
            <span>Safe Expiry: ${donation.suggestedExpiry || "In 2 hours"}</span>
          </div>
        </div>

        <div class="incoming-grid">
          <div class="incoming-main">
            <h3>${donation.title}</h3>
            <p class="donor-line">
              <strong>Pickup From:</strong> ${donation.donorName} (${donation.pickupLocation || donation.donorAddress})
            </p>
            <div class="manifest-tags">
              <span class="badge-tag badge-meals">${donation.estimatedMeals} Meals</span>
              <span class="badge-tag badge-veg">${donation.dietary}</span>
              <span class="badge-tag badge-ready">${donation.packagingStatus}</span>
            </div>
          </div>

          <div class="incoming-driver-box">
            <div class="driver-photo-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="driver-details">
              <div class="driver-name">${driver.name}</div>
              <div class="driver-vehicle">${driver.vehicle}</div>
              <div class="driver-phone">${driver.phone}</div>
              <div class="driver-temp"><strong>Temp Log:</strong> ${driver.currentTempLog}</div>
            </div>
          </div>
        </div>

        <div class="incoming-actions">
          <button class="btn btn-primary btn-track-incoming" data-id="${donation.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Live GPS Map & Dispatch</span>
          </button>
          <button class="btn btn-outline btn-confirm-delivery" data-id="${donation.id}">
            <span>✓ Confirm Safe Arrival & Log Temp</span>
          </button>
        </div>
      </div>
    `;
  }

  renderAvailableFeedCard(donation) {
    const isVeg = (donation.dietary || "").toLowerCase().includes("veg") && !(donation.dietary || "").toLowerCase().includes("non-veg");

    return `
      <div class="feed-card">
        <div class="feed-card-top">
          <div class="feed-distance">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>1.8 km from Hope Haven</span>
          </div>
          <span class="match-badge-pill">96% Suitability Match</span>
        </div>

        <h3 class="feed-title">${donation.title}</h3>
        <p class="feed-donor-name">${donation.donorName}</p>

        <div class="feed-specs-row">
          <div class="spec-col">
            <span class="spec-k">PORTIONS</span>
            <span class="spec-v text-emerald">${donation.estimatedMeals} Meals</span>
          </div>
          <div class="spec-col">
            <span class="spec-k">DIET</span>
            <span class="spec-v">${donation.dietary}</span>
          </div>
          <div class="spec-col">
            <span class="spec-k">PREP TIME</span>
            <span class="spec-v">${donation.cookedAtTime}</span>
          </div>
        </div>

        <div class="feed-food-items">
          ${(donation.foodItems && donation.foodItems.length) ? donation.foodItems.map(item => `<span class="food-tag">${item}</span>`).join('') : `<span class="food-tag">${donation.foodType}</span>`}
        </div>

        <div class="feed-packaging">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          <span>${donation.packagingStatus}</span>
        </div>

        <div class="feed-footer">
          <div class="feed-timer-box" id="ngo-timer-${donation.id}">
            <span class="feed-countdown" data-expiry="${donation.expiryTimestamp}">Calculating...</span>
          </div>
          <button class="btn btn-primary btn-sm btn-claim-donation" data-id="${donation.id}">
            <span>Accept & Dispatch Van</span>
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Claim buttons
    this.container.querySelectorAll(".btn-claim-donation, .btn-accept-urgent").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const accepted = window.appState.acceptDonationAsNgo(id, "ngo-hope-haven");
        if (accepted) {
          window.appToast(`Accepted donation ${id}! Van dispatched to Orchid Banquet Hall.`, "success");
          window.appState.setActiveTrackingId(id);
          this.render();
        }
      });
    });

    // Track buttons
    this.container.querySelectorAll(".btn-track-incoming").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        window.appState.setActiveTrackingId(id);
        window.appState.setView("tracking");
      });
    });

    // Confirm delivery
    this.container.querySelectorAll(".btn-confirm-delivery").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        window.appState.updateDonationStatus(id, "delivered", {
          deliveredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temperatureAtDelivery: "63.2°C safe"
        });
        window.appToast(`Food safely received and temperature verified at 63.2°C! 80G receipt logged.`, "success");
        this.render();
      });
    });

    // Real-time cross-tab sync listener
    if (window.realtimeBus && !this.realtimeUnsub) {
      this.realtimeUnsub = window.realtimeBus.subscribe("*", (type) => {
        if (type === "DONATION_CREATED" || type === "DONATION_STATUS_CHANGED") {
          this.render();
        }
      });
    }
  }

  startTimers() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    const updateAll = () => {
      const countdowns = this.container.querySelectorAll(".feed-countdown");
      const now = Date.now();

      countdowns.forEach(el => {
        const expiry = parseInt(el.getAttribute("data-expiry"), 10);
        if (isNaN(expiry)) return;

        const remaining = expiry - now;
        if (remaining <= 0) {
          el.textContent = "Safe window expired";
          return;
        }

        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((remaining % (1000 * 60)) / 1000);

        el.textContent = `${hours}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s left`;
      });
    };

    updateAll();
    this.timerInterval = setInterval(updateAll, 1000);
  }

  destroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.realtimeUnsub) {
      this.realtimeUnsub();
      this.realtimeUnsub = null;
    }
  }
}

window.NgoDashboardView = NgoDashboardView;
