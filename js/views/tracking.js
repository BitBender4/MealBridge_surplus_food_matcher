/**
 * MealBridge Live Donation Tracking View
 * Displays 7-stage operational timeline, prominent countdown, real-time GPS telemetry,
 * live fluctuating Bluetooth probe sensor, and autonomous pitch demo simulation
 */

class LiveTrackingView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.timerInterval = null;
    this.telemetryInterval = null;
    this.simInterval = null;
    this.isAutoSimulating = false;
    this.currentT = 0.38;
    this.routeProgress = 0.38;
    this.realtimeUnsub = null;
  }

  getRoutePos(t) {
    const clamped = Math.max(0, Math.min(1, t));
    const u = 1 - clamped;
    const x = u * u * 60 + 2 * u * clamped * 180 + clamped * clamped * 390;
    const y = u * u * 140 + 2 * u * clamped * 50 + clamped * clamped * 80;
    const dx = 2 * u * (180 - 60) + 2 * clamped * (390 - 180);
    const dy = 2 * u * (50 - 140) + 2 * clamped * (80 - 50);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return { x, y, angle };
  }

  render() {
    if (!this.container) return;

    const donation = window.appState.getActiveTrackingDonation() || SEED_DATA.initialDonations[0];
    const steps = [
      { key: "created", title: "Donation Created", desc: "Donor submitted food manifest", icon: "file-plus" },
      { key: "verified", title: "AI Details Confirmed", desc: "Portions, packaging & location confirmed", icon: "shield-check" },
      { key: "matched", title: "Recipient Matched", desc: "Best capacity shelter identified", icon: "user-check" },
      { key: "accepted", title: "Accepted by Shelter", desc: "Shelter confirmed reception team", icon: "check-circle" },
      { key: "pickup_assigned", title: "Pickup Assigned", desc: "Insulated van & driver en route", icon: "truck" },
      { key: "picked_up", title: "Food Picked Up", desc: "Loading bay temp logged: 63.8°C", icon: "package" },
      { key: "delivered", title: "Safely Delivered", desc: "Community dinner served", icon: "heart" }
    ];

    const currentStepIdx = donation.statusStepIndex !== undefined ? donation.statusStepIndex : 4;
    const driver = donation.assignedDriver || {
      name: "Ramesh Kumar",
      phone: "+91 98201 55670",
      vehicle: "Insulated Van (MH-02-MB-4412)",
      etaMinutes: 12,
      currentTempLog: "63.8°C (Safe Zone)"
    };

    // Calculate baseline t for this stage
    const baseTMap = [0.04, 0.08, 0.12, 0.22, 0.42, 0.74, 1.0];
    this.currentT = baseTMap[Math.min(baseTMap.length - 1, currentStepIdx)];
    const pos = this.getRoutePos(this.currentT);
    const distRemaining = Math.max(0, (1 - this.currentT) * 1.8).toFixed(1);
    const liveEta = currentStepIdx >= 6 ? "Arrived" : (currentStepIdx >= 5 ? "6 Minutes" : `${Math.max(2, Math.round((1 - this.currentT) * 16))} Minutes`);

    this.container.innerHTML = `
      <div class="tracking-page">
        <!-- Top Navigation Bar -->
        <div class="tracking-top-bar">
          <div class="tracking-title-group">
            <button class="btn btn-ghost btn-sm" id="trackingBackBtn">
              &larr; Return to Dashboard
            </button>
            <div class="tracking-id-wrap">
              <span class="manifest-pill">${donation.id}</span>
              <h1 class="tracking-heading">${donation.title}</h1>
            </div>
          </div>

          <!-- Interactive Pitch / Demo Stage Controls -->
          <div class="demo-controls-banner">
            <span class="demo-badge">REAL-TIME SIMULATION:</span>
            <button class="btn btn-primary btn-sm ${this.isAutoSimulating ? 'btn-active-sim' : ''}" id="btnToggleAutoSim" title="Start automatic real-time delivery progression">
              <span>${this.isAutoSimulating ? '⏸ Pause Auto-Simulation' : '⚡ Auto-Simulate Rescue'}</span>
            </button>
            <button class="btn btn-secondary btn-sm" id="btnDemoAdvanceStep" title="Advance to the next operational milestone">
              <span>Next Milestone (${steps[Math.min(steps.length - 1, currentStepIdx + 1)].title}) &rarr;</span>
            </button>
            <button class="btn btn-ghost btn-sm text-muted" id="btnDemoReset">Reset</button>
          </div>
        </div>

        <!-- Prominent Urgency Countdown & Telemetry Bar -->
        <div class="tracking-telemetry-hero">
          <div class="hero-countdown-block">
            <div class="countdown-eyebrow">
              <span class="live-beacon"></span>
              <span>COORDINATION DEADLINE REMAINING</span>
              <span class="realtime-live-tag">● LIVE SYNC</span>
            </div>
            <div class="countdown-large-display" id="trackingCountdown">
              <span class="time-digit" id="cdHours">02</span><span class="time-sep">:</span>
              <span class="time-digit" id="cdMins">18</span><span class="time-sep">:</span>
              <span class="time-digit text-emerald" id="cdSecs">45</span>
            </div>
            <div class="countdown-sub">
              Coordination deadline · Food-safety decisions follow donor and shelter protocols
            </div>
          </div>

          <div class="hero-status-summary">
            <div class="summary-stat">
              <span class="s-label">CURRENT STATUS</span>
              <span class="s-val text-emerald font-bold" id="liveHeroStatus">${steps[currentStepIdx].title}</span>
            </div>
            <div class="summary-stat">
              <span class="s-label">QUANTITY</span>
              <span class="s-val">${donation.estimatedMeals} Meals (${donation.dietary})</span>
            </div>
            <div class="summary-stat">
              <span class="s-label">PROBE TEMP</span>
              <span class="s-val text-emerald" id="liveHeroTemp">${driver.currentTempLog}</span>
            </div>
            <div class="summary-stat">
              <span class="s-label">DISPATCH ETA</span>
              <span class="s-val text-blue" id="liveHeroEta">${liveEta}</span>
            </div>
          </div>
        </div>

        <!-- Two Column Main Layout: Timeline & Route/Driver -->
        <div class="tracking-content-grid">
          <!-- Left: 7-Stage Chronological Timeline -->
          <div class="tracking-timeline-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 14px;">
              <h3 class="card-subtitle" style="margin-bottom:0;">Chain-of-Custody Timeline</h3>
              <span class="realtime-status-pill">
                <span class="status-pulse-dot"></span>
                <span>Active Tracking Stream</span>
              </span>
            </div>

            <div class="timeline-stepper-vertical">
              ${steps.map((st, idx) => {
                let stateClass = "future";
                if (idx < currentStepIdx) stateClass = "completed";
                else if (idx === currentStepIdx) stateClass = "active";

                return `
                  <div class="timeline-row ${stateClass}">
                    <div class="timeline-indicator-col">
                      <div class="timeline-dot">
                        ${idx < currentStepIdx ? '✓' : idx + 1}
                      </div>
                      ${idx < steps.length - 1 ? `<div class="timeline-line"></div>` : ''}
                    </div>

                    <div class="timeline-info-col">
                      <div class="timeline-step-header">
                        <span class="timeline-step-name">${st.title}</span>
                        ${stateClass === "active" ? '<span class="status-pill status-transit">IN PROGRESS</span>' : ''}
                        ${stateClass === "completed" ? '<span class="timeline-time">Verified</span>' : ''}
                      </div>
                      <p class="timeline-step-desc">${st.desc}</p>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Right: Live Driver Card & Visual Route Radar -->
          <div class="tracking-side-col">
            <!-- Driver & Transport Card -->
            <div class="driver-profile-card">
              <div class="driver-card-header">
                <div class="driver-avatar-box">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <h4 class="driver-name">${driver.name}</h4>
                  <div class="driver-plate">${driver.vehicle}</div>
                  <div class="driver-cert">Certified Safe Food Courier · Badge #892</div>
                </div>
                <div class="driver-phone-cta">
                  <a href="tel:${driver.phone}" class="btn btn-outline btn-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span>Call Driver</span>
                  </a>
                </div>
              </div>

              <!-- Real-time Temperature Telemetry Card -->
              <div class="temp-sensor-box" id="sensorBoxContainer">
                <div class="sensor-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
                </div>
                <div style="flex:1;">
                  <div class="sensor-title" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>Digital Bluetooth Probe Telemetry</span>
                    <span class="telemetry-live-badge" style="font-size: 0.72rem; color: #059669; font-weight: 700;">● Live Probe 4G</span>
                  </div>
                  <div class="sensor-value">
                    Surface Reading: <strong id="liveSensorTemp">63.8°C</strong> 
                    <span class="text-muted" style="font-size:0.8rem;">(Hot-holding safe zone > 60°C)</span>
                  </div>
                </div>
                <span class="badge-tag badge-ready" id="sensorPassTag">PASS</span>
              </div>

              <!-- Verified Thermal Hold Manifest Photo -->
              <div class="thermal-hold-verification" style="display:flex; align-items:center; gap:12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:var(--radius-md); padding:10px 14px; margin-top:12px;">
                <img src="assets/images/banquet_meals_packed.jpg" alt="Thermal Hold Manifest" style="width:58px; height:46px; object-fit:cover; border-radius:6px; border:1px solid #CBD5E1; flex-shrink:0;" />
                <div style="flex:1;">
                  <div style="font-size:0.7rem; font-weight:800; color:#059669; letter-spacing:0.04em;">LOADING BAY MANIFEST #MB-894</div>
                  <div style="font-size:0.84rem; font-weight:700; color:#0F172A;">120 Meals Sealed in Insulated Trays</div>
                  <div style="font-size:0.74rem; color:#64748B;">Digital tamper-evident thermal custody verified</div>
                </div>
                <span class="badge-tag badge-ready" style="font-size:0.7rem;">LOGGED</span>
              </div>
            </div>

            <!-- Route Visualization Map Card with Live Vector Movement -->
            <div class="route-map-card">
              <div class="route-map-header">
                <div>
                  <h4 id="routeHeading">Live Dispatch Route (${distRemaining} km remaining)</h4>
                  <p class="text-sm text-muted">Orchid Grand Banquet (Link Rd) &rarr; Hope Haven Children's Home (JP Rd, Andheri West)</p>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <span class="badge-tag badge-ready" style="display:flex; align-items:center; gap:5px;">
                    <span class="status-pulse-dot" style="width:6px; height:6px;"></span>
                    <span>GPS Telemetry Active</span>
                  </span>
                </div>
              </div>

              <div class="route-radar-wrapper" id="routeRadarMap">
                <!-- Vector Route Representation -->
                <svg viewBox="0 0 450 200" class="route-svg" id="trackingSvgMap">
                  <!-- Road line background -->
                  <path d="M 60 140 Q 180 50, 390 80" fill="none" stroke="#CBD5E1" stroke-width="12" stroke-linecap="round"/>
                  <!-- Active traveled path -->
                  <path id="routeDashedLine" d="M 60 140 Q 180 50, 390 80" fill="none" stroke="#059669" stroke-width="5" stroke-dasharray="8,6" class="anim-dash"/>

                  <!-- Donor Pin -->
                  <g transform="translate(60, 140)">
                    <circle cx="0" cy="0" r="14" fill="#059669" />
                    <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
                    <text x="0" y="28" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" fill="#0F172A">Orchid Banquet (Link Rd)</text>
                  </g>

                  <!-- Dynamic Driver Moving Pin (Positioned along bezier curve) -->
                  <g id="driverMovingPin" transform="translate(${pos.x}, ${pos.y})">
                    <circle cx="0" cy="0" r="20" fill="rgba(5, 150, 105, 0.25)" class="anim-pulse-ring"/>
                    <circle cx="0" cy="0" r="11" fill="#18181B" stroke="#059669" stroke-width="2.5"/>
                    <circle cx="0" cy="0" r="4.5" fill="#10B981" />
                    <text id="driverPinLabel" x="0" y="-18" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="700" fill="#059669">
                      ${currentStepIdx >= 6 ? 'ARRIVED AT SHELTER' : `VAN EN ROUTE (${liveEta})`}
                    </text>
                  </g>

                  <!-- Shelter Pin -->
                  <g transform="translate(390, 80)">
                    <circle cx="0" cy="0" r="14" fill="#2563EB" />
                    <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
                    <text x="0" y="28" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" fill="#0F172A">Hope Haven (JP Rd)</text>
                  </g>
                </svg>
              </div>
            </div>

            <!-- Recipient Shelter Details -->
            <div class="shelter-detail-card">
              <h4>Recipient Shelter: ${donation.matchedNgoName || "Hope Haven Children's Home"}</h4>
              <p class="text-sm text-muted">${donation.matchedNgoAddress || "14, JP Road, Andheri West, Mumbai (1.4 km)"}</p>
              <div class="shelter-contact-row">
                <span>Coordinator: <strong>Sister Agnes</strong></span>
                <span>Phone: <strong>+91 98201 55670</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.startLiveCountdown(donation);
    this.startLiveTelemetry(currentStepIdx);
    this.subscribeRealtimeSync();
  }

  bindEvents() {
    const backBtn = document.getElementById("trackingBackBtn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        const role = window.appState.currentRole;
        window.appState.setView(role === "ngo" ? "ngo" : "donor");
      });
    }

    // Toggle Auto-Simulation
    const btnAutoSim = document.getElementById("btnToggleAutoSim");
    if (btnAutoSim) {
      btnAutoSim.addEventListener("click", () => {
        if (this.isAutoSimulating) {
          this.stopAutoSimulation();
        } else {
          this.startAutoSimulation();
        }
      });
    }

    // Advance Milestone button
    const btnAdvance = document.getElementById("btnDemoAdvanceStep");
    if (btnAdvance) {
      btnAdvance.addEventListener("click", () => {
        const donation = window.appState.getActiveTrackingDonation();
        if (donation) {
          const updated = window.appState.advanceDonationStage(donation.id);
          if (updated) {
            window.appToast(`Operational Milestone Reached: ${updated.status.toUpperCase()}`, "success");
            this.render();
          }
        }
      });
    }

    // Reset button
    const btnReset = document.getElementById("btnDemoReset");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        this.stopAutoSimulation();
        const donation = window.appState.getActiveTrackingDonation();
        if (donation) {
          window.appState.updateDonationStatus(donation.id, "created", { statusStepIndex: 0 });
          window.appToast("Reset demo status to: CREATED", "info");
          this.render();
        }
      });
    }
  }

  startLiveCountdown(donation) {
    if (this.timerInterval) clearInterval(this.timerInterval);

    const updateDisplay = () => {
      const remaining = donation.expiryTimestamp - Date.now();
      const hEl = document.getElementById("cdHours");
      const mEl = document.getElementById("cdMins");
      const sEl = document.getElementById("cdSecs");

      if (!hEl || !mEl || !sEl) return;

      if (remaining <= 0) {
        hEl.textContent = "00";
        mEl.textContent = "00";
        sEl.textContent = "00";
        sEl.classList.remove("text-emerald");
        sEl.classList.add("text-danger");
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((remaining % (1000 * 60)) / 1000);

      hEl.textContent = String(hours).padStart(2, '0');
      mEl.textContent = String(mins).padStart(2, '0');
      sEl.textContent = String(secs).padStart(2, '0');
    };

    updateDisplay();
    this.timerInterval = setInterval(updateDisplay, 1000);
  }

  startLiveTelemetry(stepIdx) {
    if (this.telemetryInterval) clearInterval(this.telemetryInterval);

    let tick = 0;
    this.telemetryInterval = setInterval(() => {
      tick++;

      // 1. Realistic temperature fluctuation between 63.5°C and 64.2°C
      if (tick % 2 === 0) {
        const tempBase = 63.8;
        const delta = (Math.sin(tick) * 0.35).toFixed(1);
        const currentTemp = (tempBase + parseFloat(delta)).toFixed(1);
        
        const heroTemp = document.getElementById("liveHeroTemp");
        if (heroTemp) heroTemp.textContent = `${currentTemp}°C (Safe thermal hold)`;

        const sensorTemp = document.getElementById("liveSensorTemp");
        if (sensorTemp) {
          sensorTemp.textContent = `${currentTemp}°C`;
          sensorTemp.style.transition = "color 0.3s ease";
          sensorTemp.style.color = "#10B981";
          setTimeout(() => { if (sensorTemp) sensorTemp.style.color = ""; }, 500);
        }
      }

      // 2. Real-time GPS movement along route curve
      if (stepIdx < 6) {
        // Continuous smooth progress
        this.currentT = Math.min(0.96, this.currentT + 0.0035);
        const pin = document.getElementById("driverMovingPin");
        const pinLabel = document.getElementById("driverPinLabel");
        const routeHeading = document.getElementById("routeHeading");

        if (pin) {
          const pos = this.getRoutePos(this.currentT);
          pin.setAttribute("transform", `translate(${pos.x}, ${pos.y})`);
          
          const kmRemaining = Math.max(0.1, (1 - this.currentT) * 1.8).toFixed(1);
          const minsRemaining = Math.max(1, Math.round((1 - this.currentT) * 14));

          if (pinLabel) {
            pinLabel.textContent = `VAN EN ROUTE (ETA ${minsRemaining}m)`;
          }
          if (routeHeading) {
            routeHeading.textContent = `Live Dispatch Route (${kmRemaining} km remaining)`;
          }
          const liveHeroEta = document.getElementById("liveHeroEta");
          if (liveHeroEta) {
            liveHeroEta.textContent = `${minsRemaining} Minutes`;
          }
        }
      }
    }, 1200);
  }

  startAutoSimulation() {
    this.isAutoSimulating = true;
    const btn = document.getElementById("btnToggleAutoSim");
    if (btn) {
      btn.classList.add("btn-active-sim");
      btn.innerHTML = `<span>⏸ Pause Auto-Simulation</span>`;
    }

    window.appToast("⚡ Real-Time Auto-Simulation active: Watch rescue pipeline unfold!", "info");

    this.simInterval = setInterval(() => {
      const donation = window.appState.getActiveTrackingDonation();
      if (!donation) return;

      if (donation.statusStepIndex < 6) {
        const next = window.appState.advanceDonationStage(donation.id);
        if (next) {
          window.appToast(`Operational Milestone: ${next.status.toUpperCase().replace('_', ' ')}`, "success");
          this.render();
        }
      } else {
        this.stopAutoSimulation();
        window.appToast("🎉 Rescue Mission Completed! 120 Meals Safely Delivered to Hope Haven", "success");
        if (window.realtimeAlert) {
          window.realtimeAlert("🎉 Food Delivered", "120 meals successfully transferred into Hope Haven dining hall.", { type: "success", icon: "❤️" });
        }
      }
    }, 7000);
  }

  stopAutoSimulation() {
    this.isAutoSimulating = false;
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
    const btn = document.getElementById("btnToggleAutoSim");
    if (btn) {
      btn.classList.remove("btn-active-sim");
      btn.innerHTML = `<span>⚡ Auto-Simulate Rescue</span>`;
    }
  }

  subscribeRealtimeSync() {
    if (window.realtimeBus && !this.realtimeUnsub) {
      this.realtimeUnsub = window.realtimeBus.subscribe("DONATION_STATUS_CHANGED", () => {
        this.render();
      });
    }
  }

  destroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
      this.telemetryInterval = null;
    }
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
    if (this.realtimeUnsub) {
      this.realtimeUnsub();
      this.realtimeUnsub = null;
    }
  }
}

window.LiveTrackingView = LiveTrackingView;
