/**
 * MealBridge Realistic Seed Dataset
 * Realistic data tailored for urban food rescue operations
 */

const SEED_DATA = {
  donors: [
    {
      id: "donor-orchid",
      name: "Orchid Banquet & Convention Hall",
      type: "Wedding & Event Hall",
      address: "New Link Road, Veera Desai Industrial Area, Andheri West, Mumbai",
      lat: 19.1352,
      lng: 72.8335,
      contactPerson: "Rajesh Varma (Banquet Lead)",
      phone: "+91 98200 12845",
      fssaiLicense: "FSSAI-11223344556677",
      totalRescuedMeals: 3420,
      activeRating: 4.9
    },
    {
      id: "donor-grand-horizon",
      name: "Grand Horizon Hotel & Suites",
      type: "5-Star Hotel & Kitchen",
      address: "Chhatrapati Shivaji International Airport Zone, Andheri East, Mumbai",
      lat: 19.1025,
      lng: 72.8755,
      contactPerson: "Chef Anand Nair",
      phone: "+91 98210 99421",
      fssaiLicense: "FSSAI-22334455667788",
      totalRescuedMeals: 2150,
      activeRating: 4.95
    },
    {
      id: "donor-st-jude",
      name: "Bhavan's Campus Student Mess & Canteen",
      type: "Institutional Campus Canteen",
      address: "Munshi Nagar, Bhavans College Rd, Andheri West, Mumbai",
      lat: 19.1240,
      lng: 72.8390,
      contactPerson: "Joseph Fernandes (Warden)",
      phone: "+91 98190 33211",
      fssaiLicense: "FSSAI-33445566778899",
      totalRescuedMeals: 1840,
      activeRating: 4.8
    },
    {
      id: "donor-saffron-valley",
      name: "Nesco Grand Banquets & Caterers",
      type: "Exhibition & Corporate Caterer",
      address: "Western Express Highway, Goregaon-Andheri Corridor, Mumbai",
      lat: 19.1520,
      lng: 72.8550,
      contactPerson: "Vikram Singhania",
      phone: "+91 98205 88234",
      fssaiLicense: "FSSAI-44556677889900",
      totalRescuedMeals: 4120,
      activeRating: 4.85
    }
  ],

  shelters: [
    {
      id: "ngo-hope-haven",
      name: "Hope Haven Children's Home",
      type: "Youth Shelter & Nutrition Center",
      address: "14, JP Road, Near Navrang Cinema, Andheri West, Mumbai",
      lat: 19.1220,
      lng: 72.8415,
      distanceKm: 1.4,
      capacity: 140,
      currentOccupants: 92,
      mealsRequested: 92,
      dietaryCompatibility: ["Vegetarian", "Vegan"],
      strictlyVeg: true,
      pickupCapability: "Insulated Van Available",
      vehiclePlate: "MH-02-MB-4412",
      driverName: "Ramesh Kumar",
      driverPhone: "+91 98201 55670",
      estimatedPickupMinutes: 12,
      verified80G: true,
      contactPerson: "Sister Agnes / Director Jacob",
      suitabilityScore: 96,
      suitabilityFactors: {
        proximity: 98,
        capacityFit: 96,
        transportReadiness: 95,
        dietaryMatch: 100
      },
      matchReason: "Immediate proximity (1.4 km in Andheri West), exact meal capacity fit (120 meals for 92 children + staff), and temperature-controlled van ready for immediate dispatch via Link Road."
    },
    {
      id: "ngo-robin-hood",
      name: "Robin Hood Army - Andheri & Versova Hub",
      type: "Volunteer Food Rescue Network",
      address: "Yari Road, Versova, Andheri West, Mumbai",
      lat: 19.1385,
      lng: 72.8120,
      distanceKm: 2.8,
      capacity: 250,
      currentOccupants: 180,
      mealsRequested: 150,
      dietaryCompatibility: ["Vegetarian", "Non-Vegetarian", "Vegan"],
      strictlyVeg: false,
      pickupCapability: "4 Volunteer Cargo Bikes (Thermal Bags)",
      vehiclePlate: "MH-02-EQ-9812",
      driverName: "Karthik Sundaram (Volunteer Lead)",
      driverPhone: "+91 98192 44199",
      estimatedPickupMinutes: 20,
      verified80G: true,
      contactPerson: "Pooja Hegde (City Dispatcher)",
      suitabilityScore: 89,
      suitabilityFactors: {
        proximity: 85,
        capacityFit: 92,
        transportReadiness: 88,
        dietaryMatch: 95
      },
      matchReason: "High capacity network serving 180 street community residents across Versova and Lokhandwala. Rapid bike dispatch ready within 20 minutes."
    },
    {
      id: "ngo-karuna-vridh",
      name: "Karuna Elders Sanctuary",
      type: "Senior Assisted Living & Shelter",
      address: "Holy Family Complex, Mahakali Caves Road, Andheri East, Mumbai",
      lat: 19.1235,
      lng: 72.8680,
      distanceKm: 3.6,
      capacity: 75,
      currentOccupants: 64,
      mealsRequested: 60,
      dietaryCompatibility: ["Vegetarian", "Low-Spice"],
      strictlyVeg: true,
      pickupCapability: "Shared Community Ambulance/Van",
      vehiclePlate: "MH-02-TR-3391",
      driverName: "Manjunath Gowda",
      driverPhone: "+91 98200 77123",
      estimatedPickupMinutes: 18,
      verified80G: true,
      contactPerson: "Dr. Savitri Murthy",
      suitabilityScore: 84,
      suitabilityFactors: {
        proximity: 90,
        capacityFit: 78,
        transportReadiness: 82,
        dietaryMatch: 90
      },
      matchReason: "Requires mild vegetarian food. Can absorb 60 portions. Proximity 3.6 km across Andheri-Kurla link with 18-minute response time."
    },
    {
      id: "ngo-asha-deep",
      name: "Annamrita Community Food Kitchen",
      type: "Daily Community Food Distribution",
      address: "Plot 22, Central Road, MIDC Industrial Area, Andheri East, Mumbai",
      lat: 19.1170,
      lng: 72.8710,
      distanceKm: 4.2,
      capacity: 200,
      currentOccupants: 140,
      mealsRequested: 120,
      dietaryCompatibility: ["Vegetarian", "Non-Vegetarian"],
      strictlyVeg: false,
      pickupCapability: "Electric Cargo Rickshaw",
      vehiclePlate: "MH-02-EV-1120",
      driverName: "Siddique Basha",
      driverPhone: "+91 98202 99011",
      estimatedPickupMinutes: 24,
      verified80G: true,
      contactPerson: "Farooq Khan",
      suitabilityScore: 81,
      suitabilityFactors: {
        proximity: 74,
        capacityFit: 94,
        transportReadiness: 80,
        dietaryMatch: 95
      },
      matchReason: "Matches 120 meals perfectly. Dedicated electric cargo vehicle ready for immediate transit across Andheri East."
    }
  ],

  initialDonations: [
    {
      id: "MB-2026-894",
      title: "Royal Mughlai Wedding Buffet Feast",
      donorId: "donor-orchid",
      donorName: "Orchid Banquet & Convention Hall",
      donorAddress: "New Link Road, Andheri West, Mumbai",
      donorContact: "+91 98200 12845",
      estimatedMeals: 120,
      dietary: "Vegetarian",
      foodType: "Cooked Wedding Feast",
      foodItems: [
        "Paneer Butter Masala (35 kg)",
        "Dal Makhani (40 kg)",
        "Jeera Pulao Rice (45 kg)",
        "Fresh Tandoori Rotis (240 pcs)",
        "Gulab Jamun (140 pcs)"
      ],
      cookedAtTime: "7:30 PM",
      cookedTimestamp: Date.now() - (72 * 60 * 1000), // 1 hour 12 min ago
      expiryHoursTotal: 4.0, // FSSAI safe cooked window is 4 hours
      expiryTimestamp: Date.now() + (138 * 60 * 1000), // ~2h 18m left
      packagingStatus: "Packed in hygienic aluminum catering trays & thermal canisters",
      pickupLocation: "Rear Kitchen Loading Bay, Orchid Banquet, New Link Rd, Andheri West",
      locationCoords: { lat: 19.1352, lng: 72.8335 },
      specialNotes: "Keep warm, tamper seals intact. Easy cargo loading via Gate 2.",
      status: "pickup_assigned", // created -> verified -> matched -> accepted -> pickup_assigned -> picked_up -> delivered
      statusStepIndex: 4, // 0 to 6
      matchedNgoId: "ngo-hope-haven",
      matchedNgoName: "Hope Haven Children's Home",
      matchedNgoAddress: "14, JP Road, Andheri West (1.4 km)",
      assignedDriver: {
        name: "Ramesh Kumar",
        phone: "+91 98201 55670",
        vehicle: "Insulated Van (MH-02-MB-4412)",
        etaMinutes: 12,
        currentTempLog: "63.8°C (Hot-holding safe zone)",
        photoUrl: "assets/images/driver_ramesh.jpg"
      },
      confidence: 96,
      aiExtractionSummary: "Parsed 120 veg portions with 96% confidence. Verified safe 4h thermal consumption window expiring in 2h 18m."
    },
    {
      id: "MB-2026-902",
      title: "Corporate Leadership Summit Lunch Boxes",
      donorId: "donor-grand-horizon",
      donorName: "Grand Horizon Hotel & Suites",
      donorAddress: "Airport Zone, Andheri East, Mumbai",
      donorContact: "+91 98210 99421",
      estimatedMeals: 65,
      dietary: "Vegetarian",
      foodType: "Individually Boxed Executive Meals",
      foodItems: [
        "Subz Dum Biryani Boxes (65)",
        "Cucumber Mint Raita (sealed cups)",
        "Mirchi Ka Salan (individual cups)",
        "Seasonal Fresh Cut Fruits"
      ],
      cookedAtTime: "8:00 PM",
      cookedTimestamp: Date.now() - (150 * 60 * 1000),
      expiryHoursTotal: 3.5,
      expiryTimestamp: Date.now() + (42 * 60 * 1000), // 42 mins left! (Urgent)
      packagingStatus: "Sealed meal boxes in Bloom temperature-proof travel bag",
      pickupLocation: "Service Elevator Basement 1, Grand Horizon Hotel, Andheri East",
      locationCoords: { lat: 19.1025, lng: 72.8755 },
      specialNotes: "Individual meal boxes with cutlery, ready to distribute immediately.",
      status: "matched",
      statusStepIndex: 2,
      matchedNgoId: "ngo-karuna-vridh",
      matchedNgoName: "Karuna Elders Sanctuary",
      matchedNgoAddress: "Mahakali Caves Rd, Andheri East (3.6 km)",
      assignedDriver: null,
      confidence: 94,
      aiExtractionSummary: "High urgency! 42m remaining on safe window. Ideal for immediate elder shelter supper."
    },
    {
      id: "MB-2026-915",
      title: "Gourmet Mughlai Dum Biryani & Kebabs",
      donorId: "donor-saffron-valley",
      donorName: "Nesco Grand Banquets & Caterers",
      donorAddress: "Western Express Highway, Goregaon-Andheri Corridor",
      donorContact: "+91 98205 88234",
      estimatedMeals: 80,
      dietary: "Non-Vegetarian",
      foodType: "Buffet Catering Excess",
      foodItems: [
        "Chicken Dum Biryani (50 portions)",
        "Paneer Tikka Masala (30 portions)",
        "Roomali Rotis (160 pcs)",
        "Raita & Gravy"
      ],
      cookedAtTime: "8:45 PM",
      cookedTimestamp: Date.now() - (45 * 60 * 1000),
      expiryHoursTotal: 4.0,
      expiryTimestamp: Date.now() + (195 * 60 * 1000), // 3h 15m left
      packagingStatus: "Stainless steel food warmers and sealed catering boxes",
      pickupLocation: "Main Dispatch Dock, Nesco Center, Western Express Hwy",
      locationCoords: { lat: 19.1520, lng: 72.8550 },
      specialNotes: "Contains chicken and paneer. Separate labeled containers.",
      status: "available",
      statusStepIndex: 1,
      matchedNgoId: null,
      matchedNgoName: null,
      matchedNgoAddress: null,
      assignedDriver: null,
      confidence: 92,
      aiExtractionSummary: "Mixed non-veg and veg portions parsed. Requires separate handling."
    },
    {
      id: "MB-2026-778",
      title: "Hostel Breakfast Poha, Idli & Sambhar",
      donorId: "donor-st-jude",
      donorName: "Bhavan's Campus Student Mess & Canteen",
      donorAddress: "Munshi Nagar, Andheri West",
      donorContact: "+91 98190 33211",
      estimatedMeals: 95,
      dietary: "Vegetarian",
      foodType: "Morning Canteen Breakfast",
      foodItems: [
        "Steamed Rice Idlis (220 pcs)",
        "Vegetable Poha (25 kg)",
        "Hot Vegetable Sambhar (30 L)",
        "Coconut Chutney"
      ],
      cookedAtTime: "7:00 AM",
      cookedTimestamp: Date.now() - (6 * 3600 * 1000),
      expiryHoursTotal: 4.0,
      expiryTimestamp: Date.now() - (2 * 3600 * 1000),
      packagingStatus: "Commercial stainless drums",
      pickupLocation: "Hostel Gate 3, Bhavan's Campus, Andheri West",
      locationCoords: { lat: 19.1240, lng: 72.8390 },
      status: "delivered",
      statusStepIndex: 6,
      matchedNgoId: "ngo-asha-deep",
      matchedNgoName: "Annamrita Community Food Kitchen",
      matchedNgoAddress: "MIDC Central Rd, Andheri East (3.2 km)",
      deliveredAt: "Today, 9:20 AM",
      temperatureAtDelivery: "62.4°C verified",
      confidence: 98,
      aiExtractionSummary: "Successfully delivered. 95 morning meals fed to local community."
    }
  ],

  samplePrompts: [
    {
      label: "Orchid Banquet Wedding (120 Veg)",
      text: "Hi, we have around 120 veg meals left from tonight's wedding. Food was cooked around 7:30 PM and is packed in aluminum foil trays. Paneer butter masala, dal makhani, jeera rice and rotis. Pickup from Orchid Grand Banquet Hall, New Link Road, Andheri West near Infinity Mall."
    },
    {
      label: "Grand Horizon Hotel (65 Boxes, Urgent)",
      text: "Grand Horizon Hotel here at International Airport Zone, Andheri East. We have 65 executive veg biryani boxed meals from a corporate seminar. Cooked at 8:00 PM, sealed in clean cardboard boxes with cutlery. Ready immediately at service gate, need pickup ASAP before 11 PM."
    },
    {
      label: "Nesco Exhibition Catering (80 Meals)",
      text: "Nesco Banquets, Western Express Highway Andheri. We have 50 chicken biryani portions and 30 paneer meals left from an industry conference dinner. Finished cooking at 8:45 PM. Packed in insulated containers. Need an NGO with van pickup."
    },
    {
      label: "Bhavan's College Hostel Mess (90 Meals)",
      text: "Bhavan's Campus Mess, Munshi Nagar, Andheri West. Around 90 portions of freshly cooked dal, rice, mixed vegetable curry and 180 chapatis. Prepared at 8:15 PM, stored in clean food warmers. Bring your own vessels or food drums."
    }
  ],

  impactStats: {
    mealsRescued: 142850,
    co2AvoidedTons: 18.4,
    partnerShelters: 94,
    avgMatchMinutes: 8.4,
    verifiedDonors: 148,
    foodSafetyPassRate: "99.8%"
  },

  safetyProtocols: [
    {
      title: "4-Hour Thermal Safety Window",
      description: "Cooked food must be matched and delivered within 4 hours of preparation to prevent bacterial colonization.",
      badge: "Strict FSSAI Guideline"
    },
    {
      title: "Digital Temperature Verification",
      description: "Infrared surface temperature check logged at donor dispatch (>60°C hot-holding or <5°C chilled) and re-verified at shelter delivery.",
      badge: "Chain-of-Custody"
    },
    {
      title: "Tamper-Evident Packaging",
      description: "Food must be packaged in food-grade foil, clean stainless food warmers, or sealed containers with donor sign-off.",
      badge: "Hygienic Seal"
    },
    {
      title: "80G Registered NGO Network",
      description: "Every recipient shelter is vetted with active physical premises, sanitation audits, and authorized coordinators.",
      badge: "Vetted Recipient"
    }
  ]
};

// Make available globally or via module import
if (typeof window !== "undefined") {
  window.SEED_DATA = SEED_DATA;
}
