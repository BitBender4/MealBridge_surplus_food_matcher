/**
 * MealBridge - Core Feature: AI Quick Donation, Smart Matching & Live Pickup Tracking
 * Complete working demonstration flow:
 * 1. Enter messy donor message
 * 2. AI extracts donation
 * 3. Confirm donation
 * 4. Find NGO
 * 5. Select recommended NGO (Hope Shelter)
 * 6. Confirm match
 * 7. Track pickup ("Rescue in progress")
 * 8. Change pickup status ("Driver on the way", "Food picked up")
 * 9. Complete delivery ("Delivered")
 * 10. Show "+120 meals rescued" & "View impact"
 */

class QuickDonateController {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.state = "input"; // "input" | "processing" | "review" | "searching" | "matching" | "confirming" | "matched" | "tracking" | "completed"

    // Default sample message
    this.rawMessage = "Hi, we have around 120 veg meals left from tonight's wedding. Food was cooked around 8:15 PM and is packed. Pickup from Orchid Banquet Hall. Can someone collect ASAP?";

    // Extracted Fields State
    this.extracted = {
      meals: 120,
      foodType: "Vegetarian",
      packaging: "Packed",
      prepared: "8:15 PM",
      location: "Orchid Banquet Hall",
      availability: "Ready now"
    };

    this.safetyConfirmed = true;
    this.selectedShelter = null;

    // Food Rescue Clock (Default: 42 min)
    this.countdownSeconds = 42 * 60; // 42 min
    this.isTimerExpired = false;
    this.timerInterval = null;

    // Tracking Step State:
    // 0: Donation created, 1: AI details confirmed, 2: Recipient matched,
    // 3: Pickup assigned, 4: Driver on the way, 5: Food picked up, 6: Delivered
    this.trackingStage = "pickup_assigned"; // "pickup_assigned" | "driver_on_way" | "picked_up" | "delivered"

    // Activity Feed Log
    this.activityLog = [
      { time: "9:42 PM", text: "Donation created" },
      { time: "9:43 PM", text: "AI structured the donation" },
      { time: "9:44 PM", text: "Hope Shelter accepted" },
      { time: "9:47 PM", text: "Pickup assigned" }
    ];

    // UI Dropdown & Modal States
    this.showStatusDropdown = false;
    this.showDetailsModal = false;
    this.showImpactModal = false;

    // 4 Realistic NGO Options
    this.ngoOptions = [
      {
        id: "hope-shelter",
        name: "Hope Shelter",
        distance: "1.8 km",
        distanceKm: 1.8,
        canReceive: 150,
        need: 100,
        dietaryMatch: "Vegetarian",
        pickup: "Available",
        pickupAvailable: true,
        estimatedPickup: "18 min",
        isRecommended: true,
        whyPoints: [
          "Capacity can accommodate the donation",
          "Dietary requirement matches",
          "Pickup is available",
          "Short estimated pickup time",
          "Located nearby"
        ],
        whyDetails: "Capacity of 150 meals easily handles 120 meals for their 100 residents. Dedicated thermal vehicle is parked nearby and ready for immediate 18-minute pickup."
      },
      {
        id: "care-haven",
        name: "Care Haven",
        distance: "3.2 km",
        distanceKm: 3.2,
        canReceive: 80,
        need: 80,
        dietaryMatch: "Vegetarian",
        pickup: "Available",
        pickupAvailable: true,
        estimatedPickup: "31 min",
        isRecommended: false,
        whyPoints: [
          "Dietary requirement matches",
          "Pickup is available",
          "Located in adjacent district"
        ],
        whyDetails: "Can accept up to 80 meals for immediate evening supper. If selected for 120 meals, remaining 40 meals would require split coordination."
      },
      {
        id: "community-kitchen",
        name: "Community Kitchen",
        distance: "4.7 km",
        distanceKm: 4.7,
        canReceive: 200,
        need: 180,
        dietaryMatch: "Vegetarian",
        pickup: "Not currently available",
        pickupAvailable: false,
        estimatedPickup: "52 min",
        isRecommended: false,
        whyPoints: [
          "Large absorption capacity (200 meals)",
          "Dietary requirement matches"
        ],
        whyDetails: "High community capacity (200 meals), but their primary cargo van is currently completing a delivery, resulting in a 52-minute turnaround."
      },
      {
        id: "night-shelter-network",
        name: "Night Shelter Network",
        distance: "2.5 km",
        distanceKm: 2.5,
        canReceive: 60,
        need: 60,
        dietaryMatch: "Vegetarian",
        pickup: "Available",
        pickupAvailable: true,
        estimatedPickup: "25 min",
        isRecommended: false,
        whyPoints: [
          "Rapid response volunteer courier",
          "Dietary requirement matches",
          "2.5 km proximity"
        ],
        whyDetails: "Rapid 25-minute response with volunteer cargo bikes, but intake capacity is limited to 60 meals tonight."
      }
    ];

    // Restore saved session if one exists
    if (window._mealbridgeQuickDonateSession) {
      const s = window._mealbridgeQuickDonateSession;
      this.state = s.state || "input";
      this.rawMessage = s.rawMessage !== undefined ? s.rawMessage : this.rawMessage;
      this.extracted = s.extracted ? { ...s.extracted } : this.extracted;
      this.safetyConfirmed = s.safetyConfirmed !== undefined ? s.safetyConfirmed : true;
      this.selectedShelter = s.selectedShelter || null;
      this.countdownSeconds = s.countdownSeconds !== undefined ? s.countdownSeconds : (42 * 60);
      this.isTimerExpired = s.isTimerExpired || false;
      this.trackingStage = s.trackingStage || "pickup_assigned";
      this.activityLog = s.activityLog ? [...s.activityLog] : this.activityLog;
    }
  }

  saveSession() {
    window._mealbridgeQuickDonateSession = {
      state: this.state,
      rawMessage: this.rawMessage,
      extracted: this.extracted,
      safetyConfirmed: this.safetyConfirmed,
      selectedShelter: this.selectedShelter,
      countdownSeconds: this.countdownSeconds,
      isTimerExpired: this.isTimerExpired,
      trackingStage: this.trackingStage,
      activityLog: this.activityLog
    };
  }

  resetSession() {
    window._mealbridgeQuickDonateSession = null;
    this.state = "input";
    this.rawMessage = "Hi, we have around 120 veg meals left from tonight's wedding. Food was cooked around 8:15 PM and is packed. Pickup from Orchid Banquet Hall. Can someone collect ASAP?";
    this.extracted = {
      meals: 120,
      foodType: "Vegetarian",
      packaging: "Packed",
      prepared: "8:15 PM",
      location: "Orchid Banquet Hall",
      availability: "Ready now"
    };
    this.safetyConfirmed = true;
    this.selectedShelter = null;
    this.countdownSeconds = 42 * 60;
    this.isTimerExpired = false;
    this.trackingStage = "pickup_assigned";
    this.activityLog = [
      { time: "9:42 PM", text: "Donation created" },
      { time: "9:43 PM", text: "AI structured the donation" },
      { time: "9:44 PM", text: "Hope Shelter accepted" },
      { time: "9:47 PM", text: "Pickup assigned" }
    ];
  }

  render() {
    if (!this.container) return;
    this.stopCountdownTimer();
    this.saveSession();

    switch (this.state) {
      case "input":
        this.renderInputState();
        break;
      case "processing":
        this.renderProcessingState();
        break;
      case "review":
        this.renderReviewState();
        break;
      case "searching":
        this.renderSearchingState();
        break;
      case "matching":
        this.renderMatchingState();
        break;
      case "confirming":
        this.renderConfirmingState();
        break;
      case "matched":
        this.renderMatchedState();
        break;
      case "tracking":
        this.renderTrackingState();
        this.startCountdownTimer();
        break;
      case "completed":
        this.renderCompletedState();
        break;
      default:
        this.renderInputState();
    }
  }

  // 1. INPUT STATE
  renderInputState() {
    this.container.innerHTML = `
      <div class="quick-donate-container">
        <!-- Header -->
        <div class="qd-header">
          <div class="qd-pill">
            <span class="status-pulse-dot"></span>
            <span>AI Rapid Ingestion</span>
          </div>
          <h1 class="qd-title">Quick Donate</h1>
          <p class="qd-subtitle">
            Just describe what food you have. Our AI turns rushed messages into verified donations and quickly connects them with nearby shelters.
          </p>
        </div>

        <!-- Main Input Card -->
        <div class="qd-card">
          <div class="example-chips-wrapper">
            <div class="example-label-row">
              <span class="example-label">Try An Example Message:</span>
            </div>
            <div class="example-chips">
              <button class="example-chip-btn" id="btnLoadExample1">
                <span>Orchid Banquet Wedding (120 Veg)</span>
              </button>
              <button class="example-chip-btn" id="btnLoadExample2">
                <span>Corporate Seminar (Missing Details)</span>
              </button>
              <button class="example-chip-btn" id="btnLoadExample3">
                <span>Hostel Mess Surplus (90 Veg)</span>
              </button>
            </div>
          </div>

          <div class="message-input-box">
            <textarea id="qdTextarea" class="message-textarea" 
              placeholder="e.g. Hi, we have around 120 veg meals left from tonight's wedding. Food was cooked around 8:15 PM and is packed. Pickup from Orchid Banquet Hall. Can someone collect ASAP?">${this.rawMessage}</textarea>
            
            <div class="message-input-footer">
              <span class="char-counter-text" id="qdCharCount">${this.rawMessage.length} characters</span>
              <button class="clear-btn" id="qdClearBtn">Clear</button>
            </div>
          </div>

          <button class="cta-btn-primary" id="btnProcessAI">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span>Create donation with AI</span>
          </button>
        </div>
      </div>
    `;

    this.bindInputEvents();
  }

  bindInputEvents() {
    const textarea = document.getElementById("qdTextarea");
    const charCount = document.getElementById("qdCharCount");
    const clearBtn = document.getElementById("qdClearBtn");
    const processBtn = document.getElementById("btnProcessAI");

    if (textarea && charCount) {
      textarea.addEventListener("input", (e) => {
        this.rawMessage = e.target.value;
        charCount.textContent = `${e.target.value.length} characters`;
      });
    }

    if (clearBtn && textarea && charCount) {
      clearBtn.addEventListener("click", () => {
        textarea.value = "";
        this.rawMessage = "";
        charCount.textContent = `0 characters`;
        textarea.focus();
      });
    }

    const ex1 = document.getElementById("btnLoadExample1");
    if (ex1 && textarea) {
      ex1.addEventListener("click", () => {
        const text = "Hi, we have around 120 veg meals left from tonight's wedding. Food was cooked around 8:15 PM and is packed. Pickup from Orchid Banquet Hall. Can someone collect ASAP?";
        textarea.value = text;
        this.rawMessage = text;
        if (charCount) charCount.textContent = `${text.length} characters`;
      });
    }

    const ex2 = document.getElementById("btnLoadExample2");
    if (ex2 && textarea) {
      ex2.addEventListener("click", () => {
        const text = "We have 75 executive boxed meals leftover from lunch. All vegetarian and ready now. Need volunteer pickup.";
        textarea.value = text;
        this.rawMessage = text;
        if (charCount) charCount.textContent = `${text.length} characters`;
      });
    }

    const ex3 = document.getElementById("btnLoadExample3");
    if (ex3 && textarea) {
      ex3.addEventListener("click", () => {
        const text = "St. Jude Hostel canteen: 90 portions of veg dal, rice, and rotis cooked at 7:30 PM. Food is in clean containers. Ready now for collection.";
        textarea.value = text;
        this.rawMessage = text;
        if (charCount) charCount.textContent = `${text.length} characters`;
      });
    }

    if (processBtn) {
      processBtn.addEventListener("click", () => {
        const text = textarea ? textarea.value.trim() : "";
        if (!text) {
          alert("Please enter a donation message or click one of the example buttons.");
          return;
        }
        this.rawMessage = text;
        this.state = "processing";
        this.render();

        setTimeout(() => {
          this.parseMessageWithAI(this.rawMessage);
          this.state = "review";
          this.render();
        }, 1000);
      });
    }
  }

  parseMessageWithAI(rawText) {
    const text = (rawText || "").trim();
    const lower = text.toLowerCase();

    // 1. MEALS
    let meals = null;
    const mealMatches = [
      /(\d+)\s*(?:veg|non-veg|nonveg|meals|portions|boxes|plates|servings|pax|people)/i,
      /(?:around|approx|approximately|about|have)\s*(\d+)/i,
      /(\d+)\s*(?:food\s*packets|boxes)/i
    ];
    for (const r of mealMatches) {
      const m = text.match(r);
      if (m && m[1]) {
        meals = parseInt(m[1], 10);
        break;
      }
    }

    // 2. FOOD TYPE
    let foodType = null;
    const nonVegKeywords = ["chicken", "mutton", "fish", "meat", "egg", "non-veg", "nonveg"];
    const vegKeywords = ["veg", "vegetarian", "paneer", "dal", "subz", "sabzi", "roti", "poha", "idli"];
    if (nonVegKeywords.some(kw => lower.includes(kw))) {
      foodType = "Non-Vegetarian";
    } else if (vegKeywords.some(kw => lower.includes(kw))) {
      foodType = "Vegetarian";
    }

    // 3. PACKAGING
    let packaging = null;
    if (lower.includes("packed in") || lower.includes("is packed") || lower.includes("packed")) {
      packaging = "Packed";
    } else if (lower.includes("boxed") || lower.includes("boxes") || lower.includes("cartons")) {
      packaging = "Packed (Boxed)";
    } else if (lower.includes("containers") || lower.includes("warmers") || lower.includes("vessels") || lower.includes("drums")) {
      packaging = "In kitchen containers";
    }

    // 4. PREPARED
    let prepared = null;
    const timeMatch = text.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))/);
    if (timeMatch) {
      prepared = timeMatch[1].toUpperCase();
    } else if (lower.includes("cooked around") || lower.includes("cooked at")) {
      const matchAfter = text.match(/cooked\s*(?:around|at)?\s*([0-9:a-zA-Z\s]+?)(?:and|\.|,|$)/i);
      if (matchAfter && matchAfter[1]) {
        prepared = matchAfter[1].trim();
      }
    }

    // 5. LOCATION
    let location = null;
    if (lower.includes("orchid banquet")) {
      location = "Orchid Banquet Hall";
    } else if (lower.includes("st. jude") || lower.includes("st jude")) {
      location = "St. Jude Hostel";
    } else if (lower.includes("grand horizon")) {
      location = "Grand Horizon Hotel";
    } else {
      const fromMatch = text.match(/(?:pickup\s*from|from|at)\s*([^,.\n]+)/i);
      if (fromMatch && fromMatch[1]) {
        location = fromMatch[1].trim();
      }
    }

    // 6. AVAILABILITY
    let availability = null;
    if (lower.includes("asap") || lower.includes("now") || lower.includes("ready") || lower.includes("immediately") || lower.includes("tonight")) {
      availability = "Ready now";
    }

    this.extracted = {
      meals,
      foodType,
      packaging,
      prepared,
      location,
      availability
    };
  }

  // 2. PROCESSING STATE
  renderProcessingState() {
    this.container.innerHTML = `
      <div class="quick-donate-container">
        <div class="ai-processing-card">
          <div class="processing-radar-orb">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          <h2 class="processing-title">Extracting Donation Data with AI...</h2>
          <p class="processing-sub">
            Parsing food portions, dietary classification, prep time, and pickup coordinates.
          </p>

          <div class="processing-steps-mini">
            <span class="step-mini active">● Portion & Food Identification</span>
            <span class="step-mini active">● Cooking Timestamp Parsing</span>
            <span class="step-mini active">● Pickup Location Geocoding</span>
          </div>
        </div>
      </div>
    `;
  }

  // 3. REVIEW STATE
  renderReviewState() {
    const ex = this.extracted;

    const renderFieldValue = (fieldKey, val) => {
      if (val === null || val === undefined || val === "") {
        return `
          <div class="field-val-display" data-field="${fieldKey}">
            <span class="badge-needs-confirmation">⚠ Needs confirmation</span>
            <span class="field-edit-icon">✎ Click to enter</span>
          </div>
        `;
      }
      return `
        <div class="field-val-display" data-field="${fieldKey}">
          <span class="val-text">${val}</span>
          <span class="field-edit-icon" title="Click to edit">✎</span>
        </div>
      `;
    };

    const hasMeals = ex.meals !== null && ex.meals !== "";
    const hasFoodType = ex.foodType !== null && ex.foodType !== "";
    const hasLocation = ex.location !== null && ex.location !== "";
    const hasPackaging = ex.packaging !== null && ex.packaging !== "";

    this.container.innerHTML = `
      <div class="quick-donate-container">
        <div class="structured-card">
          <div class="card-ai-badge-row">
            <div class="ai-extracted-tag">
              <div class="tag-sparkle-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <div>
                <div class="tag-label-main">AI EXTRACTED</div>
                <div class="tag-label-sub">Information identified from your message</div>
              </div>
            </div>

            <button class="btn-reedit-msg" id="btnBackToEditMsg">
              <span>← Edit Original Message</span>
            </button>
          </div>

          <!-- Multimodal Verified Food Manifest Banner -->
          <div class="ai-verified-photo-strip">
            <img src="assets/images/banquet_meals_packed.jpg" alt="120 Packed Vegetarian Catering Meals" class="ai-verified-thumb" />
            <div class="ai-verified-text-col">
              <div class="ai-verified-badge-row">
                <span class="ai-verified-badge-pill">● Multimodal Visual Verification</span>
                <span class="badge-tag badge-ready">HOT-HOLD PASS (>60°C)</span>
              </div>
              <div class="ai-verified-title">120 Packed Trays at Orchid Banquet Hall</div>
              <div class="ai-verified-sub">Sealed catering containers verified. FSSAI thermal window logged at 8:15 PM.</div>
            </div>
          </div>

          <div class="extracted-grid">
            <div class="field-cell ${!hasMeals ? 'needs-confirmation' : ''}">
              <div class="field-label-top"><span class="field-key-name">MEALS</span></div>
              ${renderFieldValue("meals", ex.meals)}
            </div>

            <div class="field-cell ${!hasFoodType ? 'needs-confirmation' : ''}">
              <div class="field-label-top"><span class="field-key-name">FOOD TYPE</span></div>
              ${renderFieldValue("foodType", ex.foodType)}
            </div>

            <div class="field-cell ${!hasPackaging ? 'needs-confirmation' : ''}">
              <div class="field-label-top"><span class="field-key-name">PACKAGING</span></div>
              ${renderFieldValue("packaging", ex.packaging)}
            </div>

            <div class="field-cell ${!ex.prepared ? 'needs-confirmation' : ''}">
              <div class="field-label-top"><span class="field-key-name">PREPARED</span></div>
              ${renderFieldValue("prepared", ex.prepared)}
            </div>

            <div class="field-cell ${!hasLocation ? 'needs-confirmation' : ''}">
              <div class="field-label-top"><span class="field-key-name">LOCATION</span></div>
              ${renderFieldValue("location", ex.location)}
            </div>

            <div class="field-cell ${!ex.availability ? 'needs-confirmation' : ''}">
              <div class="field-label-top"><span class="field-key-name">AVAILABILITY</span></div>
              ${renderFieldValue("availability", ex.availability)}
            </div>
          </div>

          <div class="before-matching-box">
            <div class="before-matching-title">Before matching</div>
            <div class="checklist-items">
              <div class="check-item">
                <span class="${hasMeals ? 'check-icon-pass' : 'check-icon-warn'}">${hasMeals ? '✓' : '⚠'}</span>
                <span>Quantity identified ${hasMeals ? `(${ex.meals} meals)` : '<em class="text-amber">— Needs confirmation</em>'}</span>
              </div>
              <div class="check-item">
                <span class="${hasFoodType ? 'check-icon-pass' : 'check-icon-warn'}">${hasFoodType ? '✓' : '⚠'}</span>
                <span>Food type identified ${hasFoodType ? `(${ex.foodType})` : '<em class="text-amber">— Needs confirmation</em>'}</span>
              </div>
              <div class="check-item">
                <span class="${hasLocation ? 'check-icon-pass' : 'check-icon-warn'}">${hasLocation ? '✓' : '⚠'}</span>
                <span>Pickup location identified ${hasLocation ? `(${ex.location})` : '<em class="text-amber">— Needs confirmation</em>'}</span>
              </div>
              <div class="check-item">
                <span class="${hasPackaging ? 'check-icon-pass' : 'check-icon-warn'}">${hasPackaging ? '✓' : '⚠'}</span>
                <span>Packaging identified ${hasPackaging ? `(${ex.packaging})` : '<em class="text-amber">— Needs confirmation</em>'}</span>
              </div>
              <div class="food-safety-toggle-row" id="safetyToggleBox">
                <input type="checkbox" id="chkFoodSafety" class="safety-checkbox" ${this.safetyConfirmed ? 'checked' : ''} />
                <label for="chkFoodSafety" class="safety-checkbox-label">
                  <span class="${this.safetyConfirmed ? 'check-icon-pass' : 'check-icon-warn'}">${this.safetyConfirmed ? '✓' : '⚠'}</span>
                  Food-safety information confirmed (Prepared hygienically within safe thermal window)
                </label>
              </div>
            </div>
          </div>

          <div class="compliance-notice-box">
            <svg class="notice-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div>
              MealBridge coordinates food donations. Food-safety decisions remain the responsibility of donors and receiving organizations and should follow applicable local guidance.
            </div>
          </div>

          <button class="cta-btn-primary" id="btnFindRecipients">
            <span>Find nearby recipients</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    this.bindReviewEvents();
  }

  bindReviewEvents() {
    const backBtn = document.getElementById("btnBackToEditMsg");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.state = "input";
        this.render();
      });
    }

    const chk = document.getElementById("chkFoodSafety");
    if (chk) {
      chk.addEventListener("change", (e) => {
        this.safetyConfirmed = e.target.checked;
        const findBtn = document.getElementById("btnFindRecipients");
        if (findBtn) {
          findBtn.style.opacity = this.safetyConfirmed ? "1" : "0.5";
        }
      });
    }

    this.container.querySelectorAll(".field-val-display").forEach(el => {
      el.addEventListener("click", () => {
        const fieldKey = el.getAttribute("data-field");
        const currentVal = this.extracted[fieldKey] || "";
        const parent = el.parentElement;

        const input = document.createElement("input");
        input.type = fieldKey === "meals" ? "number" : "text";
        input.className = "field-input-inline";
        input.value = currentVal;
        input.placeholder = `Enter ${fieldKey}...`;

        parent.innerHTML = `
          <div class="field-label-top">
            <span class="field-key-name">${fieldKey.toUpperCase()}</span>
          </div>
        `;
        parent.appendChild(input);
        input.focus();

        const saveVal = () => {
          const newVal = input.value.trim();
          this.extracted[fieldKey] = newVal ? (fieldKey === "meals" ? parseInt(newVal, 10) : newVal) : null;
          this.render();
        };

        input.addEventListener("blur", saveVal);
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") saveVal();
        });
      });
    });

    const findBtn = document.getElementById("btnFindRecipients");
    if (findBtn) {
      findBtn.addEventListener("click", () => {
        if (!this.safetyConfirmed) {
          alert("Please confirm the food safety verification checkbox before matching with nearby shelters.");
          return;
        }
        if (!this.extracted.meals) {
          alert("Please specify the number of meals.");
          return;
        }
        if (!this.extracted.location) {
          alert("Please enter the pickup location.");
          return;
        }

        // Show short transition
        this.state = "searching";
        this.render();

        setTimeout(() => {
          this.state = "matching";
          this.render();
        }, 1300);
      });
    }
  }

  // 4. TRANSITION STATE
  renderSearchingState() {
    this.container.innerHTML = `
      <div class="quick-donate-container">
        <div class="ai-processing-card">
          <div class="processing-radar-orb">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/><path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/>
            </svg>
          </div>
          <h2 class="processing-title">Finding the best recipient...</h2>
          <p class="processing-sub">
            Checking distance, capacity, dietary requirements and pickup availability...
          </p>

          <div class="processing-steps-mini">
            <span class="step-mini active">● Distance verification</span>
            <span class="step-mini active">● Stomach capacity audit</span>
            <span class="step-mini active">● Transport fleet availability</span>
          </div>
        </div>
      </div>
    `;
  }

  // 5. MATCHING SCREEN STATE
  renderMatchingState() {
    const ex = this.extracted;
    const meals = ex.meals || 120;
    const foodType = ex.foodType || "Vegetarian";
    const packaging = ex.packaging || "Packed";
    const location = ex.location || "Orchid Banquet Hall";
    const availability = ex.availability || "Ready now";

    this.container.innerHTML = `
      <div class="quick-donate-container matching-page-wrapper">
        <div class="matching-hero-banner">
          <div class="matching-hero-top">
            <div class="matching-title-area">
              <div class="qd-pill">
                <span class="status-pulse-dot"></span>
                <span>Smart Recipient Dispatch</span>
              </div>
              <h1>Find the right home for these meals</h1>
              <p>Verified shelters near ${location} ready to accept cooked surplus food.</p>
            </div>

            <!-- Prominent Urgency Indicator -->
            <div class="urgency-clock-card">
              <div class="clock-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div class="clock-info-col">
                <span class="clock-label">FOOD RESCUE CLOCK</span>
                <span class="clock-timer" id="matchingRescueTimer">42 min remaining</span>
                <span class="clock-disclaimer">Coordination deadline · Coordinates pickup window; does not determine biological food safety.</span>
              </div>
            </div>
          </div>

          <!-- Active Donation Summary Strip -->
          <div class="active-donation-summary-strip">
            <span class="summary-strip-label">ACTIVE DONATION:</span>
            <span class="summary-pill pill-meals">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/></svg>
              ${meals} meals
            </span>
            <span class="summary-pill">${foodType}</span>
            <span class="summary-pill">${packaging}</span>
            <span class="summary-pill">${location}</span>
            <span class="summary-pill">${availability}</span>
          </div>
        </div>

        <div class="matching-criteria-note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>Matching considers distance, recipient capacity, dietary compatibility and pickup availability.</span>
        </div>

        <!-- 4 Realistic NGO Options -->
        <div class="ngo-options-list">
          ${this.ngoOptions.map(ngo => this.renderNgoCard(ngo)).join('')}
        </div>
      </div>
    `;

    this.bindMatchingEvents();
  }

  renderNgoCard(ngo) {
    if (ngo.isRecommended) {
      // 1. Hope Shelter (Recommended match)
      return `
        <div class="ngo-card recommended-card" data-id="${ngo.id}">
          <div class="recommended-header-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>Recommended match</span>
          </div>

          <div class="ngo-card-top-row">
            <div>
              <h2 class="ngo-org-title">${ngo.name}</h2>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">Youth Shelter & Community Support</p>
            </div>
            <div class="ngo-dist-badge prominent-dist-badge">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <strong class="dist-num">${ngo.distance}</strong>
              <span class="dist-sub">away</span>
            </div>
          </div>

          <div class="ngo-specs-grid">
            <div class="ngo-spec-box">
              <span class="ngo-spec-k">CAN RECEIVE</span>
              <span class="ngo-spec-v text-pass">${ngo.canReceive} meals</span>
            </div>
            <div class="ngo-spec-box">
              <span class="ngo-spec-k">CURRENT NEED</span>
              <span class="ngo-spec-v">${ngo.need} meals</span>
            </div>
            <div class="ngo-spec-box">
              <span class="ngo-spec-k">DIETARY MATCH</span>
              <span class="ngo-spec-v text-pass">${ngo.dietaryMatch}</span>
            </div>
            <div class="ngo-spec-box">
              <span class="ngo-spec-k">PICKUP</span>
              <span class="ngo-spec-v text-pass">✓ ${ngo.pickup}</span>
            </div>
          </div>

          <div class="why-match-section">
            <div class="why-match-title">WHY THIS MATCH?</div>
            <ul class="why-match-list">
              ${ngo.whyPoints.map(pt => `
                <li class="why-match-item">
                  <span class="why-match-check">✓</span>
                  <span>${pt}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="ngo-card-actions">
            <div class="pickup-eta-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Estimated pickup: <strong>${ngo.estimatedPickup}</strong></span>
            </div>

            <button class="btn-select-ngo btn-select-recommended btn-trigger-select" data-id="${ngo.id}">
              <span>Select recipient</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      `;
    }

    // 2, 3, 4: Care Haven, Community Kitchen, Night Shelter Network
    return `
      <div class="ngo-card" data-id="${ngo.id}">
        <div class="ngo-card-top-row">
          <div>
            <h2 class="ngo-org-title">${ngo.name}</h2>
            <div class="ngo-dist-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${ngo.distance} away</span>
            </div>
          </div>
        </div>

        <div class="ngo-specs-grid">
          <div class="ngo-spec-box">
            <span class="ngo-spec-k">CAN RECEIVE</span>
            <span class="ngo-spec-v">${ngo.canReceive} meals</span>
          </div>
          <div class="ngo-spec-box">
            <span class="ngo-spec-k">CURRENT NEED</span>
            <span class="ngo-spec-v">${ngo.need} meals</span>
          </div>
          <div class="ngo-spec-box">
            <span class="ngo-spec-k">DIETARY MATCH</span>
            <span class="ngo-spec-v">${ngo.dietaryMatch}</span>
          </div>
          <div class="ngo-spec-box">
            <span class="ngo-spec-k">PICKUP</span>
            <span class="ngo-spec-v ${ngo.pickupAvailable ? 'text-pass' : 'text-warn'}">${ngo.pickupAvailable ? '✓ Available' : 'Not currently available'}</span>
          </div>
        </div>

        <div class="why-match-accordion">
          <div class="accordion-toggle" onclick="this.nextElementSibling.classList.toggle('hidden')">
            <span>Why this match?</span>
            <span>▾</span>
          </div>
          <div class="accordion-content">
            ${ngo.whyDetails}
          </div>
        </div>

        <div class="ngo-card-actions">
          <div class="pickup-eta-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Estimated pickup: <strong>${ngo.estimatedPickup}</strong></span>
          </div>

          <button class="btn-select-ngo btn-select-standard btn-trigger-select" data-id="${ngo.id}">
            <span>Select</span>
          </button>
        </div>
      </div>
    `;
  }

  bindMatchingEvents() {
    this.container.querySelectorAll(".btn-trigger-select").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        this.selectedShelter = this.ngoOptions.find(n => n.id === id) || this.ngoOptions[0];
        this.state = "confirming";
        this.render();
      });
    });
  }

  // 6. CONFIRMATION PANEL
  renderConfirmingState() {
    const s = this.selectedShelter || this.ngoOptions[0];
    const meals = this.extracted.meals || 120;
    const foodType = this.extracted.foodType || "Vegetarian";

    this.container.innerHTML = `
      <div class="quick-donate-container">
        <div class="confirmation-overlay-card">
          <div class="conf-pill-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>RECIPIENT SELECTED</span>
          </div>

          <h2 class="conf-shelter-title">${s.name}</h2>
          <p class="conf-distance">${s.distance} away · ${s.pickupAvailable ? 'Van Dispatch Ready' : 'Drop-off / Courier Needed'}</p>

          <div class="conf-summary-grid">
            <div class="conf-grid-item">
              <span class="conf-k">PORTIONS TO DONATE</span>
              <span class="conf-v text-emerald">${meals} Meals</span>
            </div>
            <div class="conf-grid-item">
              <span class="conf-k">DIETARY CLASSIFICATION</span>
              <span class="conf-v">${foodType}</span>
            </div>
            <div class="conf-grid-item">
              <span class="conf-k">ESTIMATED PICKUP</span>
              <span class="conf-v text-emerald font-bold">${s.estimatedPickup}</span>
            </div>
            <div class="conf-grid-item">
              <span class="conf-k">SHELTER CAPACITY</span>
              <span class="conf-v">${s.canReceive} meals</span>
            </div>
          </div>

          <div class="conf-btn-group">
            <button class="cta-btn-primary" id="btnConfirmDonation">
              <span>Confirm donation</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <button class="btn btn-secondary" style="border-radius: var(--radius-full); padding: 14px 22px;" id="btnCancelConfirmation">
              <span>Change</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindConfirmingEvents();
  }

  bindConfirmingEvents() {
    const confirmBtn = document.getElementById("btnConfirmDonation");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        this.trackingStage = "pickup_assigned";
        this.state = "matched";

        if (window.appState) {
          const s = this.selectedShelter || this.ngoOptions[0];
          const meals = this.extracted.meals || 120;
          window.appState.createDonation({
            title: `${meals} Meals Surplus (${this.extracted.foodType || 'Vegetarian'})`,
            donorName: this.extracted.location || "Orchid Banquet Hall",
            pickupLocation: this.extracted.location || "Orchid Banquet Hall",
            estimatedMeals: meals,
            dietary: this.extracted.foodType || "Vegetarian",
            foodType: this.extracted.packaging || "Packed",
            cookedAtTime: this.extracted.prepared || "8:15 PM",
            matchedNgoName: s.name,
            matchedNgoAddress: `${s.distance} away`,
            status: "pickup_assigned",
            statusStepIndex: 4
          });
        }

        this.render();
      });
    }

    const cancelBtn = document.getElementById("btnCancelConfirmation");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.state = "matching";
        this.render();
      });
    }
  }

  // 7. DONATION MATCHED STATE
  renderMatchedState() {
    const s = this.selectedShelter || this.ngoOptions[0];

    this.container.innerHTML = `
      <div class="quick-donate-container">
        <div class="donation-matched-card">
          <div class="matched-hero-icon">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <h2 class="matched-title">DONATION MATCHED</h2>
          <p class="matched-sub-message">Pickup is now being coordinated.</p>

          <div class="matched-checklist-box">
            <div class="matched-check-row">
              <span class="check-sym">✓</span>
              <span>Donation created</span>
            </div>
            <div class="matched-check-row">
              <span class="check-sym">✓</span>
              <span>Recipient matched (${s.name})</span>
            </div>
            <div class="matched-check-row">
              <span class="check-sym">✓</span>
              <span>${s.name} notified</span>
            </div>
          </div>

          <div class="matched-actions-row">
            <button class="cta-btn-primary" style="width: auto; padding: 14px 34px;" id="btnTrackPickup">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Track pickup</span>
            </button>
            <button class="btn btn-secondary" style="border-radius: var(--radius-full); padding: 14px 24px;" id="btnStartNewDonation">
              <span>+ Create another donation</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindMatchedEvents();
  }

  bindMatchedEvents() {
    const trackBtn = document.getElementById("btnTrackPickup");
    if (trackBtn) {
      trackBtn.addEventListener("click", () => {
        this.state = "tracking";
        this.render();
      });
    }

    const newBtn = document.getElementById("btnStartNewDonation");
    if (newBtn) {
      newBtn.addEventListener("click", () => {
        this.resetSession();
        this.render();
      });
    }
  }

  // 8. LIVE PICKUP TRACKING ("Rescue in progress")
  renderTrackingState() {
    const s = this.selectedShelter || this.ngoOptions[0];
    const meals = this.extracted.meals || 120;
    const foodType = this.extracted.foodType || "Vegetarian";
    const shelterName = s.name.toUpperCase();

    // Map stages to status text & badges
    let statusBadgeText = "Pickup confirmed";
    let pickupStatusText = "Driver assigned";
    let estArrivalText = "18 minutes";

    if (this.trackingStage === "driver_on_way") {
      statusBadgeText = "Driver on the way";
      pickupStatusText = "Van in transit";
      estArrivalText = "10 minutes";
    } else if (this.trackingStage === "picked_up") {
      statusBadgeText = "Food picked up";
      pickupStatusText = "Food secured in thermal hold";
      estArrivalText = "En route to shelter (8 mins)";
    } else if (this.trackingStage === "delivered") {
      statusBadgeText = "Delivered";
      pickupStatusText = "Delivered to kitchen";
      estArrivalText = "Arrived";
    }

    this.container.innerHTML = `
      <div class="quick-donate-container">
        <div class="rescue-tracking-card">
          <!-- Top Manifest Bar -->
          <div class="rescue-top-manifest">
            <div class="rescue-manifest-tags">
              <span class="manifest-hero-badge badge-meals-hero">${meals} MEALS</span>
              <span class="manifest-hero-badge badge-veg-hero">${foodType.toUpperCase()}</span>
              <span class="manifest-hero-badge badge-shelter-hero">${shelterName}</span>
            </div>

            <!-- Hackathon DEMO Mode Time Simulator -->
            <div class="demo-sim-bar" title="Simulate different countdown states for hackathon demonstration">
              <span class="demo-sim-label">DEMO TIMER:</span>
              <button class="demo-sim-btn" data-time="45">45 min</button>
              <button class="demo-sim-btn" data-time="20">20 min</button>
              <button class="demo-sim-btn" data-time="5">5 min</button>
              <button class="demo-sim-btn" data-time="0">Expired</button>
              <button class="demo-sim-btn ${this.isAutoSimulating ? 'btn-active-sim' : ''}" id="btnAutoSimRescue" style="${this.isAutoSimulating ? 'background-color:#059669; color:#FFFFFF; font-weight:700;' : 'background-color:#F0FDF4; color:#166534; font-weight:700; border-color:#86EFAC;'}" title="Real-time automated demonstration">
                ${this.isAutoSimulating ? '⏸ Pause Sim' : '⚡ Auto-Simulate'}
              </button>
            </div>
          </div>

          <!-- Prominent Countdown Banner -->
          <div class="rescue-countdown-banner ${this.isTimerExpired ? 'banner-critical' : ''}" id="rescueClockBanner">
            <div class="rc-title">FOOD RESCUE CLOCK</div>
            <div class="rc-timer-display" id="rescueCountdownLive">
              ${this.formatCountdownTime()}
            </div>
            <div class="rc-deadline-label" id="rescueDeadlineLabel">
              ${this.isTimerExpired ? 'Coordination window ended' : 'Coordination deadline'}
            </div>
            <div class="rc-safety-note">
              ${this.isTimerExpired 
                ? 'Follow applicable food-safety procedures before proceeding.' 
                : 'This is a coordination timer, not a determination of food safety. Follow applicable food-safety guidance.'}
            </div>
          </div>

          <!-- Status Changed Flash Banner (When Food Picked Up) -->
          ${this.trackingStage === "picked_up" ? `
            <div class="status-flash-banner">
              <span>✓ FOOD PICKED UP</span>
            </div>
          ` : ''}

          <!-- Visual Context Cards (WHAT, WHO, WHERE, STATUS) -->
          <div class="rescue-meta-summary-grid">
            <div class="meta-summary-box">
              <span class="meta-summary-k">WHAT</span>
              <strong class="meta-summary-v text-emerald">${meals} meals</strong>
              <span class="meta-summary-sub">${foodType} · ${this.extracted.packaging || 'Packed'}</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-summary-k">WHO</span>
              <strong class="meta-summary-v">${s.name}</strong>
              <span class="meta-summary-sub">${s.distance} away</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-summary-k">WHERE</span>
              <strong class="meta-summary-v">${this.extracted.location || 'Orchid Banquet Hall'}</strong>
              <span class="meta-summary-sub">Pickup location</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-summary-k">STATUS</span>
              <strong class="meta-summary-v" style="color: var(--primary-green); display: flex; align-items: center; gap: 6px;">
                <span class="status-pulse-dot"></span>
                <span>${statusBadgeText}</span>
              </strong>
              <span class="meta-summary-sub">${pickupStatusText}</span>
            </div>
          </div>

          <!-- Two-Column Main Layout: Timeline & Pickup Card -->
          <div class="rescue-grid-main">
            <!-- Progress Timeline -->
            <div class="timeline-card-box">
              <div class="timeline-box-title">RESCUE TIMELINE</div>

              <div class="vertical-progress-list">
                <!-- Step 1: Donation created -->
                <div class="prog-item">
                  <div class="prog-dot dot-done">✓</div>
                  <div class="prog-text-col">
                    <div class="prog-title-row">
                      <span class="prog-name">Donation created</span>
                      <span class="prog-time">9:42 PM</span>
                    </div>
                  </div>
                </div>

                <!-- Step 2: AI details confirmed -->
                <div class="prog-item">
                  <div class="prog-dot dot-done">✓</div>
                  <div class="prog-text-col">
                    <div class="prog-title-row">
                      <span class="prog-name">AI details confirmed</span>
                      <span class="prog-time">9:43 PM</span>
                    </div>
                  </div>
                </div>

                <!-- Step 3: Recipient matched -->
                <div class="prog-item">
                  <div class="prog-dot dot-done">✓</div>
                  <div class="prog-text-col">
                    <div class="prog-title-row">
                      <span class="prog-name">Recipient matched</span>
                      <span class="prog-time">9:44 PM</span>
                    </div>
                  </div>
                </div>

                <!-- Step 4: Pickup being coordinated / Driver on the way -->
                <div class="prog-item ${['pickup_assigned', 'driver_on_way'].includes(this.trackingStage) ? 'active' : ''}">
                  <div class="prog-dot ${['picked_up', 'delivered'].includes(this.trackingStage) ? 'dot-done' : 'dot-active'}">
                    ${['picked_up', 'delivered'].includes(this.trackingStage) ? '✓' : '●'}
                  </div>
                  <div class="prog-text-col">
                    <div class="prog-title-row">
                      <span class="prog-name">${this.trackingStage === 'driver_on_way' ? 'Driver on the way' : 'Pickup being coordinated'}</span>
                      <span class="prog-time">${['picked_up', 'delivered'].includes(this.trackingStage) ? '9:47 PM' : 'In progress'}</span>
                    </div>
                  </div>
                </div>

                <!-- Step 5: Food picked up -->
                <div class="prog-item ${this.trackingStage === 'picked_up' ? 'active' : ''}">
                  <div class="prog-dot ${this.trackingStage === 'delivered' ? 'dot-done' : (this.trackingStage === 'picked_up' ? 'dot-active' : 'dot-pending')}">
                    ${this.trackingStage === 'delivered' ? '✓' : (this.trackingStage === 'picked_up' ? '●' : '○')}
                  </div>
                  <div class="prog-text-col">
                    <div class="prog-title-row">
                      <span class="prog-name">Food picked up</span>
                      <span class="prog-time">${this.trackingStage === 'delivered' ? '9:58 PM' : (this.trackingStage === 'picked_up' ? 'In progress' : 'Pending')}</span>
                    </div>
                  </div>
                </div>

                <!-- Step 6: Delivered to shelter -->
                <div class="prog-item ${this.trackingStage === 'delivered' ? 'active' : ''}">
                  <div class="prog-dot ${this.trackingStage === 'delivered' ? 'dot-done' : 'dot-pending'}">
                    ${this.trackingStage === 'delivered' ? '✓' : '○'}
                  </div>
                  <div class="prog-text-col">
                    <div class="prog-title-row">
                      <span class="prog-name">Delivered to shelter</span>
                      <span class="prog-time">${this.trackingStage === 'delivered' ? '10:14 PM' : 'Pending'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pickup Card & Controls -->
            <div class="pickup-summary-col">
              <div class="pickup-hero-card">
                <div class="pickup-card-eyebrow">PICKUP</div>
                <h3 class="pickup-shelter-heading">${s.name}</h3>
                <div class="pickup-dist-text">${s.distance} away</div>

                <div class="pickup-status-row">
                  <span class="ps-label">Pickup status:</span>
                  <span class="ps-val text-emerald">${pickupStatusText}</span>
                </div>

                <div class="pickup-status-row">
                  <span class="ps-label">Estimated arrival:</span>
                  <span class="ps-val">${estArrivalText}</span>
                </div>

                <div class="pickup-confirmed-badge">
                  <span class="status-pulse-dot"></span>
                  <span>${statusBadgeText}</span>
                </div>

                <!-- Control Buttons & Popover -->
                <div class="pickup-controls-group">
                  <div class="update-status-dropdown-wrapper">
                    <button class="cta-btn-primary" id="btnToggleStatusMenu">
                      <span>Update status ▾</span>
                    </button>

                    ${this.showStatusDropdown ? `
                      <div class="status-dropdown-menu" id="statusDropdownMenu">
                        <button class="status-dropdown-item ${this.trackingStage === 'pickup_assigned' ? 'current-item' : ''}" data-stage="pickup_assigned">
                          <span>Pickup assigned</span>
                          ${this.trackingStage === 'pickup_assigned' ? '✓' : ''}
                        </button>
                        <button class="status-dropdown-item ${this.trackingStage === 'driver_on_way' ? 'current-item' : ''}" data-stage="driver_on_way">
                          <span>Driver on the way</span>
                          ${this.trackingStage === 'driver_on_way' ? '✓' : ''}
                        </button>
                        <button class="status-dropdown-item ${this.trackingStage === 'picked_up' ? 'current-item' : ''}" data-stage="picked_up">
                          <span>Food picked up</span>
                          ${this.trackingStage === 'picked_up' ? '✓' : ''}
                        </button>
                        <button class="status-dropdown-item ${this.trackingStage === 'delivered' ? 'current-item' : ''}" data-stage="delivered">
                          <span>Delivered</span>
                          ${this.trackingStage === 'delivered' ? '✓' : ''}
                        </button>
                      </div>
                    ` : ''}
                  </div>

                  <button class="btn btn-secondary" style="border-radius: var(--radius-full); padding: 12px; width: 100%;" id="btnOpenDetailsModal">
                    <span>View donation details</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Compact Activity Feed -->
          <div class="compact-feed-card">
            <div class="feed-card-title">ACTIVITY STREAM</div>
            <div class="feed-stream">
              ${this.activityLog.map(item => `
                <div class="feed-stream-item">
                  <span class="feed-timestamp">${item.time}</span>
                  <span class="feed-text">${item.text}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Donation Details Modal -->
        ${this.showDetailsModal ? this.renderDetailsModal() : ''}
      </div>
    `;

    this.bindTrackingEvents();
  }

  renderDetailsModal() {
    const ex = this.extracted;
    const s = this.selectedShelter || this.ngoOptions[0];

    return `
      <div class="modal-overlay" id="detailsModalOverlay">
        <div class="modal-content-card">
          <div class="modal-header-row">
            <h3 class="modal-title">Donation Manifest Details</h3>
            <button class="btn-close-modal" id="btnCloseDetailsModal">✕</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.9rem;">
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #E5E7EB; padding-bottom:6px;">
              <span class="text-muted">Portions:</span>
              <strong>${ex.meals || 120} Meals</strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #E5E7EB; padding-bottom:6px;">
              <span class="text-muted">Dietary Category:</span>
              <strong>${ex.foodType || 'Vegetarian'}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #E5E7EB; padding-bottom:6px;">
              <span class="text-muted">Packaging:</span>
              <strong>${ex.packaging || 'Packed'}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #E5E7EB; padding-bottom:6px;">
              <span class="text-muted">Cooked At:</span>
              <strong>${ex.prepared || '8:15 PM'}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #E5E7EB; padding-bottom:6px;">
              <span class="text-muted">Pickup Location:</span>
              <strong>${ex.location || 'Orchid Banquet Hall'}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #E5E7EB; padding-bottom:6px;">
              <span class="text-muted">Recipient Shelter:</span>
              <strong>${s.name} (${s.distance})</strong>
            </div>
          </div>

          <div style="margin-top: 24px;">
            <button class="cta-btn-primary" style="padding: 10px 20px; font-size: 0.95rem;" id="btnCloseDetailsModalBtn">
              Done
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindTrackingEvents() {
    // Dropdown toggle
    const toggleBtn = document.getElementById("btnToggleStatusMenu");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        this.showStatusDropdown = !this.showStatusDropdown;
        this.render();
      });
    }

    // Status selection items
    this.container.querySelectorAll(".status-dropdown-item").forEach(item => {
      item.addEventListener("click", () => {
        const stage = item.getAttribute("data-stage");
        this.showStatusDropdown = false;
        this.handleStatusChange(stage);
      });
    });

    // Details Modal triggers
    const openDetailsBtn = document.getElementById("btnOpenDetailsModal");
    if (openDetailsBtn) {
      openDetailsBtn.addEventListener("click", () => {
        this.showDetailsModal = true;
        this.render();
      });
    }

    const closeDetailsBtn = document.getElementById("btnCloseDetailsModal");
    const closeDetailsBtn2 = document.getElementById("btnCloseDetailsModalBtn");
    if (closeDetailsBtn) {
      closeDetailsBtn.addEventListener("click", () => {
        this.showDetailsModal = false;
        this.render();
      });
    }
    if (closeDetailsBtn2) {
      closeDetailsBtn2.addEventListener("click", () => {
        this.showDetailsModal = false;
        this.render();
      });
    }

    // Auto simulation toggle button
    const autoSimBtn = document.getElementById("btnAutoSimRescue");
    if (autoSimBtn) {
      autoSimBtn.addEventListener("click", () => {
        if (this.isAutoSimulating) {
          this.stopAutoSimulation();
        } else {
          this.startAutoSimulation();
        }
      });
    }

    // Hackathon Demo Simulator Buttons (45m, 20m, 5m, 0m)
    this.container.querySelectorAll(".demo-sim-btn:not(#btnAutoSimRescue)").forEach(btn => {
      btn.addEventListener("click", () => {
        const mins = parseInt(btn.getAttribute("data-time"), 10);
        if (mins === 0) {
          this.countdownSeconds = 0;
          this.isTimerExpired = true;
        } else {
          this.countdownSeconds = mins * 60;
          this.isTimerExpired = false;
        }
        this.render();
      });
    });
  }

  startAutoSimulation() {
    this.isAutoSimulating = true;
    const btn = document.getElementById("btnAutoSimRescue");
    if (btn) {
      btn.classList.add("btn-active-sim");
      btn.style.backgroundColor = "#059669";
      btn.style.color = "#FFFFFF";
      btn.innerHTML = `<span>⏸ Pause Sim</span>`;
    }

    window.appToast("⚡ Real-Time Auto-Simulation active: Watch rescue pipeline unfold!", "info");

    this.autoSimInterval = setInterval(() => {
      if (this.trackingStage === "pickup_assigned") {
        this.handleStatusChange("driver_on_way");
        window.appToast("Milestone: Driver Ramesh Kumar is on the way (MH-02-MB-4412)", "info");
      } else if (this.trackingStage === "driver_on_way") {
        this.handleStatusChange("picked_up");
        window.appToast("Milestone: 120 Meals Picked Up & Hot-Holding Temp Logged (63.8°C)", "success");
      } else if (this.trackingStage === "picked_up") {
        this.stopAutoSimulation();
        this.handleStatusChange("delivered");
        window.appToast("🎉 Milestone: Successfully Delivered to Hope Shelter!", "success");
      } else {
        this.stopAutoSimulation();
      }
    }, 5500);
  }

  stopAutoSimulation() {
    this.isAutoSimulating = false;
    if (this.autoSimInterval) {
      clearInterval(this.autoSimInterval);
      this.autoSimInterval = null;
    }
    const btn = document.getElementById("btnAutoSimRescue");
    if (btn) {
      btn.classList.remove("btn-active-sim");
      btn.style.backgroundColor = "#F0FDF4";
      btn.style.color = "#166534";
      btn.innerHTML = `<span>⚡ Auto-Simulate</span>`;
    }
  }

  handleStatusChange(newStage) {
    this.trackingStage = newStage;

    if (window.appState && window.appState.activeTrackingId) {
      const stepIdx = newStage === "picked_up" ? 5 : (newStage === "delivered" ? 6 : (newStage === "driver_on_way" ? 4 : 3));
      window.appState.updateDonationStatus(window.appState.activeTrackingId, newStage, {
        statusStepIndex: stepIdx
      });
    }

    // Append to activity log if not already there
    if (newStage === "driver_on_way" && !this.activityLog.some(l => l.text.includes("Driver on the way"))) {
      this.activityLog.push({ time: "9:51 PM", text: "Driver Ramesh on the way" });
    } else if (newStage === "picked_up" && !this.activityLog.some(l => l.text.includes("Food picked up"))) {
      this.activityLog.push({ time: "9:58 PM", text: "Food picked up & verified" });
    } else if (newStage === "delivered") {
      this.activityLog.push({ time: "10:14 PM", text: "Delivered to Hope Shelter" });
      // Transition to completed success state!
      setTimeout(() => {
        this.state = "completed";
        this.render();
      }, 400);
      return;
    }

    this.render();
  }

  // 9. DONATION COMPLETED SUCCESS STATE
  renderCompletedState() {
    const s = this.selectedShelter || this.ngoOptions[0];
    const meals = this.extracted.meals || 120;

    this.container.innerHTML = `
      <div class="quick-donate-container">
        <div class="donation-completed-hero">
          <div class="completed-check-badge">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <div class="completed-badge-pill">✓ DONATION COMPLETED</div>

          <div class="completed-hero-text-block">
            <div class="completed-meals-num">${meals} meals</div>
            <div class="completed-delivery-sub">successfully delivered to</div>
            <div class="completed-shelter-title">${s.name}</div>
          </div>

          <div class="completed-impact-pill">
            +${meals} meals rescued
          </div>

          <div class="completed-efficiency-sub">
            Rescue coordinated and delivered in 31 minutes
          </div>

          <div class="completed-btn-group">
            <button class="cta-btn-primary" style="width: auto; padding: 14px 32px;" id="btnViewImpact">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span>View impact</span>
            </button>
            <button class="btn btn-secondary" style="border-radius: var(--radius-full); padding: 14px 24px;" id="btnNewDonationCompleted">
              <span>+ Create another donation</span>
            </button>
          </div>
        </div>

        <!-- Impact Modal -->
        ${this.showImpactModal ? this.renderImpactModal() : ''}
      </div>
    `;

    this.bindCompletedEvents();
  }

  renderImpactModal() {
    const meals = this.extracted.meals || 120;
    const s = this.selectedShelter || this.ngoOptions[0];

    return `
      <div class="modal-overlay" id="impactModalOverlay">
        <div class="modal-content-card">
          <div class="modal-header-row">
            <h3 class="modal-title">Rescue Impact Summary</h3>
            <button class="btn-close-modal" id="btnCloseImpactModal">✕</button>
          </div>

          <div style="background-color: #F0FDF4; border: 1px solid #DCFCE7; border-radius: var(--radius-md); padding: 18px; margin-bottom: 20px;">
            <div style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800; color: #166534; line-height: 1;">
              +${meals} Meals
            </div>
            <div style="font-size: 0.85rem; color: #14532D; font-weight: 600; margin-top: 4px;">
              Nourishment provided tonight at ${s.name}
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.88rem; margin-bottom: 24px;">
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #E5E7EB; padding-bottom:6px;">
              <span class="text-muted">Carbon Emission Prevented:</span>
              <strong>15.4 kg CO₂ equivalent</strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #E5E7EB; padding-bottom:6px;">
              <span class="text-muted">Landfill Waste Diverted:</span>
              <strong>52.8 kg cooked food</strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #E5E7EB; padding-bottom:6px;">
              <span class="text-muted">FSSAI Chain-of-Custody:</span>
              <strong class="text-emerald">✓ Verified Safe</strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #E5E7EB; padding-bottom:6px;">
              <span class="text-muted">Tax Exemption:</span>
              <strong>80G Digital Receipt Logged</strong>
            </div>
          </div>

          <button class="cta-btn-primary" style="padding: 10px 20px; font-size: 0.95rem;" id="btnCloseImpactModalBtn">
            Close Summary
          </button>
        </div>
      </div>
    `;
  }

  bindCompletedEvents() {
    const impactBtn = document.getElementById("btnViewImpact");
    if (impactBtn) {
      impactBtn.addEventListener("click", () => {
        this.showImpactModal = true;
        this.render();
      });
    }

    const closeImpactBtn = document.getElementById("btnCloseImpactModal");
    const closeImpactBtn2 = document.getElementById("btnCloseImpactModalBtn");
    if (closeImpactBtn) {
      closeImpactBtn.addEventListener("click", () => {
        this.showImpactModal = false;
        this.render();
      });
    }
    if (closeImpactBtn2) {
      closeImpactBtn2.addEventListener("click", () => {
        this.showImpactModal = false;
        this.render();
      });
    }

    const newBtn = document.getElementById("btnNewDonationCompleted");
    if (newBtn) {
      newBtn.addEventListener("click", () => {
        this.resetSession();
        this.render();
      });
    }
  }

  // Ticking countdown logic
  formatCountdownTime() {
    if (this.isTimerExpired || this.countdownSeconds <= 0) {
      return "00m 00s remaining";
    }
    const mins = Math.floor(this.countdownSeconds / 60);
    const secs = this.countdownSeconds % 60;
    return `${mins}m ${String(secs).padStart(2, '0')}s remaining`;
  }

  startCountdownTimer() {
    this.stopCountdownTimer();

    this.timerInterval = setInterval(() => {
      if (this.countdownSeconds <= 0) {
        this.isTimerExpired = true;
        this.stopCountdownTimer();
        const display = document.getElementById("rescueCountdownLive");
        if (display) display.textContent = "00m 00s remaining";
        const label = document.getElementById("rescueDeadlineLabel");
        if (label) label.textContent = "Coordination window ended";
        const banner = document.getElementById("rescueClockBanner");
        if (banner) banner.classList.add("banner-critical");
        return;
      }

      this.countdownSeconds -= 1;
      const display = document.getElementById("rescueCountdownLive");
      if (display) {
        display.textContent = this.formatCountdownTime();
      }
    }, 1000);
  }

  stopCountdownTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  destroy() {
    this.stopCountdownTimer();
    this.stopAutoSimulation();
    this.saveSession();
  }
}

window.QuickDonateController = QuickDonateController;
