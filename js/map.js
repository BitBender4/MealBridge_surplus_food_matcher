/**
 * MealBridge Interactive Tactical Radar & Route Map
 * High-performance vector map rendering donors, shelters, active transit lines, and urgency pulse rings
 */

class MealBridgeMap {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = Object.assign({
      mode: "operations", // "operations" | "tracking"
      interactive: true,
      centerLat: 12.9716,
      centerLng: 77.6412,
      onNodeClick: null
    }, options);

    this.filters = {
      urgent: false,
      veg: false,
      nonVeg: false,
      within5km: false,
      pickupRequired: false,
      expiringSoon: false
    };

    this.init();
  }

  init() {
    if (!this.container) return;
    this.container.innerHTML = "";
    this.render();
  }

  setFilters(newFilters) {
    this.filters = Object.assign({}, this.filters, newFilters);
    this.render();
  }

  render() {
    if (!this.container) return;

    const donations = window.appState ? window.appState.getDonations() : SEED_DATA.initialDonations;
    const shelters = SEED_DATA.shelters;
    const donors = SEED_DATA.donors;
    const now = Date.now();

    // Filter active items based on active criteria
    const filteredDonations = donations.filter(d => {
      const remainingMs = d.expiryTimestamp - now;
      const isUrgent = remainingMs > 0 && remainingMs < (90 * 60 * 1000);
      const isExpiringSoon = remainingMs > 0 && remainingMs < (120 * 60 * 1000);
      const isVeg = (d.dietary || "").toLowerCase().includes("veg") && !(d.dietary || "").toLowerCase().includes("non-veg");
      const isNonVeg = (d.dietary || "").toLowerCase().includes("non-veg");

      if (this.filters.urgent && !isUrgent) return false;
      if (this.filters.expiringSoon && !isExpiringSoon) return false;
      if (this.filters.veg && !isVeg) return false;
      if (this.filters.nonVeg && !isNonVeg) return false;

      return true;
    });

    // Map bounds in Andheri, Mumbai coordinates
    // Min lat ~ 19.095, Max lat ~ 19.160
    // Min lng ~ 72.805, Max lng ~ 72.885
    const minLat = 19.095, maxLat = 19.160;
    const minLng = 72.805, maxLng = 72.885;

    const project = (lat, lng, width, height) => {
      const x = ((lng - minLng) / (maxLng - minLng)) * (width - 120) + 60;
      const y = height - (((lat - minLat) / (maxLat - minLat)) * (height - 120) + 60);
      return { x: Math.max(40, Math.min(width - 40, x)), y: Math.max(40, Math.min(height - 40, y)) };
    };

    const width = 850;
    const height = 480;

    let svgContent = `
      <svg viewBox="0 0 ${width} ${height}" class="radar-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Grid Pattern -->
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(229, 231, 235, 0.6)" stroke-width="1"/>
          </pattern>
          <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(156, 163, 175, 0.3)"/>
          </pattern>
          <linearGradient id="transitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#059669" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#2563EB" stop-opacity="0.8"/>
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        <!-- Tactical Background -->
        <rect width="100%" height="100%" fill="#F8FAFC"/>
        <rect width="100%" height="100%" fill="url(#grid)"/>
        <rect width="100%" height="100%" fill="url(#dots)"/>

        <!-- Andheri Arterial Road Corridors -->
        <g class="city-roads" stroke="rgba(203, 213, 225, 0.85)" stroke-width="3" stroke-linecap="round">
          <!-- Versova to Andheri East: JP Road & Andheri-Kurla Road Metro Line -->
          <path d="M 80 230 Q 280 240, 430 260 T 790 280" fill="none" stroke-width="3.5" stroke="rgba(14, 165, 233, 0.35)"/>
          <!-- New Link Road (North-South West) -->
          <path d="M 220 60 L 250 240 L 260 420" fill="none" stroke-width="3" />
          <!-- SV Road / Railway Track Axis -->
          <path d="M 380 50 L 410 250 L 420 430" fill="none" stroke-dasharray="8,4" stroke-width="2" />
          <!-- Western Express Highway (WEH North-South East) -->
          <path d="M 580 40 L 610 240 L 630 440" fill="none" stroke-width="3.5" stroke="rgba(5, 150, 105, 0.35)"/>
          <!-- MIDC Central Road / JVLR Axis -->
          <path d="M 440 120 L 780 130" fill="none" stroke-width="2.5" />
        </g>

        <!-- District Labels (Andheri, Mumbai) -->
        <text x="70" y="210" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#94A3B8">VERSOVA</text>
        <text x="210" y="110" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#94A3B8">LINK RD / LOKHANDWALA</text>
        <text x="250" y="380" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#059669">ANDHERI WEST (DISPATCH HUB)</text>
        <text x="620" y="100" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#94A3B8">NESCO / JVLR</text>
        <text x="630" y="320" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#2563EB">MIDC / ANDHERI EAST</text>
        <text x="640" y="420" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#94A3B8">AIRPORT ZONE</text>
    `;

    // Render active transit routes
    filteredDonations.forEach(d => {
      if (d.matchedNgoId && ["accepted", "pickup_assigned", "picked_up"].includes(d.status)) {
        const donor = donors.find(dn => dn.id === d.donorId) || donors[0];
        const shelter = shelters.find(s => s.id === d.matchedNgoId) || shelters[0];

        const p1 = project(donor.lat, donor.lng, width, height);
        const p2 = project(shelter.lat, shelter.lng, width, height);

        svgContent += `
          <!-- Transit Connection Line -->
          <g class="transit-line-group">
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" 
                  stroke="url(#transitGrad)" stroke-width="3" stroke-dasharray="6,4" class="anim-dash"/>
            <!-- Animated Driver Vehicle Pin -->
            <circle cx="${(p1.x + p2.x) / 2}" cy="${(p1.y + p2.y) / 2}" r="7" fill="#059669" filter="url(#glow)"/>
            <circle cx="${(p1.x + p2.x) / 2}" cy="${(p1.y + p2.y) / 2}" r="3" fill="#FFFFFF"/>
            <text x="${(p1.x + p2.x) / 2 + 10}" y="${(p1.y + p2.y) / 2 - 8}" 
                  font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" fill="#059669">
              VAN IN TRANSIT (ETA 12m)
            </text>
          </g>
        `;
      }
    });

    // Render Shelter / NGO Nodes (Blue / Teal)
    shelters.forEach(s => {
      const pos = project(s.lat, s.lng, width, height);
      svgContent += `
        <g class="map-node ngo-node" data-id="${s.id}" transform="translate(${pos.x}, ${pos.y})" style="cursor: pointer;">
          <circle cx="0" cy="0" r="14" fill="#EFF6FF" stroke="#3B82F6" stroke-width="2"/>
          <circle cx="0" cy="0" r="6" fill="#2563EB"/>
          <text x="0" y="24" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" fill="#1E293B">
            ${s.name.split(" ")[0]} ${s.name.split(" ")[1] || ""}
          </text>
          <text x="0" y="34" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="500" fill="#64748B">
            Cap: ${s.capacity} meals
          </text>
        </g>
      `;
    });

    // Render Donor & Active Donation Nodes (Green / Amber / Red)
    filteredDonations.forEach(d => {
      const donor = donors.find(dn => dn.id === d.donorId) || donors[0];
      const pos = project(donor.lat, donor.lng, width, height);
      const remainingMs = d.expiryTimestamp - now;
      const isCriticalUrgent = remainingMs > 0 && remainingMs < (60 * 60 * 1000);
      const isUrgent = remainingMs > 0 && remainingMs < (120 * 60 * 1000);

      let pinColor = "#059669"; // Normal green
      let ringColor = "rgba(16, 185, 129, 0.4)";
      if (isCriticalUrgent) {
        pinColor = "#DC2626"; // Critical red
        ringColor = "rgba(220, 38, 38, 0.5)";
      } else if (isUrgent) {
        pinColor = "#D97706"; // Urgent amber
        ringColor = "rgba(217, 119, 6, 0.5)";
      }

      svgContent += `
        <g class="map-node donation-node" data-id="${d.id}" transform="translate(${pos.x}, ${pos.y})" style="cursor: pointer;">
          <!-- Pulse Ring for Urgent Donations -->
          ${isUrgent || isCriticalUrgent ? `
            <circle cx="0" cy="0" r="22" fill="none" stroke="${ringColor}" stroke-width="2" class="anim-pulse-ring"/>
          ` : ''}
          <circle cx="0" cy="0" r="16" fill="#FFFFFF" stroke="${pinColor}" stroke-width="3" filter="url(#glow)"/>
          <circle cx="0" cy="0" r="7" fill="${pinColor}"/>
          <!-- Meals Badge -->
          <rect x="-24" y="-32" width="48" height="18" rx="9" fill="#18181B"/>
          <text x="0" y="-20" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="9.5" font-weight="700" fill="#FFFFFF">
            ${d.estimatedMeals} MEALS
          </text>
          <!-- Donor Label -->
          <text x="0" y="24" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="700" fill="#09090B">
            ${donor.name.split(" ")[0]}
          </text>
          <text x="0" y="35" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="600" fill="${pinColor}">
            ${d.dietary} · ${d.status.toUpperCase()}
          </text>
        </g>
      `;
    });

    svgContent += `</svg>`;
    this.container.innerHTML = svgContent;

    // Attach click listener
    this.container.querySelectorAll(".donation-node").forEach(el => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-id");
        if (id && window.appState) {
          window.appState.setActiveTrackingId(id);
          window.appState.setView("tracking");
        }
      });
    });

    this.container.querySelectorAll(".ngo-node").forEach(el => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-id");
        if (id && window.appState) {
          window.appState.setView("ngo");
        }
      });
    });
  }
}

window.MealBridgeMap = MealBridgeMap;
