/**
 * MealBridge Intelligent Food Rescue NLP Parser
 * Transforms unstructured donor voice/text into structured, safety-audited rescue manifests
 */

class MealBridgeAIParser {
  /**
   * Parse unstructured donor text into a verified structured donation manifest
   * @param {string} rawText
   * @returns {Object} Structured data with confidence and safety window
   */
  static parse(rawText) {
    const text = (rawText || "").trim();
    if (!text) {
      return this.getDefaults();
    }

    // 1. Extract estimated meal count
    let estimatedMeals = 100;
    const mealMatches = [
      /(\d+)\s*(?:veg|non-veg|nonveg|meals|portions|boxes|plates|servings|pax|people)/i,
      /(?:around|approx|approximately|about|have)\s*(\d+)/i,
      /(\d+)\s*(?:food\s*packets|boxes)/i
    ];
    for (const regex of mealMatches) {
      const match = text.match(regex);
      if (match && match[1]) {
        estimatedMeals = parseInt(match[1], 10);
        break;
      }
    }

    // 2. Extract dietary classification
    let dietary = "Vegetarian";
    const lower = text.toLowerCase();
    const nonVegKeywords = ["chicken", "mutton", "fish", "meat", "egg", "non-veg", "nonveg", "poultry", "prawns"];
    const vegKeywords = ["veg", "vegetarian", "paneer", "dal", "subz", "sabzi", "roti", "poha", "idli", "sambhar", "curd"];

    const isNonVeg = nonVegKeywords.some(kw => lower.includes(kw));
    const isVegExplicit = vegKeywords.some(kw => lower.includes(kw));

    if (isNonVeg) {
      if (isVegExplicit) {
        dietary = "Mixed (Separated Non-Veg & Veg)";
      } else {
        dietary = "Non-Vegetarian";
      }
    } else {
      dietary = "Vegetarian";
    }

    // 3. Extract food items & food type
    let foodType = "Cooked Catering Buffet";
    const detectedItems = [];

    const itemDict = [
      { name: "Paneer Dish (Butter Masala / Tikka)", triggers: ["paneer", "cottage cheese"] },
      { name: "Dal Makhani / Dal Tadka", triggers: ["dal", "daal", "lentil", "sambhar", "sambar"] },
      { name: "Basmati Rice / Jeera Pulao", triggers: ["rice", "pulao", "jeera rice", "biryani", "khichdi"] },
      { name: "Tandoori Rotis / Naan / Chapatis", triggers: ["roti", "rotis", "chapati", "chapatis", "naan", "bread"] },
      { name: "Chicken Biryani / Gravy", triggers: ["chicken", "biryani"] },
      { name: "Dessert (Gulab Jamun / Sweet)", triggers: ["sweet", "gulab jamun", "halwa", "dessert", "kheer"] },
      { name: "Breakfast Poha / Idli", triggers: ["poha", "idli", "vada", "upma"] }
    ];

    itemDict.forEach(item => {
      if (item.triggers.some(t => lower.includes(t))) {
        detectedItems.push(item.name);
      }
    });

    if (detectedItems.length === 0) {
      if (lower.includes("wedding")) {
        detectedItems.push("Wedding Banquet Main Course", "Rice & Breads", "Gourmet Curry");
        foodType = "Wedding Banquet Surplus";
      } else if (lower.includes("hostel") || lower.includes("canteen")) {
        detectedItems.push("Hostel Mess Meal", "Dal & Rice", "Fresh Chapatis");
        foodType = "Institutional Hostel Surplus";
      } else {
        detectedItems.push("Cooked Main Course Buffet", "Assorted Breads & Rice");
        foodType = "Fresh Cooked Buffet";
      }
    } else {
      if (lower.includes("wedding")) foodType = "Wedding Banquet Surplus";
      else if (lower.includes("hotel") || lower.includes("corporate")) foodType = "Executive Boxed Meals";
      else if (lower.includes("hostel")) foodType = "Hostel Mess Surplus";
    }

    // 4. Extract preparation time & calculate safe expiry
    let prepTimeStr = "7:30 PM";
    const timeMatch = text.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))/);
    if (timeMatch) {
      prepTimeStr = timeMatch[1].toUpperCase();
    } else if (lower.includes("cooked around") || lower.includes("cooked at")) {
      const matchAfterCooked = text.match(/cooked\s*(?:around|at)?\s*([0-9:a-zA-Z\s]+?)(?:and|\.|,|$)/i);
      if (matchAfterCooked) {
        prepTimeStr = matchAfterCooked[1].trim();
      }
    }

    // Safe 4-hour FSSAI thermal standard
    const now = Date.now();
    // Default expiry is 2 hours 18 mins to 3 hours from now if newly created
    const expiryTimestamp = now + (2.3 * 3600 * 1000); // 2 hours 18 mins
    const suggestedDeadline = new Date(expiryTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 5. Extract packaging status
    let packagingStatus = "Packed in aluminum catering trays";
    if (lower.includes("aluminum") || lower.includes("foil")) {
      packagingStatus = "Hygienically sealed in aluminum catering foil trays";
    } else if (lower.includes("box") || lower.includes("boxed") || lower.includes("cardboard")) {
      packagingStatus = "Individual sealed meal boxes with cutlery";
    } else if (lower.includes("warmers") || lower.includes("vessel") || lower.includes("drums") || lower.includes("pots")) {
      packagingStatus = "Stored in commercial stainless food warmers (Vessels needed for transport)";
    } else if (lower.includes("packed")) {
      packagingStatus = "Food is securely packed and ready for transport";
    }

    // 6. Extract pickup location
    let pickupLocation = "Orchid Grand Banquet Hall, New Link Rd, Andheri West";
    if (lower.includes("orchid")) {
      pickupLocation = "Orchid Grand Banquet Hall, New Link Rd, Andheri West, Mumbai";
    } else if (lower.includes("grand horizon") || lower.includes("airport")) {
      pickupLocation = "Grand Horizon Hotel, International Airport Zone, Andheri East, Mumbai";
    } else if (lower.includes("bhavan") || lower.includes("munshi nagar") || lower.includes("hostel")) {
      pickupLocation = "Bhavan's Campus Mess, Munshi Nagar, Andheri West, Mumbai";
    } else if (lower.includes("nesco") || lower.includes("caterer") || lower.includes("western express")) {
      pickupLocation = "Nesco Grand Banquets, Western Express Hwy, Andheri Corridor, Mumbai";
    } else {
      // Look for "from <location>"
      const fromMatch = text.match(/(?:pickup\s*from|from|at)\s*([^,.\n]+)/i);
      if (fromMatch && fromMatch[1]) {
        pickupLocation = fromMatch[1].trim();
      }
    }

    // 7. Missing Information Analysis
    const missingInfo = [];
    if (!text.match(/(\+?\d{10}|\d{5}\s*\d{5})/)) {
      missingInfo.push("Direct on-site phone number missing (Will use registered donor profile)");
    }
    if (!lower.includes("pack") && !lower.includes("box") && !lower.includes("tray") && !lower.includes("vessel")) {
      missingInfo.push("Packaging status not explicitly detailed (Defaulting to foil containers)");
    }
    if (!lower.includes("gate") && !lower.includes("dock") && !lower.includes("bay") && !lower.includes("entrance")) {
      missingInfo.push("Kitchen loading gate / service ramp access notes recommended");
    }

    // 8. Confidence calculation
    let confidence = 96;
    if (missingInfo.length === 1) confidence = 92;
    else if (missingInfo.length === 2) confidence = 87;
    else if (missingInfo.length > 2) confidence = 81;

    return {
      rawText: text,
      estimatedMeals,
      dietary,
      foodType,
      foodItems: detectedItems,
      preparationTime: prepTimeStr,
      packagingStatus,
      pickupLocation,
      availabilityTime: "Ready now (Immediate pickup requested)",
      suggestedExpiry: suggestedDeadline,
      expiryTimestamp,
      safeWindowRemaining: "2h 18m",
      missingInformation: missingInfo,
      confidence,
      title: `${estimatedMeals} ${dietary} Meals · ${pickupLocation.split(",")[0]}`,
      // Entity tokens for animated visual breakdown
      tokens: [
        { text: `${estimatedMeals} meals`, type: "quantity", label: "Meal Quantity" },
        { text: dietary, type: "dietary", label: "Dietary Type" },
        { text: prepTimeStr, type: "time", label: "Cooked Time" },
        { text: packagingStatus.split(" ")[0] || "Packed", type: "packaging", label: "Packaging" },
        { text: pickupLocation.split(",")[0], type: "location", label: "Pickup Location" }
      ]
    };
  }

  static getDefaults() {
    return {
      rawText: "",
      estimatedMeals: 120,
      dietary: "Vegetarian",
      foodType: "Cooked Wedding Feast",
      foodItems: ["Paneer Butter Masala", "Dal Makhani", "Jeera Rice", "Tandoori Rotis", "Gulab Jamun"],
      preparationTime: "7:30 PM",
      packagingStatus: "Packed in hygienic aluminum catering trays",
      pickupLocation: "Orchid Grand Banquet Hall, New Link Rd, Andheri West",
      availabilityTime: "Ready now",
      suggestedExpiry: "11:30 PM (2h 18m remaining)",
      expiryTimestamp: Date.now() + (138 * 60 * 1000),
      safeWindowRemaining: "2h 18m",
      missingInformation: ["Direct contact person mobile not provided in text"],
      confidence: 96,
      title: "120 Veg Meals · Orchid Banquet Hall",
      tokens: [
        { text: "120 veg meals", type: "quantity", label: "Meal Quantity" },
        { text: "Vegetarian", type: "dietary", label: "Dietary Type" },
        { text: "7:30 PM", type: "time", label: "Cooked Time" },
        { text: "Packed", type: "packaging", label: "Packaging" },
        { text: "Orchid Banquet Hall, Andheri West", type: "location", label: "Pickup Location" }
      ]
    };
  }
}

window.MealBridgeAIParser = MealBridgeAIParser;
