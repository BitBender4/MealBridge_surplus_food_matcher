/**
 * MealBridge 5-Step AI Donation Creation Flow
 * Step 1: Quick Natural Message (Text/Voice)
 * Step 2: AI Extraction & Entity Analysis
 * Step 3: Confirm Details & Safety Checklist
 * Step 4: Smart Matching Screen (Transparent Match Suitability)
 * Step 5: Live Tracking & Dispatch
 */

class DonationWizardView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentStep = 1;
    this.currentManifest = null;
    this.selectedShelterId = "ngo-hope-haven";
  }

  render(startStep = 1) {
    if (!this.container) return;
    this.currentStep = startStep;

    this.container.innerHTML = `
      <div class="wizard-page">
        <!-- Progress Steps Bar -->
        <div class="wizard-header">
          <button class="btn btn-ghost btn-sm" id="wizardBackToDash">
            &larr; Back to Dashboard
          </button>

          <div class="wizard-stepper">
            <div class="step-indicator ${this.currentStep >= 1 ? 'step-active' : ''} ${this.currentStep > 1 ? 'step-done' : ''}" data-step="1">
              <div class="step-num">1</div>
              <div class="step-title">Quick Message</div>
            </div>
            <div class="step-connector ${this.currentStep > 1 ? 'connector-done' : ''}"></div>

            <div class="step-indicator ${this.currentStep >= 2 ? 'step-active' : ''} ${this.currentStep > 2 ? 'step-done' : ''}" data-step="2">
              <div class="step-num">2</div>
              <div class="step-title">AI Extraction</div>
            </div>
            <div class="step-connector ${this.currentStep > 2 ? 'connector-done' : ''}"></div>

            <div class="step-indicator ${this.currentStep >= 3 ? 'step-active' : ''} ${this.currentStep > 3 ? 'step-done' : ''}" data-step="3">
              <div class="step-num">3</div>
              <div class="step-title">Confirm Details</div>
            </div>
            <div class="step-connector ${this.currentStep > 3 ? 'connector-done' : ''}"></div>

            <div class="step-indicator ${this.currentStep >= 4 ? 'step-active' : ''} ${this.currentStep > 4 ? 'step-done' : ''}" data-step="4">
              <div class="step-num">4</div>
              <div class="step-title">Match Recipient</div>
            </div>
            <div class="step-connector ${this.currentStep > 4 ? 'connector-done' : ''}"></div>

            <div class="step-indicator ${this.currentStep >= 5 ? 'step-active' : ''}" data-step="5">
              <div class="step-num">5</div>
              <div class="step-title">Track Pickup</div>
            </div>
          </div>
        </div>

        <!-- Wizard Step Container -->
        <div class="wizard-step-body" id="wizardStepBody">
          ${this.renderStepContent()}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderStepContent() {
    switch (this.currentStep) {
      case 1:
        return this.renderStep1();
      case 2:
        return this.renderStep2();
      case 3:
        return this.renderStep3();
      case 4:
        return this.renderStep4();
      default:
        return this.renderStep1();
    }
  }

  // STEP 1: Quick Message
  renderStep1() {
    return `
      <div class="wizard-card-main animate-fade-in">
        <div class="wizard-badge-row">
          <span class="pill-badge pill-badge-emerald">Step 1 of 5 · Natural Language Input</span>
        </div>
        <h2 class="wizard-headline">Tell us what surplus food you have.</h2>
        <p class="wizard-subheading">
          Speak or type in any casual format. Mention quantities, food type, cooking time, and pickup location.
        </p>

        <!-- Prompt Preset Chips -->
        <div class="prompt-chips-label">QUICK TEST SAMPLES (CLICK TO AUTO-FILL):</div>
        <div class="prompt-chips-row">
          ${SEED_DATA.samplePrompts.map((p, idx) => `
            <button class="chip-btn" data-index="${idx}">${p.label}</button>
          `).join('')}
        </div>

        <!-- Text Input & Voice simulation -->
        <div class="input-card-box">
          <textarea id="rawMessageInput" class="wizard-textarea" rows="4" 
            placeholder="e.g. Hi, we have around 120 veg meals left from tonight's wedding. Food was cooked around 7:30 PM and is packed. Pickup from Orchid Grand Banquet Hall, Andheri West.">Hi, we have around 120 veg meals left from tonight's wedding. Food was cooked around 7:30 PM and is packed in aluminum catering foil trays. Pickup from Orchid Grand Banquet Hall, New Link Road, Andheri West near Infinity Mall.</textarea>
          
          <div class="textarea-footer">
            <div class="mic-toggle-btn" id="simulatedMicBtn" title="Simulate voice transcription">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              <span>Voice Note Audio: Ready</span>
            </div>
            <div class="char-count" id="charCount">174 characters</div>
          </div>
        </div>

        <div class="wizard-action-footer">
          <div></div>
          <button class="btn btn-primary btn-lg" id="btnExtractAI">
            <span>Analyze with AI</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    `;
  }

  // STEP 2: AI Extraction & Entity Analysis
  renderStep2() {
    if (!this.currentManifest) {
      const text = document.getElementById("rawMessageInput") ? document.getElementById("rawMessageInput").value : "";
      this.currentManifest = MealBridgeAIParser.parse(text);
    }

    const m = this.currentManifest;

    return `
      <div class="wizard-card-main animate-fade-in">
        <div class="wizard-badge-row">
          <span class="pill-badge pill-badge-emerald">Step 2 of 5 · AI Extraction & Verification</span>
          <span class="confidence-badge">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <strong>${m.confidence}% High Confidence</strong>
          </span>
        </div>

        <h2 class="wizard-headline">AI Structured Rescue Manifest</h2>
        <p class="wizard-subheading">
          Our model parsed your text, verified food safety boundaries against FSSAI guidelines, and mapped location coordinates.
        </p>

        <!-- Entity Token Highlighting Bar -->
        <div class="token-highlights-card">
          <div class="token-label">EXTRACTED ENTITIES FROM RAW MESSAGE:</div>
          <div class="tokens-flex">
            ${m.tokens.map(t => `
              <div class="entity-token entity-${t.type}">
                <span class="token-val">${t.text}</span>
                <span class="token-tag">${t.label}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 8 Structured Fields Grid -->
        <div class="structured-fields-grid">
          <div class="field-item">
            <span class="field-label">1. ESTIMATED MEALS</span>
            <span class="field-value highlight text-emerald">${m.estimatedMeals} Portions</span>
          </div>

          <div class="field-item">
            <span class="field-label">2. DIETARY CLASSIFICATION</span>
            <span class="field-value">${m.dietary}</span>
          </div>

          <div class="field-item">
            <span class="field-label">3. FOOD TYPE</span>
            <span class="field-value">${m.foodType}</span>
          </div>

          <div class="field-item">
            <span class="field-label">4. PREPARATION TIME</span>
            <span class="field-value">${m.preparationTime}</span>
          </div>

          <div class="field-item">
            <span class="field-label">5. PACKAGING STATUS</span>
            <span class="field-value">${m.packagingStatus}</span>
          </div>

          <div class="field-item">
            <span class="field-label">6. PICKUP LOCATION</span>
            <span class="field-value">${m.pickupLocation}</span>
          </div>

          <div class="field-item">
            <span class="field-label">7. AVAILABILITY TIME</span>
            <span class="field-value text-emerald font-semibold">${m.availabilityTime}</span>
          </div>

          <div class="field-item">
            <span class="field-label">8. SUGGESTED SAFE EXPIRY</span>
            <span class="field-value text-amber font-semibold">${m.suggestedExpiry} (${m.safeWindowRemaining} remaining)</span>
          </div>
        </div>

        <!-- Missing Information Detection -->
        <div class="missing-info-card ${m.missingInformation.length ? 'has-missing' : 'all-good'}">
          <div class="missing-info-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${m.missingInformation.length ? '#D97706' : '#059669'}" stroke-width="2">
              ${m.missingInformation.length ? '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>' : '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'}
            </svg>
            <strong>${m.missingInformation.length ? 'Recommended Details To Confirm in Step 3:' : 'All Critical Logistics Details Verified:'}</strong>
          </div>
          <ul class="missing-list">
            ${m.missingInformation.length ? m.missingInformation.map(item => `<li>${item}</li>`).join('') : '<li>Complete physical address, temperature hold status, and quantity confirmed.</li>'}
          </ul>
        </div>

        <div class="wizard-action-footer">
          <button class="btn btn-outline" id="btnBackToStep1">&larr; Edit Message</button>
          <button class="btn btn-primary btn-lg" id="btnProceedToConfirm">
            <span>Confirm & Verify Details &rarr;</span>
          </button>
        </div>
      </div>
    `;
  }

  // STEP 3: Confirm Details & Safety Checklist
  renderStep3() {
    const m = this.currentManifest;

    return `
      <div class="wizard-card-main animate-fade-in">
        <div class="wizard-badge-row">
          <span class="pill-badge pill-badge-emerald">Step 3 of 5 · Confirm Details & Safety</span>
        </div>
        <h2 class="wizard-headline">Fine-tune details before matching.</h2>
        <p class="wizard-subheading">
          Adjust meal quantities or packaging requirements if needed, then confirm the safety declaration.
        </p>

        <div class="form-grid">
          <div class="form-group col-span-2">
            <label class="form-label">Feast / Surplus Title</label>
            <input type="text" id="confirmTitle" class="form-input" value="${m.title || '120 Veg Meals Wedding Surplus'}" />
          </div>

          <div class="form-group">
            <label class="form-label">Estimated Meal Portions</label>
            <div class="quantity-input-wrap">
              <button class="btn-qty" id="qtyMinus">-</button>
              <input type="number" id="confirmMeals" class="form-input text-center" value="${m.estimatedMeals}" min="10" max="1000" />
              <button class="btn-qty" id="qtyPlus">+</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Dietary Category</label>
            <select id="confirmDiet" class="form-input">
              <option value="Vegetarian" ${m.dietary === 'Vegetarian' ? 'selected' : ''}>Vegetarian (100% Veg)</option>
              <option value="Non-Vegetarian" ${m.dietary === 'Non-Vegetarian' ? 'selected' : ''}>Non-Vegetarian</option>
              <option value="Mixed (Separated)" ${m.dietary.includes('Mixed') ? 'selected' : ''}>Mixed (Separated Trays)</option>
              <option value="Vegan" ${m.dietary === 'Vegan' ? 'selected' : ''}>Vegan</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Cooked Time</label>
            <input type="text" id="confirmCookedTime" class="form-input" value="${m.preparationTime}" />
          </div>

          <div class="form-group">
            <label class="form-label">Packaging Type</label>
            <input type="text" id="confirmPackaging" class="form-input" value="${m.packagingStatus}" />
          </div>

          <div class="form-group col-span-2">
            <label class="form-label">Exact Pickup Address & Loading Bay</label>
            <input type="text" id="confirmLocation" class="form-input" value="${m.pickupLocation}" />
          </div>

          <div class="form-group col-span-2">
            <label class="form-label">Special Driver Access Instructions</label>
            <input type="text" id="confirmNotes" class="form-input" value="Kitchen loading bay at rear. Service ramp available for insulated van trolleys." />
          </div>
        </div>

        <!-- Safety Declaration Checklist -->
        <div class="safety-declaration-card">
          <h4 class="decl-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Donor Food Safety & Hygiene Declaration
          </h4>
          <div class="checkbox-row">
            <input type="checkbox" id="checkSafety1" checked class="form-checkbox" />
            <label for="checkSafety1">Food has remained covered in hygienic containers above 60°C or safely chilled below 5°C.</label>
          </div>
          <div class="checkbox-row">
            <input type="checkbox" id="checkSafety2" checked class="form-checkbox" />
            <label for="checkSafety2">Preparation was completed within the last 2 hours in compliance with FSSAI cooked-food guidelines.</label>
          </div>
          <div class="checkbox-row">
            <input type="checkbox" id="checkSafety3" checked class="form-checkbox" />
            <label for="checkSafety3">Surplus does not contain any expired, spoiled, or unsafe leftovers.</label>
          </div>
        </div>

        <div class="wizard-action-footer">
          <button class="btn btn-outline" id="btnBackToStep2">&larr; Back to AI Extraction</button>
          <button class="btn btn-primary btn-lg" id="btnProceedToMatching">
            <span>Find Best Matching Shelters &rarr;</span>
          </button>
        </div>
      </div>
    `;
  }

  // STEP 4: Smart Matching Screen
  renderStep4() {
    const m = this.currentManifest;
    const rankedShelters = MealBridgeMatcher.rankShelters(m);

    return `
      <div class="wizard-card-main animate-fade-in">
        <div class="wizard-badge-row">
          <span class="pill-badge pill-badge-emerald">Step 4 of 5 · Smart Recipient Matching</span>
          <span class="pulse-indicator"></span>
          <span class="text-sm font-semibold text-charcoal">4 Vetted Shelters Evaluated</span>
        </div>

        <h2 class="wizard-headline">Recommended Nearby Shelters</h2>
        <p class="wizard-subheading">
          Ranked by <strong>Match Suitability</strong> based on proximity, capacity fit, transport velocity, and dietary compatibility.
        </p>

        <!-- Shelters Ranked List -->
        <div class="shelter-ranking-list">
          ${rankedShelters.map((s, idx) => `
            <div class="shelter-rank-card ${idx === 0 ? 'top-match' : ''} ${s.isStrictDietaryBlock ? 'dietary-mismatch' : ''}" data-id="${s.id}">
              <div class="shelter-rank-header">
                <div class="shelter-identity">
                  <div class="shelter-index-badge">${idx === 0 ? '★ TOP SUITABILITY' : `#${idx + 1}`}</div>
                  <h3 class="shelter-name">${s.name}</h3>
                  <div class="shelter-meta-row">
                    <span class="shelter-type">${s.type}</span>
                    <span class="meta-dot">·</span>
                    <span class="shelter-dist"><strong>${s.distanceKm} km</strong> away</span>
                    <span class="meta-dot">·</span>
                    <span class="shelter-eta">ETA: ~${s.estimatedPickupMinutes} mins</span>
                  </div>
                </div>

                <div class="suitability-score-box">
                  <div class="score-label">MATCH SUITABILITY</div>
                  <div class="score-value ${s.suitabilityScore >= 90 ? 'text-emerald' : s.suitabilityScore >= 80 ? 'text-blue' : 'text-amber'}">
                    ${s.suitabilityScore}%
                  </div>
                </div>
              </div>

              <!-- Factor Breakdown Bars -->
              <div class="factors-grid">
                <div class="factor-bar-item">
                  <div class="factor-header">
                    <span>Proximity (35%)</span>
                    <strong>${s.factorPercentages.proximity}%</strong>
                  </div>
                  <div class="progress-track"><div class="progress-fill" style="width: ${s.factorPercentages.proximity}%;"></div></div>
                </div>

                <div class="factor-bar-item">
                  <div class="factor-header">
                    <span>Capacity Fit (30%)</span>
                    <strong>${s.factorPercentages.capacityFit}%</strong>
                  </div>
                  <div class="progress-track"><div class="progress-fill bg-blue" style="width: ${s.factorPercentages.capacityFit}%;"></div></div>
                </div>

                <div class="factor-bar-item">
                  <div class="factor-header">
                    <span>Transport Readiness (25%)</span>
                    <strong>${s.factorPercentages.transportReadiness}%</strong>
                  </div>
                  <div class="progress-track"><div class="progress-fill bg-purple" style="width: ${s.factorPercentages.transportReadiness}%;"></div></div>
                </div>

                <div class="factor-bar-item">
                  <div class="factor-header">
                    <span>Dietary Alignment (10%)</span>
                    <strong>${s.factorPercentages.dietaryMatch}%</strong>
                  </div>
                  <div class="progress-track"><div class="progress-fill ${s.factorPercentages.dietaryMatch === 0 ? 'bg-red' : 'bg-emerald'}" style="width: ${s.factorPercentages.dietaryMatch}%;"></div></div>
                </div>
              </div>

              <!-- Recommendation Explanation -->
              <div class="recommendation-reason-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span><strong>Suitability Basis:</strong> ${s.customReason}</span>
              </div>

              <!-- Action Bar -->
              <div class="shelter-card-actions">
                <div class="shelter-transport-pill">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  <span>${s.pickupCapability} (${s.driverName})</span>
                </div>

                <button class="btn ${idx === 0 ? 'btn-primary' : 'btn-outline'} btn-sm btn-select-shelter" data-id="${s.id}">
                  <span>${idx === 0 ? 'Select & Dispatch Pickup Now' : 'Select This Shelter'}</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="wizard-action-footer">
          <button class="btn btn-outline" id="btnBackToStep3">&larr; Back to Details</button>
          <div></div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Back to dashboard
    const backDash = document.getElementById("wizardBackToDash");
    if (backDash) backDash.addEventListener("click", () => window.appState.setView("donor", "donor"));

    // Prompt preset chips (Step 1)
    this.container.querySelectorAll(".chip-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        const preset = SEED_DATA.samplePrompts[idx];
        const textarea = document.getElementById("rawMessageInput");
        if (textarea && preset) {
          textarea.value = preset.text;
          const charCount = document.getElementById("charCount");
          if (charCount) charCount.textContent = `${preset.text.length} characters`;
        }
      });
    });

    // Voice button simulation
    const micBtn = document.getElementById("simulatedMicBtn");
    if (micBtn) {
      micBtn.addEventListener("click", () => {
        micBtn.classList.toggle("recording");
        if (micBtn.classList.contains("recording")) {
          micBtn.innerHTML = `
            <span class="status-pulse-dot" style="background:#EF4444;"></span>
            <span style="color:#EF4444; font-weight:700;">Listening to Voice Note...</span>
          `;
          setTimeout(() => {
            micBtn.classList.remove("recording");
            micBtn.innerHTML = `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span style="color:#059669; font-weight:600;">Voice Transcribed Successfully</span>
            `;
          }, 1200);
        }
      });
    }

    // Step 1 -> Step 2
    const btnExtractAI = document.getElementById("btnExtractAI");
    if (btnExtractAI) {
      btnExtractAI.addEventListener("click", () => {
        const text = document.getElementById("rawMessageInput") ? document.getElementById("rawMessageInput").value : "";
        btnExtractAI.innerHTML = `
          <span class="status-pulse-dot"></span>
          <span>Parsing Manifest & Safety...</span>
        `;
        setTimeout(() => {
          this.currentManifest = MealBridgeAIParser.parse(text);
          this.currentStep = 2;
          this.render(2);
        }, 500);
      });
    }

    // Step 2 -> Step 1
    const btnBackToStep1 = document.getElementById("btnBackToStep1");
    if (btnBackToStep1) btnBackToStep1.addEventListener("click", () => { this.currentStep = 1; this.render(1); });

    // Step 2 -> Step 3
    const btnProceedToConfirm = document.getElementById("btnProceedToConfirm");
    if (btnProceedToConfirm) btnProceedToConfirm.addEventListener("click", () => { this.currentStep = 3; this.render(3); });

    // Step 3 -> Step 2
    const btnBackToStep2 = document.getElementById("btnBackToStep2");
    if (btnBackToStep2) btnBackToStep2.addEventListener("click", () => { this.currentStep = 2; this.render(2); });

    // Quantity +/- buttons (Step 3)
    const qtyMinus = document.getElementById("qtyMinus");
    const qtyPlus = document.getElementById("qtyPlus");
    const confirmMeals = document.getElementById("confirmMeals");
    if (qtyMinus && confirmMeals) {
      qtyMinus.addEventListener("click", () => {
        confirmMeals.value = Math.max(10, parseInt(confirmMeals.value || 100, 10) - 10);
      });
    }
    if (qtyPlus && confirmMeals) {
      qtyPlus.addEventListener("click", () => {
        confirmMeals.value = parseInt(confirmMeals.value || 100, 10) + 10;
      });
    }

    // Step 3 -> Step 4
    const btnProceedToMatching = document.getElementById("btnProceedToMatching");
    if (btnProceedToMatching) {
      btnProceedToMatching.addEventListener("click", () => {
        // Collect edits
        if (this.currentManifest) {
          this.currentManifest.title = document.getElementById("confirmTitle") ? document.getElementById("confirmTitle").value : this.currentManifest.title;
          this.currentManifest.estimatedMeals = document.getElementById("confirmMeals") ? parseInt(document.getElementById("confirmMeals").value, 10) : this.currentManifest.estimatedMeals;
          this.currentManifest.dietary = document.getElementById("confirmDiet") ? document.getElementById("confirmDiet").value : this.currentManifest.dietary;
          this.currentManifest.preparationTime = document.getElementById("confirmCookedTime") ? document.getElementById("confirmCookedTime").value : this.currentManifest.preparationTime;
          this.currentManifest.packagingStatus = document.getElementById("confirmPackaging") ? document.getElementById("confirmPackaging").value : this.currentManifest.packagingStatus;
          this.currentManifest.pickupLocation = document.getElementById("confirmLocation") ? document.getElementById("confirmLocation").value : this.currentManifest.pickupLocation;
          this.currentManifest.specialNotes = document.getElementById("confirmNotes") ? document.getElementById("confirmNotes").value : "";
        }
        this.currentStep = 4;
        this.render(4);
      });
    }

    // Step 4 -> Step 3
    const btnBackToStep3 = document.getElementById("btnBackToStep3");
    if (btnBackToStep3) btnBackToStep3.addEventListener("click", () => { this.currentStep = 3; this.render(3); });

    // Select shelter buttons (Step 4 -> Step 5 Tracking)
    this.container.querySelectorAll(".btn-select-shelter").forEach(btn => {
      btn.addEventListener("click", () => {
        const shelterId = btn.getAttribute("data-id");
        const shelter = SEED_DATA.shelters.find(s => s.id === shelterId) || SEED_DATA.shelters[0];

        // Create new active donation
        const created = window.appState.createDonation({
          title: this.currentManifest.title,
          estimatedMeals: this.currentManifest.estimatedMeals,
          dietary: this.currentManifest.dietary,
          foodType: this.currentManifest.foodType,
          foodItems: this.currentManifest.foodItems,
          cookedAtTime: this.currentManifest.preparationTime,
          packagingStatus: this.currentManifest.packagingStatus,
          pickupLocation: this.currentManifest.pickupLocation,
          specialNotes: this.currentManifest.specialNotes,
          status: "accepted", // immediately accepted upon donor match selection
          statusStepIndex: 3,
          matchedNgoId: shelter.id,
          matchedNgoName: shelter.name,
          matchedNgoAddress: `${shelter.address} (${shelter.distanceKm} km)`,
          assignedDriver: {
            name: shelter.driverName,
            phone: shelter.driverPhone,
            vehicle: `${shelter.pickupCapability} (${shelter.vehiclePlate})`,
            etaMinutes: shelter.estimatedPickupMinutes,
            currentTempLog: "63.8°C (Safe Zone)"
          }
        });

        window.appToast(`Dispatched to ${shelter.name}! Insulated van en route.`, "success");
        window.appState.setActiveTrackingId(created.id);
        window.appState.setView("tracking", "donor");
      });
    });
  }
}

window.DonationWizardView = DonationWizardView;
