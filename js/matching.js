/**
 * MealBridge Smart NGO Matching Engine
 * Ranks nearby shelters based on proximity, capacity fit, transport velocity, and dietary alignment
 * Presents transparent "Match Suitability" with clear factor breakdowns
 */

class MealBridgeMatcher {
  /**
   * Rank shelters for a given donation manifest
   * @param {Object} donation 
   * @param {Array} shelters 
   * @returns {Array} Ranked shelters with suitability scores and factor breakdowns
   */
  static rankShelters(donation, shelters = SEED_DATA.shelters) {
    const mealCount = donation.estimatedMeals || 100;
    const isVeg = (donation.dietary || "").toLowerCase().includes("veg") && !(donation.dietary || "").toLowerCase().includes("non-veg");

    const scored = shelters.map(shelter => {
      // 1. Proximity score (Max 35 pts)
      // <= 2km: 35, <= 4km: 28, <= 6km: 20, >6km: 12
      let proximityScore = 35;
      if (shelter.distanceKm > 5) proximityScore = 18;
      else if (shelter.distanceKm > 3.5) proximityScore = 26;
      else if (shelter.distanceKm > 2) proximityScore = 31;

      // 2. Capacity & Demand fit (Max 30 pts)
      // Ideal ratio: mealCount / shelter.capacity ~ 0.7 to 1.0
      const diff = Math.abs(shelter.capacity - mealCount);
      let capacityScore = 30;
      if (diff > 100) capacityScore = 16;
      else if (diff > 50) capacityScore = 22;
      else if (diff > 25) capacityScore = 27;

      // 3. Transport readiness (Max 25 pts)
      let transportScore = 24;
      if (shelter.pickupCapability.includes("Insulated Van")) transportScore = 25;
      else if (shelter.pickupCapability.includes("Bikes")) transportScore = 22;
      else if (shelter.pickupCapability.includes("Rickshaw")) transportScore = 20;

      // 4. Dietary compatibility (Max 10 pts)
      let dietaryScore = 10;
      if (shelter.strictlyVeg && !isVeg) {
        dietaryScore = 0; // Incompatible with strict veg shelter!
      } else if (!shelter.strictlyVeg && isVeg) {
        dietaryScore = 10; // Everyone accepts veg
      }

      // Total suitability percentage
      const totalScore = proximityScore + capacityScore + transportScore + dietaryScore;

      // Factor breakdown in percentages (0-100 scale for UI progress bars)
      const factorPercentages = {
        proximity: Math.round((proximityScore / 35) * 100),
        capacityFit: Math.round((capacityScore / 30) * 100),
        transportReadiness: Math.round((transportScore / 25) * 100),
        dietaryMatch: Math.round((dietaryScore / 10) * 100)
      };

      // Construct plain-English explanation
      let reason = `${shelter.distanceKm} km away (${shelter.estimatedPickupMinutes}m ETA). `;
      if (diff <= 25) {
        reason += `Strong capacity match for ${mealCount} meals (${shelter.currentOccupants} people waiting). `;
      } else {
        reason += `Can absorb ${Math.min(mealCount, shelter.capacity)} of ${mealCount} meals. `;
      }
      reason += `${shelter.pickupCapability} ready to roll.`;

      return {
        ...shelter,
        suitabilityScore: totalScore,
        factorPercentages,
        customReason: reason,
        isStrictDietaryBlock: shelter.strictlyVeg && !isVeg
      };
    });

    // Sort descending by suitability score, putting compatible shelters first
    return scored.sort((a, b) => {
      if (a.isStrictDietaryBlock && !b.isStrictDietaryBlock) return 1;
      if (!a.isStrictDietaryBlock && b.isStrictDietaryBlock) return -1;
      return b.suitabilityScore - a.suitabilityScore;
    });
  }
}

window.MealBridgeMatcher = MealBridgeMatcher;
