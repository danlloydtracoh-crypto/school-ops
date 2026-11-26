const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

// Initial comprehensive seed data for School Tuck Shop & Cafeteria
const initialData = {
  students: [
    {
      id: "STU-1001",
      studentNumber: "2024-001",
      barcode: "STU1001",
      name: "Liam Chen",
      grade: "Grade 7-B",
      photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      walletBalance: 24.50,
      dailySpendLimit: 15.00,
      todaySpent: 0.00,
      todaySpentDate: new Date().toISOString().split('T')[0],
      mealPlan: {
        active: true,
        tier: "Daily Hot Lunch Plan",
        creditsPerDay: 1,
        remainingToday: 1,
        eligibleCategories: ["Hot Meals", "Combos"]
      },
      allergens: ["Peanuts", "Tree Nuts"],
      dietaryTags: ["Nut-Free"],
      categoryRestrictions: [],
      notes: "Severe peanut anaphylaxis (EpiPen in clinic).",
      parentContact: "Sarah Chen (+1 555-0192)"
    },
    {
      id: "STU-1002",
      studentNumber: "2024-002",
      barcode: "STU1002",
      name: "Sophia Miller",
      grade: "Grade 10-A",
      photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      walletBalance: 18.25,
      dailySpendLimit: 12.00,
      todaySpent: 0.00,
      todaySpentDate: new Date().toISOString().split('T')[0],
      mealPlan: {
        active: false,
        tier: "None",
        creditsPerDay: 0,
        remainingToday: 0,
        eligibleCategories: []
      },
      allergens: ["Dairy", "Gluten"],
      dietaryTags: ["Dairy-Free", "Gluten-Free"],
      categoryRestrictions: [],
      notes: "Celiac disease and lactose intolerance.",
      parentContact: "David Miller (+1 555-0144)"
    },
    {
      id: "STU-1003",
      studentNumber: "2024-003",
      barcode: "STU1003",
      name: "Amara Okafor",
      grade: "Grade 5-C",
      photo: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
      walletBalance: 32.00,
      dailySpendLimit: 10.00,
      todaySpent: 0.00,
      todaySpentDate: new Date().toISOString().split('T')[0],
      mealPlan: {
        active: true,
        tier: "Full Boarder Meal Plan",
        creditsPerDay: 2,
        remainingToday: 1,
        eligibleCategories: ["Hot Meals", "Combos", "Bakery/Fruit"]
      },
      allergens: [],
      dietaryTags: ["Halal"],
      categoryRestrictions: ["No Sugary Drinks", "Max 1 Snack per day"],
      notes: "Strict Halal. Parent requested zero soda/fizzy drinks.",
      parentContact: "Ibrahim Okafor (+1 555-0821)"
    },
    {
      id: "STU-1004",
      studentNumber: "2024-004",
      barcode: "STU1004",
      name: "Ethan Walker",
      grade: "Grade 11-B",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      walletBalance: 2.50,
      dailySpendLimit: 20.00,
      todaySpent: 0.00,
      todaySpentDate: new Date().toISOString().split('T')[0],
      mealPlan: {
        active: false,
        tier: "None",
        creditsPerDay: 0,
        remainingToday: 0,
        eligibleCategories: []
      },
      allergens: [],
      dietaryTags: [],
      categoryRestrictions: [],
      notes: "Low balance account ($2.50) - test insufficient funds.",
      parentContact: "Karen Walker (+1 555-0377)"
    },
    {
      id: "STU-1005",
      studentNumber: "2024-005",
      barcode: "STU1005",
      name: "Maya Patel",
      grade: "Grade 8-A",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      walletBalance: 14.75,
      dailySpendLimit: 15.00,
      todaySpent: 0.00,
      todaySpentDate: new Date().toISOString().split('T')[0],
      mealPlan: {
        active: true,
        tier: "Daily Hot Lunch Plan",
        creditsPerDay: 1,
        remainingToday: 0, // already redeemed today
        eligibleCategories: ["Hot Meals", "Combos"]
      },
      allergens: ["Eggs"],
      dietaryTags: ["Vegetarian"],
      categoryRestrictions: [],
      notes: "Vegetarian only. Already redeemed today's meal voucher.",
      parentContact: "Rajesh Patel (+1 555-0632)"
    },
    {
      id: "STU-1006",
      studentNumber: "2024-006",
      barcode: "STU1006",
      name: "Lucas Garcia",
      grade: "Grade 9-C",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      walletBalance: 40.00,
      dailySpendLimit: 12.00,
      todaySpent: 10.50, // almost at limit
      todaySpentDate: new Date().toISOString().split('T')[0],
      mealPlan: {
        active: false,
        tier: "None",
        creditsPerDay: 0,
        remainingToday: 0,
        eligibleCategories: []
      },
      allergens: ["Seafood"],
      dietaryTags: [],
      categoryRestrictions: [],
      notes: "Daily spend limit is $12.00, today has already spent $10.50.",
      parentContact: "Maria Garcia (+1 555-0988)"
    },
    {
      id: "STU-1007",
      studentNumber: "2024-007",
      barcode: "STU1007",
      name: "Zoe Tremblay",
      grade: "Grade 6-A",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      walletBalance: 52.00,
      dailySpendLimit: 25.00,
      todaySpent: 0.00,
      todaySpentDate: new Date().toISOString().split('T')[0],
      mealPlan: {
        active: true,
        tier: "Daily Hot Lunch Plan",
        creditsPerDay: 1,
        remainingToday: 1,
        eligibleCategories: ["Hot Meals", "Combos"]
      },
      allergens: ["Dairy", "Eggs", "Honey"],
      dietaryTags: ["Vegan", "Dairy-Free"],
      categoryRestrictions: [],
      notes: "Strict vegan.",
      parentContact: "Claire Tremblay (+1 555-0451)"
    },
    {
      id: "STU-1008",
      studentNumber: "2024-008",
      barcode: "STU1008",
      name: "Oliver Smith",
      grade: "Grade 12-Senior",
      photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      walletBalance: 68.00,
      dailySpendLimit: 30.00,
      todaySpent: 0.00,
      todaySpentDate: new Date().toISOString().split('T')[0],
      mealPlan: {
        active: false,
        tier: "None",
        creditsPerDay: 0,
        remainingToday: 0,
        eligibleCategories: []
      },
      allergens: [],
      dietaryTags: [],
      categoryRestrictions: [],
      notes: "Prefect / Sports team captain.",
      parentContact: "Robert Smith (+1 555-0100)"
    },
    {
      id: "STU-1009",
      studentNumber: "2024-009",
      barcode: "STU1009",
      name: "Kwame Mensah",
      grade: "Grade 8-B",
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      walletBalance: 29.50,
      dailySpendLimit: 14.00,
      todaySpent: 0.00,
      todaySpentDate: new Date().toISOString().split('T')[0],
      mealPlan: {
        active: true,
        tier: "Daily Hot Lunch Plan",
        creditsPerDay: 1,
        remainingToday: 1,
        eligibleCategories: ["Hot Meals", "Combos"]
      },
      allergens: ["Soy"],
      dietaryTags: ["Halal", "Nut-Free"],
      categoryRestrictions: [],
      notes: "Soccer team striker. High energy student.",
      parentContact: "Kofi Mensah (+1 555-0712)"
    },
    {
      id: "STU-1010",
      studentNumber: "2024-010",
      barcode: "STU1010",
      name: "Fatima Al-Hassan",
      grade: "Grade 11-A",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      walletBalance: 44.00,
      dailySpendLimit: 20.00,
      todaySpent: 0.00,
      todaySpentDate: new Date().toISOString().split('T')[0],
      mealPlan: {
        active: true,
        tier: "Full Boarder Meal Plan",
        creditsPerDay: 2,
        remainingToday: 2,
        eligibleCategories: ["Hot Meals", "Combos", "Snacks"]
      },
      allergens: [],
      dietaryTags: ["Halal", "Nut-Free"],
      categoryRestrictions: [],
      notes: "Prefers certified Halal chicken and fish entrees.",
      parentContact: "Tariq Al-Hassan (+1 555-0881)"
    },
    {
      id: "STU-1011",
      studentNumber: "2024-011",
      barcode: "STU1011",
      name: "Jessica Taylor",
      grade: "Grade 7-A",
      photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
      walletBalance: 16.50,
      dailySpendLimit: 12.00,
      todaySpent: 0.00,
      todaySpentDate: new Date().toISOString().split('T')[0],
      mealPlan: {
        active: false,
        tier: "None",
        creditsPerDay: 0,
        remainingToday: 0,
        eligibleCategories: []
      },
      allergens: ["Tree Nuts"],
      dietaryTags: ["Nut-Free", "Vegetarian"],
      categoryRestrictions: ["No Sugary Drinks"],
      notes: "Severe walnut allergy. Parent requested water or milk only.",
      parentContact: "Emily Taylor (+1 555-0329)"
    }
  ],

  menuItems: [
    // Hot Meals
    {
      id: "ITEM-001",
      sku: "HOT-001",
      barcode: "8901001",
      name: "Signature Jollof Rice & Herb Chicken",
      category: "Hot Meals",
      price: 5.75,
      mealPlanEligible: true,
      portionsLeft: 48,
      portionsTotal: 65,
      lowStockThreshold: 10,
      dietaryBadges: ["Halal", "Gluten-Free", "Nut-Free"],
      allergens: [],
      activePeriods: ["Lunch"],
      isArchived: false,
      description: "Fragrant spiced West African tomato rice with roasted tender herb-marinated chicken drumstick and fried sweet plantains."
    },
    {
      id: "ITEM-002",
      sku: "HOT-002",
      barcode: "8901002",
      name: "Vegetable Lasagna al Forno",
      category: "Hot Meals",
      price: 5.00,
      mealPlanEligible: true,
      portionsLeft: 18,
      portionsTotal: 40,
      lowStockThreshold: 8,
      dietaryBadges: ["Vegetarian", "Nut-Free"],
      allergens: ["Dairy", "Gluten", "Eggs"],
      activePeriods: ["Lunch"],
      isArchived: false,
      description: "Layered rich tomato, zucchini, spinach, ricotta and melted mozzarella."
    },
    {
      id: "ITEM-003",
      sku: "HOT-003",
      barcode: "8901003",
      name: "Crispy Golden Fish Fingers & Mash",
      category: "Hot Meals",
      price: 5.25,
      mealPlanEligible: true,
      portionsLeft: 7, // Low stock warning!
      portionsTotal: 35,
      lowStockThreshold: 10,
      dietaryBadges: ["Nut-Free"],
      allergens: ["Seafood", "Gluten", "Dairy"],
      activePeriods: ["Lunch"],
      isArchived: false,
      description: "Golden battered cod fillet tenders served with warm buttery mash and steamed green peas."
    },
    {
      id: "ITEM-004",
      sku: "HOT-004",
      barcode: "8901004",
      name: "Vegan Chickpea & Spinach Coconut Curry",
      category: "Hot Meals",
      price: 4.80,
      mealPlanEligible: true,
      portionsLeft: 25,
      portionsTotal: 30,
      lowStockThreshold: 5,
      dietaryBadges: ["Vegan", "Vegetarian", "Gluten-Free", "Dairy-Free", "Nut-Free", "Halal"],
      allergens: [],
      activePeriods: ["Lunch"],
      isArchived: false,
      description: "Mild, fragrant yellow curry made with coconut milk, chickpeas, baby spinach, and basmati rice."
    },
    {
      id: "ITEM-005",
      sku: "HOT-005",
      barcode: "8901005",
      name: "Classic Beef Bolognese Pasta",
      category: "Hot Meals",
      price: 5.40,
      mealPlanEligible: true,
      portionsLeft: 0, // SOLD OUT to test out-of-stock prevention!
      portionsTotal: 50,
      lowStockThreshold: 10,
      dietaryBadges: ["Halal", "Nut-Free"],
      allergens: ["Gluten", "Dairy"],
      activePeriods: ["Lunch"],
      isArchived: false,
      description: "Slow-simmered minced lean beef in rich Italian herb marinara sauce over penne."
    },
    {
      id: "ITEM-006",
      sku: "HOT-006",
      barcode: "8901006",
      name: "Grilled Chicken & Bell Pepper Fajita Bowl",
      category: "Hot Meals",
      price: 5.60,
      mealPlanEligible: true,
      portionsLeft: 32,
      portionsTotal: 40,
      lowStockThreshold: 8,
      dietaryBadges: ["Halal", "Gluten-Free", "Dairy-Free", "Nut-Free"],
      allergens: [],
      activePeriods: ["Lunch"],
      isArchived: false,
      description: "Char-grilled spiced chicken strips with sweet bell peppers, cilantro rice, and mild salsa."
    },

    // Combos
    {
      id: "ITEM-007",
      sku: "CMB-001",
      barcode: "8902001",
      name: "Hot Lunch Meal Deal (Entree + Juice + Apple)",
      category: "Combos",
      price: 6.50,
      mealPlanEligible: true,
      portionsLeft: 35,
      portionsTotal: 50,
      lowStockThreshold: 8,
      dietaryBadges: ["Nut-Free"],
      allergens: ["Gluten", "Dairy"],
      activePeriods: ["Lunch"],
      isArchived: false,
      description: "Choice of daily hot entree + fresh fruit juice box + organic royal gala apple."
    },
    {
      id: "ITEM-008",
      sku: "CMB-002",
      barcode: "8902002",
      name: "Morning Booster Combo (Egg Wrap + Juice)",
      category: "Combos",
      price: 4.50,
      mealPlanEligible: true,
      portionsLeft: 20,
      portionsTotal: 25,
      lowStockThreshold: 5,
      dietaryBadges: ["Vegetarian", "Nut-Free"],
      allergens: ["Dairy", "Gluten", "Eggs"],
      activePeriods: ["Breakfast", "Break"],
      isArchived: false,
      description: "Warm scrambled egg & cheddar wholewheat breakfast wrap paired with orange juice."
    },

    // Snacks
    {
      id: "ITEM-009",
      sku: "SNK-001",
      barcode: "8903001",
      name: "Crunchy Pretzel Twists (Sea Salt)",
      category: "Snacks",
      price: 1.50,
      mealPlanEligible: false,
      portionsLeft: 55,
      portionsTotal: 70,
      lowStockThreshold: 15,
      dietaryBadges: ["Vegan", "Nut-Free", "Dairy-Free"],
      allergens: ["Gluten"],
      activePeriods: ["Break", "Lunch"],
      isArchived: false,
      description: "Oven-baked lightly salted pretzel twists."
    },
    {
      id: "ITEM-010",
      sku: "SNK-002",
      barcode: "8903002",
      name: "Peanut Crunch Granola Bar",
      category: "Snacks",
      price: 1.80,
      mealPlanEligible: false,
      portionsLeft: 30,
      portionsTotal: 40,
      lowStockThreshold: 10,
      dietaryBadges: ["Vegetarian"],
      allergens: ["Peanuts", "Gluten", "Dairy", "Soy"], // High allergy test item!
      activePeriods: ["Breakfast", "Break", "Lunch"],
      isArchived: false,
      description: "Honey-roasted whole oats bar with roasted peanuts and chocolate drizzle."
    },
    {
      id: "ITEM-011",
      sku: "SNK-003",
      barcode: "8903003",
      name: "Cheddar Cheese Sticks (Twin Pack)",
      category: "Snacks",
      price: 1.75,
      mealPlanEligible: false,
      portionsLeft: 4, // Low stock!
      portionsTotal: 30,
      lowStockThreshold: 10,
      dietaryBadges: ["Vegetarian", "Gluten-Free", "Nut-Free"],
      allergens: ["Dairy"],
      activePeriods: ["Break", "Lunch"],
      isArchived: false,
      description: "100% real mild white cheddar snack sticks."
    },
    {
      id: "ITEM-012",
      sku: "SNK-004",
      barcode: "8903004",
      name: "Hummus & Carrot Crunch Pot",
      category: "Snacks",
      price: 2.20,
      mealPlanEligible: false,
      portionsLeft: 22,
      portionsTotal: 25,
      lowStockThreshold: 5,
      dietaryBadges: ["Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free", "Halal"],
      allergens: [],
      activePeriods: ["Break", "Lunch"],
      isArchived: false,
      description: "Creamy traditional hummus dip with fresh organic carrot batons."
    },

    // Drinks
    {
      id: "ITEM-013",
      sku: "DRK-001",
      barcode: "8904001",
      name: "100% Pure Fresh Orange Juice (250ml)",
      category: "Drinks",
      price: 1.80,
      mealPlanEligible: false,
      portionsLeft: 48,
      portionsTotal: 60,
      lowStockThreshold: 12,
      dietaryBadges: ["Vegan", "Gluten-Free", "Nut-Free", "Dairy-Free"],
      allergens: [],
      activePeriods: ["Breakfast", "Break", "Lunch"],
      isArchived: false,
      description: "No added sugar, high vitamin C natural juice box."
    },
    {
      id: "ITEM-014",
      sku: "DRK-002",
      barcode: "8904002",
      name: "Organic Whole Milk Carton (200ml)",
      category: "Drinks",
      price: 1.40,
      mealPlanEligible: false,
      portionsLeft: 38,
      portionsTotal: 50,
      lowStockThreshold: 10,
      dietaryBadges: ["Vegetarian", "Gluten-Free", "Nut-Free"],
      allergens: ["Dairy"],
      activePeriods: ["Breakfast", "Break", "Lunch"],
      isArchived: false,
      description: "Cold pasteurized farm-fresh organic milk."
    },
    {
      id: "ITEM-015",
      sku: "DRK-003",
      barcode: "8904003",
      name: "Natural Spring Water Bottle (500ml)",
      category: "Drinks",
      price: 1.00,
      mealPlanEligible: false,
      portionsLeft: 95,
      portionsTotal: 120,
      lowStockThreshold: 20,
      dietaryBadges: ["Vegan", "Gluten-Free", "Nut-Free", "Dairy-Free"],
      allergens: [],
      activePeriods: ["Breakfast", "Break", "Lunch"],
      isArchived: false,
      description: "Pure bottled natural mineral water."
    },
    {
      id: "ITEM-016",
      sku: "DRK-004",
      barcode: "8904004",
      name: "Sparkling Berry Fizz (Sugary Drink)",
      category: "Drinks",
      price: 2.10,
      mealPlanEligible: false,
      portionsLeft: 19,
      portionsTotal: 30,
      lowStockThreshold: 8,
      dietaryBadges: ["Vegan", "Nut-Free"],
      allergens: [],
      activePeriods: ["Break", "Lunch"],
      isArchived: false,
      description: "Carbonated fruit flavored soda (restricted for certain students)."
    },

    // Bakery / Fruit
    {
      id: "ITEM-017",
      sku: "BAK-001",
      barcode: "8905001",
      name: "Fresh Crisp Royal Gala Apple",
      category: "Bakery/Fruit",
      price: 0.90,
      mealPlanEligible: false,
      portionsLeft: 60,
      portionsTotal: 80,
      lowStockThreshold: 15,
      dietaryBadges: ["Vegan", "Gluten-Free", "Nut-Free", "Dairy-Free"],
      allergens: [],
      activePeriods: ["Breakfast", "Break", "Lunch"],
      isArchived: false,
      description: "Washed and polished sweet red apple."
    },
    {
      id: "ITEM-018",
      sku: "BAK-002",
      barcode: "8905002",
      name: "Warm Blueberry Oat Muffin",
      category: "Bakery/Fruit",
      price: 2.25,
      mealPlanEligible: false,
      portionsLeft: 14,
      portionsTotal: 25,
      lowStockThreshold: 6,
      dietaryBadges: ["Vegetarian", "Nut-Free"],
      allergens: ["Gluten", "Dairy", "Eggs"],
      activePeriods: ["Breakfast", "Break"],
      isArchived: false,
      description: "Freshly baked daily with wild blueberries and rolled oats."
    },
    {
      id: "ITEM-019",
      sku: "BAK-003",
      barcode: "8905003",
      name: "Gluten-Free Banana Bread Slice",
      category: "Bakery/Fruit",
      price: 2.50,
      mealPlanEligible: false,
      portionsLeft: 8,
      portionsTotal: 15,
      lowStockThreshold: 5,
      dietaryBadges: ["Vegetarian", "Gluten-Free", "Nut-Free"],
      allergens: ["Dairy", "Eggs"],
      activePeriods: ["Breakfast", "Break", "Lunch"],
      isArchived: false,
      description: "Soft cinnamon-spiced banana bread made with certified gluten-free oat flour."
    },
    {
      id: "ITEM-020",
      sku: "BAK-004",
      barcode: "8905004",
      name: "Watermelon & Berry Fruit Cup (200g)",
      category: "Bakery/Fruit",
      price: 2.00,
      mealPlanEligible: false,
      portionsLeft: 24,
      portionsTotal: 30,
      lowStockThreshold: 5,
      dietaryBadges: ["Vegan", "Gluten-Free", "Nut-Free", "Dairy-Free"],
      allergens: [],
      activePeriods: ["Break", "Lunch"],
      isArchived: false,
      description: "Fresh diced sweet watermelon, blueberries, and strawberries."
    }
  ],

  shifts: [
    {
      id: "SHIFT-20261119-01",
      cashierName: "Maria Jenkins (Station 1)",
      startTime: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      endTime: null,
      openingFloat: 100.00,
      status: "OPEN",
      notes: "Lunch break rush cashier shift."
    }
  ],

  transactions: [
    {
      id: "TX-9001",
      receiptNumber: "REC-20261119-001",
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      studentId: "STU-1001",
      studentName: "Liam Chen",
      studentGrade: "Grade 7-B",
      cashierName: "Maria Jenkins",
      shiftId: "SHIFT-20261119-01",
      items: [
        {
          itemId: "ITEM-001",
          name: "Signature Jollof Rice & Herb Chicken",
          price: 5.75,
          qty: 1,
          coveredByMealPlan: true
        },
        {
          itemId: "ITEM-013",
          name: "100% Pure Fresh Orange Juice (250ml)",
          price: 1.80,
          qty: 1,
          coveredByMealPlan: false
        }
      ],
      subtotal: 7.55,
      mealPlanDiscount: 5.75,
      totalCharged: 1.80,
      paymentMethod: {
        type: "SPLIT",
        mealPlanCredits: 1,
        mealPlanCreditValue: 5.75,
        walletDeduction: 1.80,
        cashTendered: 0,
        changeGiven: 0
      },
      status: "COMPLETED",
      checkoutDurationSeconds: 4.2
    },
    {
      id: "TX-9002",
      receiptNumber: "REC-20261119-002",
      timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
      studentId: "STU-1002",
      studentName: "Sophia Miller",
      studentGrade: "Grade 10-A",
      cashierName: "Maria Jenkins",
      shiftId: "SHIFT-20261119-01",
      items: [
        {
          itemId: "ITEM-004",
          name: "Vegan Chickpea & Spinach Coconut Curry",
          price: 4.80,
          qty: 1,
          coveredByMealPlan: false
        },
        {
          itemId: "ITEM-015",
          name: "Natural Spring Water Bottle (500ml)",
          price: 1.00,
          qty: 1,
          coveredByMealPlan: false
        }
      ],
      subtotal: 5.80,
      mealPlanDiscount: 0.00,
      totalCharged: 5.80,
      paymentMethod: {
        type: "WALLET",
        walletDeduction: 5.80,
        cashTendered: 0,
        changeGiven: 0
      },
      status: "COMPLETED",
      checkoutDurationSeconds: 3.8
    },
    {
      id: "TX-9003",
      receiptNumber: "REC-20261119-003",
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      studentId: null,
      studentName: "Walk-in Guest / Staff",
      studentGrade: "General",
      cashierName: "Maria Jenkins",
      shiftId: "SHIFT-20261119-01",
      items: [
        {
          itemId: "ITEM-018",
          name: "Warm Blueberry Oat Muffin",
          price: 2.25,
          qty: 2,
          coveredByMealPlan: false
        },
        {
          itemId: "ITEM-015",
          name: "Natural Spring Water Bottle (500ml)",
          price: 1.00,
          qty: 1,
          coveredByMealPlan: false
        }
      ],
      subtotal: 5.50,
      mealPlanDiscount: 0.00,
      totalCharged: 5.50,
      paymentMethod: {
        type: "CASH",
        cashTendered: 10.00,
        changeGiven: 4.50
      },
      status: "COMPLETED",
      checkoutDurationSeconds: 6.5
    }
  ],

  topups: [
    {
      id: "TOP-001",
      studentId: "STU-1001",
      studentName: "Liam Chen",
      amount: 25.00,
      paymentMode: "Card (Online Parent Portal)",
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      adminName: "Automated Gateway",
      reference: "CC-88219"
    },
    {
      id: "TOP-002",
      studentId: "STU-1003",
      studentName: "Amara Okafor",
      amount: 30.00,
      paymentMode: "Cash (Front Desk)",
      timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      adminName: "Admin Reynolds",
      reference: "CSH-3301"
    }
  ],

  restockLogs: [
    {
      id: "RST-001",
      itemId: "ITEM-001",
      itemName: "Signature Jollof Rice & Herb Chicken",
      addedQuantity: 30,
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      adminName: "Chef Roland",
      reason: "Lunch batch prep"
    }
  ],

  auditLogs: [
    {
      id: "AUD-1001",
      timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      action: "SHIFT_OPEN",
      user: "Maria Jenkins",
      role: "Cashier",
      targetId: "SHIFT-20261119-01",
      targetType: "Shift",
      details: "Opened register Station 1 with float $100.00.",
      status: "SUCCESS",
      before: null,
      after: { float: 100.00, cashier: "Maria Jenkins" }
    },
    {
      id: "AUD-1002",
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      action: "PORTION_RESTOCK",
      user: "Chef Roland",
      role: "Kitchen",
      targetId: "ITEM-001",
      targetType: "MenuItem",
      details: "Restocked 30 portions of Signature Jollof Rice & Herb Chicken.",
      status: "SUCCESS",
      before: { portionsLeft: 18 },
      after: { portionsLeft: 48 }
    },
    {
      id: "AUD-1003",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      action: "CHECKOUT_COMPLETED",
      user: "Maria Jenkins",
      role: "Cashier",
      targetId: "REC-20261119-002",
      targetType: "Transaction",
      details: "Deducted $5.80 from student Sophia Miller (STU-1002) wallet.",
      status: "SUCCESS",
      before: { walletBalance: 24.05 },
      after: { walletBalance: 18.25 }
    }
  ],

  errorLogs: [
    {
      id: "ERR-5001",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      category: "CHECKOUT_BLOCKED",
      severity: "WARNING",
      code: "INSUFFICIENT_FUNDS",
      message: "Checkout attempt blocked: Student Ethan Walker (STU-1004) balance $2.50 insufficient for cart $5.50.",
      studentId: "STU-1004",
      user: "Maria Jenkins",
      stack: "Error: INSUFFICIENT_FUNDS at validateWalletDeduction (/server/index.js:284:15)",
      context: { cartSubtotal: 5.50, studentBalance: 2.50 }
    },
    {
      id: "ERR-5002",
      timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      category: "ALLERGY_SAFETY_INTERCEPTION",
      severity: "ALERT",
      code: "ALLERGEN_CONFLICT_DETECTED",
      message: "Safety alert triggered: Student Liam Chen (Peanut Allergy) added Peanut Crunch Granola Bar to cart. Alerted cashier.",
      studentId: "STU-1001",
      user: "Maria Jenkins",
      stack: "SafetyGuardrail: Allergen Conflict [Peanuts] detected at /server/index.js:189:22",
      context: { allergens: ["Peanuts"], item: "Peanut Crunch Granola Bar" }
    }
  ]
};

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.auditLogs) this.data.auditLogs = initialData.auditLogs;
        if (!this.data.errorLogs) this.data.errorLogs = initialData.errorLogs;
        console.log('Database loaded from disk.');
      } else {
        this.data = JSON.parse(JSON.stringify(initialData));
        this.save();
        console.log('Database initialized with default school seed data.');
      }
    } catch (err) {
      console.error('Failed reading DB file, resetting to seed data:', err);
      this.data = JSON.parse(JSON.stringify(initialData));
      this.save();
    }
  }

  save() {
    try {
      const tempPath = DB_PATH + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_PATH);
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  logAudit({ action, user, role, targetId, targetType, details, status, before, after }) {
    const entry = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      action,
      user: user || 'System',
      role: role || 'Cashier',
      targetId: targetId || null,
      targetType: targetType || 'General',
      details: details || '',
      status: status || 'SUCCESS',
      before: before || null,
      after: after || null
    };
    if (!this.data.auditLogs) this.data.auditLogs = [];
    this.data.auditLogs.unshift(entry);
    this.save();
    return entry;
  }

  logError({ category, severity, code, message, studentId, user, stack, context }) {
    const entry = {
      id: `ERR-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      category: category || 'RUNTIME_ERROR',
      severity: severity || 'ERROR',
      code: code || 'UNKNOWN_ERROR',
      message: message || '',
      studentId: studentId || null,
      user: user || 'Cashier Station 1',
      stack: stack || (new Error().stack),
      context: context || {}
    };
    if (!this.data.errorLogs) this.data.errorLogs = [];
    this.data.errorLogs.unshift(entry);
    this.save();
    return entry;
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(initialData));
    this.save();
    return this.data;
  }
}

const db = new Database();

module.exports = db;
