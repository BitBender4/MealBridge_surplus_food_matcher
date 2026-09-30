/**
 * MealBridge Reactive State Management
 * Provides centralized reactive store with localStorage persistence & event emitters
 */

class MealBridgeState {
  constructor() {
    this.STORAGE_KEY = "mealbridge_state_v2_andheri";
    this.listeners = new Map();
    this.init();
  }

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.donations = parsed.donations || SEED_DATA.initialDonations;
        this.currentRole = parsed.currentRole || "donor";
        this.currentView = parsed.currentView || "home";
        this.activeTrackingId = parsed.activeTrackingId || "MB-2026-894";
      } catch (e) {
        console.warn("Could not parse saved state, using seed data", e);
        this.resetToSeed();
      }
    } else {
      this.resetToSeed();
    }

    this.initRealtimeSync();
  }

  initRealtimeSync() {
    // Listen for cross-tab events from window.realtimeBus
    if (typeof window !== "undefined") {
      // Delay slightly until realtimeBus is attached
      setTimeout(() => {
        if (!window.realtimeBus) return;

        window.realtimeBus.subscribe("DONATION_CREATED", (newDonation) => {
          if (!this.donations.some(d => d.id === newDonation.id)) {
            this.donations.unshift(newDonation);
            this.save();
            this.emit("donations:updated", { donations: this.donations, created: newDonation });
            if (window.realtimeAlert) {
              window.realtimeAlert(
                "⚡ New Surplus Available",
                `${newDonation.donorName} posted ${newDonation.estimatedMeals} meals (${newDonation.dietary})`,
                { type: "success", icon: "🍱" }
              );
            }
          }
        });

        window.realtimeBus.subscribe("DONATION_STATUS_CHANGED", ({ donation, newStatus, extraData }) => {
          const existing = this.getDonationById(donation.id);
          if (existing) {
            existing.status = newStatus;
            if (donation.statusStepIndex !== undefined) existing.statusStepIndex = donation.statusStepIndex;
            if (extraData) Object.assign(existing, extraData);
            this.save();
            this.emit("donation:status_changed", { donation: existing, newStatus });
            this.emit("donations:updated", { donations: this.donations });
            if (window.realtimeAlert) {
              window.realtimeAlert(
                "⚡ Status Updated",
                `${existing.title}: Milestone -> ${newStatus.toUpperCase().replace('_', ' ')}`,
                { type: "info", icon: "🚚" }
              );
            }
          }
        });
      }, 50);
    }
  }

  resetToSeed() {
    this.donations = JSON.parse(JSON.stringify(SEED_DATA.initialDonations));
    this.currentRole = "donor";
    this.currentView = "home";
    this.activeTrackingId = "MB-2026-894";
    this.save();
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        donations: this.donations,
        currentRole: this.currentRole,
        currentView: this.currentView,
        activeTrackingId: this.activeTrackingId
      }));
    } catch (e) {
      console.warn("Failed to persist state", e);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => {
      const arr = this.listeners.get(event) || [];
      const idx = arr.indexOf(callback);
      if (idx !== -1) arr.splice(idx, 1);
    };
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in listener for ${event}:`, err);
        }
      });
    }
  }

  setView(view, role = null) {
    this.currentView = view;
    if (role) {
      this.currentRole = role;
    }
    this.save();
    this.emit("view:changed", { view: this.currentView, role: this.currentRole });
  }

  setRole(role) {
    this.currentRole = role;
    // Map role to default view
    if (role === "donor") {
      this.currentView = "donor";
    } else if (role === "ngo") {
      this.currentView = "ngo";
    } else if (role === "admin") {
      this.currentView = "admin";
    }
    this.save();
    this.emit("role:changed", { role: this.currentRole, view: this.currentView });
    this.emit("view:changed", { view: this.currentView, role: this.currentRole });
  }

  getDonations() {
    return this.donations;
  }

  getDonationById(id) {
    return this.donations.find(d => d.id === id) || null;
  }

  getActiveTrackingDonation() {
    return this.getDonationById(this.activeTrackingId) || this.donations[0];
  }

  setActiveTrackingId(id) {
    this.activeTrackingId = id;
    this.save();
    this.emit("tracking:selected", { id });
  }

  createDonation(donationData) {
    const id = "MB-" + new Date().getFullYear() + "-" + Math.floor(100 + Math.random() * 900);
    const newDonation = {
      id,
      title: donationData.title || `${donationData.estimatedMeals || 100} Meals Surplus Donation`,
      donorId: "donor-orchid",
      donorName: donationData.donorName || "Orchid Banquet & Convention Hall",
      donorAddress: donationData.pickupLocation || "New Link Road, Andheri West, Mumbai",
      donorContact: donationData.donorContact || "+91 98200 12845",
      estimatedMeals: Number(donationData.estimatedMeals) || 100,
      dietary: donationData.dietary || "Vegetarian",
      foodType: donationData.foodType || "Fresh Cooked Buffet Surplus",
      foodItems: donationData.foodItems || ["Main Course Buffet", "Rice & Gravy", "Assorted Breads"],
      cookedAtTime: donationData.cookedAtTime || "Recently (Within 1 hour)",
      cookedTimestamp: donationData.cookedTimestamp || Date.now(),
      expiryHoursTotal: donationData.expiryHoursTotal || 4.0,
      expiryTimestamp: donationData.expiryTimestamp || (Date.now() + 3.5 * 3600 * 1000),
      packagingStatus: donationData.packagingStatus || "Packed in hygienic catering containers",
      pickupLocation: donationData.pickupLocation || "Kitchen Loading Bay, Orchid Banquet, Andheri West",
      locationCoords: donationData.locationCoords || { lat: 19.1352, lng: 72.8335 },
      specialNotes: donationData.specialNotes || "Handle with care, keep warm.",
      status: donationData.status || "matched", // created -> verified -> matched -> accepted -> pickup_assigned -> picked_up -> delivered
      statusStepIndex: donationData.statusStepIndex !== undefined ? donationData.statusStepIndex : 2,
      matchedNgoId: donationData.matchedNgoId || "ngo-hope-haven",
      matchedNgoName: donationData.matchedNgoName || "Hope Haven Children's Home",
      matchedNgoAddress: donationData.matchedNgoAddress || "14, JP Road, Andheri West (1.4 km)",
      assignedDriver: donationData.assignedDriver || {
        name: "Ramesh Kumar",
        phone: "+91 98201 55670",
        vehicle: "Insulated Van (MH-02-MB-4412)",
        etaMinutes: 12,
        currentTempLog: "63.5°C (Safe thermal hold)"
      },
      confidence: donationData.confidence || 95,
      aiExtractionSummary: donationData.aiExtractionSummary || "AI verified safe 4-hour window and matched nearest eligible shelter."
    };

    this.donations.unshift(newDonation);
    this.activeTrackingId = id;
    this.save();
    this.emit("donations:updated", { donations: this.donations, created: newDonation });

    if (window.realtimeBus) {
      window.realtimeBus.broadcast("DONATION_CREATED", newDonation);
    }
    return newDonation;
  }

  updateDonationStatus(id, newStatus, extraData = {}) {
    const donation = this.getDonationById(id);
    if (!donation) return null;

    const STATUS_STEPS = [
      "created",
      "verified",
      "matched",
      "accepted",
      "pickup_assigned",
      "picked_up",
      "delivered"
    ];

    donation.status = newStatus;
    const stepIdx = STATUS_STEPS.indexOf(newStatus);
    if (stepIdx !== -1) {
      donation.statusStepIndex = stepIdx;
    }

    Object.assign(donation, extraData);
    this.save();
    this.emit("donation:status_changed", { donation, newStatus });
    this.emit("donations:updated", { donations: this.donations });

    if (window.realtimeBus) {
      window.realtimeBus.broadcast("DONATION_STATUS_CHANGED", { donation, newStatus, extraData });
    }
    return donation;
  }

  advanceDonationStage(id) {
    const donation = this.getDonationById(id);
    if (!donation) return null;

    const STATUS_STEPS = [
      "created",
      "verified",
      "matched",
      "accepted",
      "pickup_assigned",
      "picked_up",
      "delivered"
    ];

    let currentIdx = STATUS_STEPS.indexOf(donation.status);
    if (currentIdx === -1) currentIdx = donation.statusStepIndex || 0;

    if (currentIdx < STATUS_STEPS.length - 1) {
      const nextStatus = STATUS_STEPS[currentIdx + 1];
      const extra = {};

      if (nextStatus === "accepted") {
        if (!donation.matchedNgoName) {
          const ngo = SEED_DATA.shelters[0];
          extra.matchedNgoId = ngo.id;
          extra.matchedNgoName = ngo.name;
          extra.matchedNgoAddress = `${ngo.address} (${ngo.distanceKm} km)`;
        }
      } else if (nextStatus === "pickup_assigned") {
        extra.assignedDriver = {
          name: "Ramesh Kumar",
          phone: "+91 98201 55670",
          vehicle: "Insulated Van (MH-02-MB-4412)",
          etaMinutes: 10,
          currentTempLog: "64.1°C (Safe hot-holding verified)"
        };
      } else if (nextStatus === "picked_up") {
        if (extra.assignedDriver) extra.assignedDriver.etaMinutes = 6;
        extra.pickupCompletedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (nextStatus === "delivered") {
        extra.deliveredAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        extra.temperatureAtDelivery = "62.8°C verified safe";
      }

      return this.updateDonationStatus(id, nextStatus, extra);
    }
    return donation;
  }

  acceptDonationAsNgo(donationId, ngoId) {
    const ngo = SEED_DATA.shelters.find(s => s.id === ngoId) || SEED_DATA.shelters[0];
    const updated = this.updateDonationStatus(donationId, "accepted", {
      matchedNgoId: ngo.id,
      matchedNgoName: ngo.name,
      matchedNgoAddress: `${ngo.address} (${ngo.distanceKm} km)`,
      assignedDriver: {
        name: ngo.driverName,
        phone: ngo.driverPhone,
        vehicle: `${ngo.pickupCapability} (${ngo.vehiclePlate})`,
        etaMinutes: ngo.estimatedPickupMinutes,
        currentTempLog: "63.9°C"
      }
    });

    return updated;
  }

  getMetrics() {
    const active = this.donations.filter(d => !["delivered", "cancelled"].includes(d.status));
    const now = Date.now();
    const urgent = this.donations.filter(d => {
      const remainingMs = d.expiryTimestamp - now;
      return remainingMs > 0 && remainingMs < (90 * 60 * 1000) && d.status !== "delivered";
    });
    const completed = this.donations.filter(d => d.status === "delivered");
    const totalMealsRescued = this.donations.reduce((acc, d) => acc + (d.estimatedMeals || 0), 0);

    return {
      activeCount: active.length,
      urgentCount: urgent.length,
      completedCount: completed.length,
      totalMealsRescued: 5400 + totalMealsRescued
    };
  }
}

// Global instance
window.appState = new MealBridgeState();
