const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Helper to check today's date format YYYY-MM-DD
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// Reset daily spending if the day rolled over
function refreshStudentDailySpend(student) {
  const today = getTodayString();
  if (student.todaySpentDate !== today) {
    student.todaySpent = 0.00;
    student.todaySpentDate = today;
    if (student.mealPlan && student.mealPlan.active) {
      student.mealPlan.remainingToday = student.mealPlan.creditsPerDay || 1;
    }
  }
}

// --- STUDENTS ENDPOINTS ---

app.get('/api/students', (req, res) => {
  try {
    const query = (req.query.q || '').trim().toLowerCase();
    const students = db.data.students.map(s => {
      refreshStudentDailySpend(s);
      return s;
    });
    db.save();

    if (!query) {
      return res.json(students);
    }

    const filtered = students.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query) ||
      (s.barcode && s.barcode.toLowerCase().includes(query)) ||
      s.studentNumber.toLowerCase().includes(query) ||
      s.grade.toLowerCase().includes(query)
    );
    res.json(filtered);
  } catch (err) {
    db.logError({
      category: 'DATABASE_QUERY',
      severity: 'ERROR',
      code: 'STUDENTS_FETCH_FAIL',
      message: 'Failed to retrieve students list',
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed to retrieve students' });
  }
});

app.get('/api/students/:id', (req, res) => {
  try {
    const { id } = req.params;
    const student = db.data.students.find(s => 
      s.id.toLowerCase() === id.toLowerCase() || 
      (s.barcode && s.barcode.toLowerCase() === id.toLowerCase()) || 
      s.studentNumber.toLowerCase() === id.toLowerCase()
    );
    if (!student) {
      return res.status(404).json({ error: 'Student not found in school database' });
    }
    refreshStudentDailySpend(student);
    db.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching student' });
  }
});

app.post('/api/students', (req, res) => {
  try {
    const { name, grade, walletBalance, dailySpendLimit, mealPlan, allergens, dietaryTags, categoryRestrictions, notes, parentContact } = req.body;
    if (!name || !grade) {
      return res.status(400).json({ error: 'Name and grade are required' });
    }

    const newId = `STU-${1000 + db.data.students.length + 1}`;
    const newStudent = {
      id: newId,
      studentNumber: `2024-${String(db.data.students.length + 1).padStart(3, '0')}`,
      barcode: `STU${1000 + db.data.students.length + 1}`,
      name,
      grade,
      photo: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      walletBalance: Number(walletBalance) || 0,
      dailySpendLimit: Number(dailySpendLimit) || 15.00,
      todaySpent: 0,
      todaySpentDate: getTodayString(),
      mealPlan: mealPlan || { active: false, tier: 'None', creditsPerDay: 0, remainingToday: 0, eligibleCategories: [] },
      allergens: allergens || [],
      dietaryTags: dietaryTags || [],
      categoryRestrictions: categoryRestrictions || [],
      notes: notes || '',
      parentContact: parentContact || ''
    };

    db.data.students.push(newStudent);
    db.logAudit({
      action: 'STUDENT_CREATED',
      user: 'School Admin',
      role: 'Admin',
      targetId: newStudent.id,
      targetType: 'Student',
      details: `Created new student record for ${newStudent.name} (${newStudent.grade}).`,
      after: newStudent
    });
    db.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ error: 'Failed creating student' });
  }
});

app.put('/api/students/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = db.data.students.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const before = JSON.parse(JSON.stringify(db.data.students[index]));
    const updated = {
      ...before,
      ...req.body,
      id: before.id
    };
    db.data.students[index] = updated;

    db.logAudit({
      action: 'STUDENT_UPDATED',
      user: 'School Admin',
      role: 'Admin',
      targetId: updated.id,
      targetType: 'Student',
      details: `Updated profile details for student ${updated.name}.`,
      before: { walletBalance: before.walletBalance, dailySpendLimit: before.dailySpendLimit, mealPlan: before.mealPlan },
      after: { walletBalance: updated.walletBalance, dailySpendLimit: updated.dailySpendLimit, mealPlan: updated.mealPlan }
    });

    db.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed updating student' });
  }
});

app.post('/api/students/:id/topup', (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMode, adminName, notes } = req.body;
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      db.logError({
        category: 'WALLET_TOPUP',
        severity: 'WARNING',
        code: 'INVALID_TOPUP_AMOUNT',
        message: `Attempted top-up with invalid amount "${amount}"`,
        studentId: id
      });
      return res.status(400).json({ error: 'Please enter a valid positive top-up amount' });
    }

    const student = db.data.students.find(s => s.id === id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const beforeBalance = student.walletBalance;
    student.walletBalance = Number((student.walletBalance + numAmount).toFixed(2));
    
    const topupRecord = {
      id: `TOP-${Date.now().toString().slice(-6)}`,
      studentId: student.id,
      studentName: student.name,
      amount: numAmount,
      paymentMode: paymentMode || 'Cash (Counter)',
      timestamp: new Date().toISOString(),
      adminName: adminName || 'Admin Cashier',
      notes: notes || '',
      newBalance: student.walletBalance
    };

    db.data.topups.unshift(topupRecord);

    db.logAudit({
      action: 'WALLET_TOPUP',
      user: adminName || 'Admin Cashier',
      role: 'Admin/Cashier',
      targetId: student.id,
      targetType: 'StudentWallet',
      details: `Loaded +$${numAmount.toFixed(2)} via ${paymentMode || 'Cash'}. Ref: ${topupRecord.id}.`,
      before: { balance: beforeBalance },
      after: { balance: student.walletBalance }
    });

    db.save();

    res.json({
      message: 'Top-up successful',
      student,
      topupRecord
    });
  } catch (err) {
    db.logError({
      category: 'WALLET_TOPUP',
      severity: 'ERROR',
      code: 'TOPUP_EXCEPTION',
      message: err.message,
      studentId: req.params.id,
      stack: err.stack
    });
    res.status(500).json({ error: 'Server error while processing wallet top-up' });
  }
});

// --- MENU / INVENTORY ENDPOINTS ---

app.get('/api/items', (req, res) => {
  const { category, period, activeOnly } = req.query;
  let items = db.data.menuItems;

  if (activeOnly === 'true') {
    items = items.filter(i => !i.isArchived);
  }
  if (category && category !== 'All') {
    items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }
  if (period && period !== 'All') {
    items = items.filter(i => i.activePeriods.includes(period));
  }

  res.json(items);
});

app.post('/api/items', (req, res) => {
  try {
    const { name, category, price, mealPlanEligible, portionsTotal, lowStockThreshold, dietaryBadges, allergens, activePeriods, description } = req.body;
    
    if (!name || !category || isNaN(price)) {
      return res.status(400).json({ error: 'Name, category, and valid price are required' });
    }

    const newItem = {
      id: `ITEM-${String(db.data.menuItems.length + 1).padStart(3, '0')}`,
      sku: `${category.substring(0, 3).toUpperCase()}-${String(db.data.menuItems.length + 1).padStart(3, '0')}`,
      barcode: `890${String(db.data.menuItems.length + 1).padStart(4, '0')}`,
      name,
      category,
      price: parseFloat(price),
      mealPlanEligible: Boolean(mealPlanEligible),
      portionsLeft: parseInt(portionsTotal, 10) || 30,
      portionsTotal: parseInt(portionsTotal, 10) || 30,
      lowStockThreshold: parseInt(lowStockThreshold, 10) || 10,
      dietaryBadges: dietaryBadges || [],
      allergens: allergens || [],
      activePeriods: activePeriods || ['Lunch'],
      isArchived: false,
      description: description || ''
    };

    db.data.menuItems.push(newItem);
    db.logAudit({
      action: 'MENU_ITEM_CREATED',
      user: 'Kitchen Manager',
      role: 'Admin',
      targetId: newItem.id,
      targetType: 'MenuItem',
      details: `Created menu item: ${newItem.name} (${newItem.category}) at $${newItem.price.toFixed(2)}.`,
      after: newItem
    });
    db.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed creating item' });
  }
});

app.put('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = db.data.menuItems.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const before = JSON.parse(JSON.stringify(db.data.menuItems[index]));
    const updated = {
      ...before,
      ...req.body,
      id: before.id
    };

    db.data.menuItems[index] = updated;
    db.logAudit({
      action: 'MENU_ITEM_UPDATED',
      user: 'Kitchen Manager',
      role: 'Admin',
      targetId: updated.id,
      targetType: 'MenuItem',
      details: `Updated item "${updated.name}". Portions: ${updated.portionsLeft}, Price: $${updated.price}.`,
      before: { price: before.price, portionsLeft: before.portionsLeft },
      after: { price: updated.price, portionsLeft: updated.portionsLeft }
    });
    db.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed updating item' });
  }
});

app.post('/api/items/:id/restock', (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reason, adminName } = req.body;
    const numQty = parseInt(quantity, 10);

    if (isNaN(numQty) || numQty <= 0) {
      return res.status(400).json({ error: 'Valid positive restock quantity required' });
    }

    const item = db.data.menuItems.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const beforePortions = item.portionsLeft;
    item.portionsLeft += numQty;
    item.portionsTotal += numQty;

    const log = {
      id: `RST-${Date.now().toString().slice(-6)}`,
      itemId: item.id,
      itemName: item.name,
      addedQuantity: numQty,
      newPortionsLeft: item.portionsLeft,
      timestamp: new Date().toISOString(),
      adminName: adminName || 'Kitchen Staff',
      reason: reason || 'Shift restock batch'
    };

    db.data.restockLogs.unshift(log);

    db.logAudit({
      action: 'PORTION_RESTOCK',
      user: adminName || 'Kitchen Staff',
      role: 'Kitchen',
      targetId: item.id,
      targetType: 'MenuItem',
      details: `Restocked ${numQty} portions of "${item.name}". Reason: ${reason || 'Kitchen prep'}.`,
      before: { portionsLeft: beforePortions },
      after: { portionsLeft: item.portionsLeft }
    });

    db.save();

    res.json({ message: 'Restocked successfully', item, log });
  } catch (err) {
    res.status(500).json({ error: 'Failed restocking item' });
  }
});

app.delete('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    const item = db.data.menuItems.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    item.isArchived = !item.isArchived;

    db.logAudit({
      action: item.isArchived ? 'MENU_ITEM_ARCHIVED' : 'MENU_ITEM_RESTORED',
      user: 'School Admin',
      role: 'Admin',
      targetId: item.id,
      targetType: 'MenuItem',
      details: `${item.isArchived ? 'Archived' : 'Restored'} item "${item.name}".`
    });

    db.save();
    res.json({ message: `Item ${item.isArchived ? 'archived' : 'restored'} successfully`, item });
  } catch (err) {
    res.status(500).json({ error: 'Failed changing item status' });
  }
});

// --- CHECKOUT & TRANSACTIONS ---

// Safety pre-check endpoint (for real-time cashier UI warnings)
app.post('/api/checkout/validate', (req, res) => {
  try {
    const { studentId, cartItems } = req.body;
    const warnings = [];
    const errors = [];

    let student = null;
    if (studentId) {
      student = db.data.students.find(s => s.id === studentId);
      if (student) {
        refreshStudentDailySpend(student);
      }
    }

    let subtotal = 0;
    let mealPlanEligibleCount = 0;

    for (const cartItem of cartItems || []) {
      const dbItem = db.data.menuItems.find(i => i.id === cartItem.id);
      if (!dbItem) {
        errors.push(`Item "${cartItem.name}" no longer exists in menu.`);
        continue;
      }

      if (dbItem.portionsLeft < cartItem.qty) {
        errors.push(`"${dbItem.name}" has only ${dbItem.portionsLeft} portions left (requested: ${cartItem.qty}).`);
      }

      subtotal += dbItem.price * cartItem.qty;

      // Check allergy warnings
      if (student && student.allergens && student.allergens.length > 0) {
        const conflictingAllergens = (dbItem.allergens || []).filter(a => 
          student.allergens.map(sa => sa.toLowerCase()).includes(a.toLowerCase())
        );
        if (conflictingAllergens.length > 0) {
          warnings.push({
            type: 'ALLERGY_ALERT',
            severity: 'HIGH',
            message: `CRITICAL ALLERGY ALERT: "${dbItem.name}" contains ${conflictingAllergens.join(', ')} which conflicts with ${student.name}'s medical record!`
          });
        }
      }

      // Check category restrictions
      if (student && student.categoryRestrictions && student.categoryRestrictions.length > 0) {
        for (const rule of student.categoryRestrictions) {
          if (rule.toLowerCase().includes('no sugary drinks') && dbItem.category === 'Drinks' && dbItem.name.toLowerCase().includes('sugary')) {
            warnings.push({
              type: 'RESTRICTION_ALERT',
              severity: 'MEDIUM',
              message: `PARENT RESTRICTION: "${dbItem.name}" violates student rule "${rule}".`
            });
          }
        }
      }

      // Check meal plan eligibility
      if (student && student.mealPlan && student.mealPlan.active && dbItem.mealPlanEligible) {
        mealPlanEligibleCount += cartItem.qty;
      }
    }

    // Calculate meal plan usage
    let mealPlanCreditsToUse = 0;
    let mealPlanDiscount = 0;
    if (student && student.mealPlan && student.mealPlan.active && student.mealPlan.remainingToday > 0 && mealPlanEligibleCount > 0) {
      mealPlanCreditsToUse = Math.min(student.mealPlan.remainingToday, 1);
      const highestEligible = (cartItems || [])
        .filter(c => {
          const i = db.data.menuItems.find(mi => mi.id === c.id);
          return i && i.mealPlanEligible;
        })
        .sort((a, b) => b.price - a.price)[0];
      
      if (highestEligible) {
        mealPlanDiscount = highestEligible.price;
      }
    }

    const finalPayable = Math.max(0, subtotal - mealPlanDiscount);

    // Check daily spend limit
    if (student && student.dailySpendLimit > 0) {
      const projectedToday = student.todaySpent + finalPayable;
      if (projectedToday > student.dailySpendLimit) {
        warnings.push({
          type: 'DAILY_LIMIT_ALERT',
          severity: 'MEDIUM',
          message: `Daily spending cap notice: Adding $${finalPayable.toFixed(2)} will bring today's total to $${projectedToday.toFixed(2)} (Limit: $${student.dailySpendLimit.toFixed(2)}).`
        });
      }
    }

    let hasSufficientWallet = true;
    if (student && finalPayable > student.walletBalance) {
      hasSufficientWallet = false;
    }

    res.json({
      valid: errors.length === 0,
      errors,
      warnings,
      subtotal: Number(subtotal.toFixed(2)),
      mealPlanDiscount: Number(mealPlanDiscount.toFixed(2)),
      finalPayable: Number(finalPayable.toFixed(2)),
      mealPlanCreditsToUse,
      studentBalance: student ? student.walletBalance : null,
      hasSufficientWallet
    });
  } catch (err) {
    res.status(500).json({ valid: false, errors: ['Error running validation engine'] });
  }
});

// Process complete checkout with atomic guarantees
app.post('/api/checkout', (req, res) => {
  // Snapshot database state before mutation for atomic rollback
  const dbSnapshot = JSON.stringify(db.data);

  try {
    const { 
      studentId, 
      cartItems, 
      paymentMode, // 'MEAL_PLAN', 'WALLET', 'CASH', 'CARD', 'SPLIT'
      cashTendered,
      cashierName,
      checkoutDurationSeconds,
      overrideWarnings
    } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty. Please add items before checking out.' });
    }

    let student = null;
    if (studentId) {
      student = db.data.students.find(s => s.id === studentId);
      if (student) {
        refreshStudentDailySpend(student);
      }
    }

    // 1. Verify inventory
    for (const c of cartItems) {
      const item = db.data.menuItems.find(i => i.id === c.id);
      if (!item) {
        throw new Error(`Item "${c.name}" was removed from the system.`);
      }
      if (item.portionsLeft < c.qty) {
        db.logError({
          category: 'INVENTORY_STOCKOUT',
          severity: 'WARNING',
          code: 'INSUFFICIENT_STOCK',
          message: `Overselling prevented: "${item.name}" only has ${item.portionsLeft} portions left.`,
          user: cashierName,
          context: { requested: c.qty, available: item.portionsLeft }
        });
        return res.status(400).json({ 
          error: `Item just sold out: "${item.name}" only has ${item.portionsLeft} portions left.` 
        });
      }
    }

    // 2. Line items & subtotal
    let subtotal = 0;
    let mealPlanDiscount = 0;
    let mealPlanCreditUsed = 0;

    const receiptItems = cartItems.map(c => {
      const item = db.data.menuItems.find(i => i.id === c.id);
      const lineTotal = item.price * c.qty;
      subtotal += lineTotal;
      return {
        itemId: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        qty: c.qty,
        lineTotal: Number(lineTotal.toFixed(2)),
        coveredByMealPlan: false
      };
    });

    // Check Meal Plan Coverage
    if (student && student.mealPlan && student.mealPlan.active && student.mealPlan.remainingToday > 0) {
      const eligibleLine = receiptItems.find(ri => {
        const mi = db.data.menuItems.find(x => x.id === ri.itemId);
        return mi && mi.mealPlanEligible;
      });

      if (eligibleLine) {
        mealPlanCreditUsed = 1;
        mealPlanDiscount = eligibleLine.price;
        eligibleLine.coveredByMealPlan = true;
      }
    }

    const finalPayable = Number(Math.max(0, subtotal - mealPlanDiscount).toFixed(2));

    // 3. Process payment deduction
    let paymentRecord = {
      type: paymentMode || 'CASH',
      subtotal: Number(subtotal.toFixed(2)),
      mealPlanCredits: mealPlanCreditUsed,
      mealPlanDiscount: Number(mealPlanDiscount.toFixed(2)),
      finalPayable: Number(finalPayable.toFixed(2)),
      walletDeduction: 0,
      cashTendered: 0,
      changeGiven: 0,
      cardAmount: 0
    };

    if (student && (paymentMode === 'WALLET' || paymentMode === 'SPLIT' || (paymentMode === 'MEAL_PLAN' && finalPayable > 0))) {
      if (student.walletBalance < finalPayable && paymentMode === 'WALLET') {
        db.logError({
          category: 'CHECKOUT_BLOCKED',
          severity: 'WARNING',
          code: 'INSUFFICIENT_FUNDS',
          message: `Insufficient student wallet: ${student.name} balance is $${student.walletBalance.toFixed(2)}, cart requires $${finalPayable.toFixed(2)}.`,
          studentId: student.id,
          user: cashierName
        });
        return res.status(400).json({ 
          error: `Insufficient wallet balance: Student balance is $${student.walletBalance.toFixed(2)}, but $${finalPayable.toFixed(2)} is required.` 
        });
      }

      const deduction = Math.min(student.walletBalance, finalPayable);
      student.walletBalance = Number((student.walletBalance - deduction).toFixed(2));
      student.todaySpent = Number((student.todaySpent + deduction).toFixed(2));
      paymentRecord.walletDeduction = deduction;

      const remainingCashNeeded = Number((finalPayable - deduction).toFixed(2));
      if (remainingCashNeeded > 0) {
        paymentRecord.type = 'SPLIT';
        paymentRecord.cashTendered = parseFloat(cashTendered) || remainingCashNeeded;
        paymentRecord.changeGiven = Number(Math.max(0, paymentRecord.cashTendered - remainingCashNeeded).toFixed(2));
      }
    } else if (paymentMode === 'CASH') {
      const tendered = parseFloat(cashTendered) || finalPayable;
      if (tendered < finalPayable) {
        return res.status(400).json({ 
          error: `Insufficient cash tendered: Received $${tendered.toFixed(2)}, required $${finalPayable.toFixed(2)}.` 
        });
      }
      paymentRecord.cashTendered = tendered;
      paymentRecord.changeGiven = Number((tendered - finalPayable).toFixed(2));
      if (student) {
        student.todaySpent = Number((student.todaySpent + finalPayable).toFixed(2));
      }
    } else if (paymentMode === 'CARD') {
      paymentRecord.cardAmount = finalPayable;
      if (student) {
        student.todaySpent = Number((student.todaySpent + finalPayable).toFixed(2));
      }
    } else if (paymentMode === 'MEAL_PLAN' && finalPayable === 0) {
      paymentRecord.type = 'MEAL_PLAN';
    }

    // Deduct meal plan credit from student
    if (student && mealPlanCreditUsed > 0) {
      student.mealPlan.remainingToday = Math.max(0, student.mealPlan.remainingToday - mealPlanCreditUsed);
    }

    // 4. Decrement inventory portions
    for (const c of cartItems) {
      const item = db.data.menuItems.find(i => i.id === c.id);
      if (item) {
        item.portionsLeft = Math.max(0, item.portionsLeft - c.qty);
      }
    }

    // 5. Create transaction record
    const currentShift = db.data.shifts.find(s => s.status === 'OPEN') || db.data.shifts[0];
    const receiptNum = `REC-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(db.data.transactions.length + 1).padStart(4, '0')}`;
    
    const tx = {
      id: `TX-${Date.now().toString().slice(-6)}`,
      receiptNumber: receiptNum,
      timestamp: new Date().toISOString(),
      studentId: student ? student.id : null,
      studentName: student ? student.name : 'Walk-in Guest / Staff',
      studentGrade: student ? student.grade : 'General',
      cashierName: cashierName || 'Cashier Station 1',
      shiftId: currentShift ? currentShift.id : null,
      items: receiptItems,
      subtotal: Number(subtotal.toFixed(2)),
      mealPlanDiscount: Number(mealPlanDiscount.toFixed(2)),
      totalCharged: finalPayable,
      paymentMethod: paymentRecord,
      status: 'COMPLETED',
      checkoutDurationSeconds: parseFloat(checkoutDurationSeconds) || 4.2
    };

    db.data.transactions.unshift(tx);

    // Audit log
    db.logAudit({
      action: 'CHECKOUT_COMPLETED',
      user: cashierName || 'Cashier Station 1',
      role: 'Cashier',
      targetId: tx.receiptNumber,
      targetType: 'Transaction',
      details: `Completed order for ${tx.studentName}. Total: $${tx.totalCharged.toFixed(2)} (Method: ${paymentRecord.type}, Speed: ${tx.checkoutDurationSeconds}s).`,
      after: { receiptNumber: tx.receiptNumber, totalCharged: tx.totalCharged }
    });

    db.save();

    res.status(201).json({
      message: 'Checkout successful',
      transaction: tx,
      student: student ? {
        id: student.id,
        name: student.name,
        walletBalance: student.walletBalance,
        mealPlanRemaining: student.mealPlan ? student.mealPlan.remainingToday : 0,
        todaySpent: student.todaySpent
      } : null
    });
  } catch (err) {
    // Atomic rollback in case of runtime exception
    console.error('Checkout runtime error, rolling back state:', err);
    db.data = JSON.parse(dbSnapshot);
    db.save();

    db.logError({
      category: 'CHECKOUT_TRANSACTION_FAILED',
      severity: 'CRITICAL',
      code: 'ATOMIC_ROLLBACK',
      message: `Checkout transaction aborted and rolled back: ${err.message}`,
      stack: err.stack,
      user: req.body.cashierName
    });

    res.status(500).json({ error: 'System error processing transaction. No balance or inventory was charged.' });
  }
});

app.get('/api/transactions', (req, res) => {
  const { studentId, shiftId, limit } = req.query;
  let txs = db.data.transactions;

  if (studentId) {
    txs = txs.filter(t => t.studentId === studentId);
  }
  if (shiftId) {
    txs = txs.filter(t => t.shiftId === shiftId);
  }

  if (limit) {
    txs = txs.slice(0, parseInt(limit, 10));
  }

  res.json(txs);
});

// Void / Refund transaction
app.post('/api/transactions/:id/void', (req, res) => {
  try {
    const { id } = req.params;
    const { reason, authorizedBy } = req.body;

    const tx = db.data.transactions.find(t => t.id === id || t.receiptNumber === id);
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (tx.status === 'VOIDED') {
      return res.status(400).json({ error: 'Transaction is already voided' });
    }

    tx.status = 'VOIDED';
    tx.voidReason = reason || 'Customer request / error';
    tx.voidedBy = authorizedBy || 'Supervisor';
    tx.voidedAt = new Date().toISOString();

    // Restore inventory portions
    for (const item of tx.items) {
      const mi = db.data.menuItems.find(m => m.id === item.itemId);
      if (mi) {
        mi.portionsLeft += item.qty;
      }
    }

    // Restore student wallet / meal plan credit
    if (tx.studentId) {
      const student = db.data.students.find(s => s.id === tx.studentId);
      if (student) {
        if (tx.paymentMethod.walletDeduction > 0) {
          student.walletBalance = Number((student.walletBalance + tx.paymentMethod.walletDeduction).toFixed(2));
          student.todaySpent = Math.max(0, Number((student.todaySpent - tx.paymentMethod.walletDeduction).toFixed(2)));
        }
        if (tx.paymentMethod.mealPlanCredits > 0 && student.mealPlan) {
          student.mealPlan.remainingToday += tx.paymentMethod.mealPlanCredits;
        }
      }
    }

    db.logAudit({
      action: 'TRANSACTION_VOIDED',
      user: authorizedBy || 'Supervisor',
      role: 'Admin',
      targetId: tx.receiptNumber,
      targetType: 'Transaction',
      details: `Voided transaction ${tx.receiptNumber}. Refunded $${tx.totalCharged.toFixed(2)}. Reason: ${tx.voidReason}.`,
      after: { status: 'VOIDED', voidReason: tx.voidReason }
    });

    db.save();
    res.json({ message: 'Transaction voided and refunded successfully', transaction: tx });
  } catch (err) {
    db.logError({
      category: 'VOID_TRANSACTION',
      severity: 'ERROR',
      code: 'VOID_FAILED',
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed voiding transaction' });
  }
});

// --- SHIFTS & DASHBOARD METRICS ---

app.get('/api/shifts/current', (req, res) => {
  const openShift = db.data.shifts.find(s => s.status === 'OPEN');
  if (!openShift) {
    return res.json({ active: false, shift: null });
  }

  const shiftTxs = db.data.transactions.filter(t => t.shiftId === openShift.id && t.status === 'COMPLETED');
  
  let cashSales = 0;
  let cardSales = 0;
  let walletSales = 0;
  let mealPlanDiscounts = 0;
  let totalSales = 0;

  for (const t of shiftTxs) {
    totalSales += t.totalCharged;
    mealPlanDiscounts += t.mealPlanDiscount || 0;
    if (t.paymentMethod.cashTendered > 0) {
      cashSales += (t.paymentMethod.cashTendered - t.paymentMethod.changeGiven);
    }
    if (t.paymentMethod.cardAmount > 0) {
      cardSales += t.paymentMethod.cardAmount;
    }
    if (t.paymentMethod.walletDeduction > 0) {
      walletSales += t.paymentMethod.walletDeduction;
    }
  }

  const expectedCashInDrawer = Number((openShift.openingFloat + cashSales).toFixed(2));

  res.json({
    active: true,
    shift: openShift,
    metrics: {
      transactionCount: shiftTxs.length,
      totalSales: Number(totalSales.toFixed(2)),
      mealPlanVouchersValue: Number(mealPlanDiscounts.toFixed(2)),
      cashSales: Number(cashSales.toFixed(2)),
      cardSales: Number(cardSales.toFixed(2)),
      walletSales: Number(walletSales.toFixed(2)),
      openingFloat: openShift.openingFloat,
      expectedCashInDrawer
    }
  });
});

app.post('/api/shifts/open', (req, res) => {
  try {
    const { cashierName, openingFloat, notes } = req.body;
    const existingOpen = db.data.shifts.find(s => s.status === 'OPEN');
    if (existingOpen) {
      return res.status(400).json({ error: 'A register shift is currently open. Close it before starting a new shift.' });
    }

    const newShift = {
      id: `SHIFT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(db.data.shifts.length + 1).padStart(2, '0')}`,
      cashierName: cashierName || 'Cashier Station 1',
      startTime: new Date().toISOString(),
      endTime: null,
      openingFloat: parseFloat(openingFloat) || 100.00,
      status: 'OPEN',
      notes: notes || ''
    };

    db.data.shifts.unshift(newShift);
    db.logAudit({
      action: 'SHIFT_OPENED',
      user: newShift.cashierName,
      role: 'Cashier',
      targetId: newShift.id,
      targetType: 'Shift',
      details: `Shift opened with initial float $${newShift.openingFloat.toFixed(2)}.`,
      after: newShift
    });
    db.save();
    res.status(201).json(newShift);
  } catch (err) {
    res.status(500).json({ error: 'Failed opening shift' });
  }
});

app.post('/api/shifts/close', (req, res) => {
  try {
    const { countedCash, notes } = req.body;
    const openShift = db.data.shifts.find(s => s.status === 'OPEN');
    if (!openShift) {
      return res.status(400).json({ error: 'No open register shift found to reconcile' });
    }

    const shiftTxs = db.data.transactions.filter(t => t.shiftId === openShift.id && t.status === 'COMPLETED');
    let cashSales = 0;
    for (const t of shiftTxs) {
      if (t.paymentMethod.cashTendered > 0) {
        cashSales += (t.paymentMethod.cashTendered - t.paymentMethod.changeGiven);
      }
    }

    const expectedCash = Number((openShift.openingFloat + cashSales).toFixed(2));
    const actualCounted = parseFloat(countedCash) || 0;
    const discrepancy = Number((actualCounted - expectedCash).toFixed(2));

    openShift.status = 'CLOSED';
    openShift.endTime = new Date().toISOString();
    openShift.expectedCash = expectedCash;
    openShift.actualCashCounted = actualCounted;
    openShift.discrepancy = discrepancy;
    openShift.closingNotes = notes || '';

    db.logAudit({
      action: 'SHIFT_CLOSED_RECONCILED',
      user: openShift.cashierName,
      role: 'Cashier',
      targetId: openShift.id,
      targetType: 'Shift',
      details: `Shift closed. Expected: $${expectedCash.toFixed(2)}, Counted: $${actualCounted.toFixed(2)}, Diff: $${discrepancy.toFixed(2)}.`,
      after: openShift
    });

    db.save();
    res.json({
      message: 'Shift closed successfully',
      shift: openShift,
      summary: {
        openingFloat: openShift.openingFloat,
        cashSales: Number(cashSales.toFixed(2)),
        expectedCash,
        actualCounted,
        discrepancy,
        status: discrepancy === 0 ? 'BALANCED' : discrepancy > 0 ? 'OVER' : 'SHORT'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed closing shift' });
  }
});

app.get('/api/dashboard/stats', (req, res) => {
  try {
    const today = getTodayString();
    const todayTxs = db.data.transactions.filter(t => 
      t.timestamp.startsWith(today) && t.status === 'COMPLETED'
    );

    let totalRevenue = 0;
    let totalMealPlanValue = 0;
    let cashTotal = 0;
    let cardTotal = 0;
    let walletTotal = 0;
    let checkoutTimes = [];

    const itemSalesMap = {};

    for (const t of todayTxs) {
      totalRevenue += t.totalCharged;
      totalMealPlanValue += t.mealPlanDiscount || 0;
      if (t.checkoutDurationSeconds) {
        checkoutTimes.push(t.checkoutDurationSeconds);
      }

      if (t.paymentMethod.cashTendered > 0) {
        cashTotal += (t.paymentMethod.cashTendered - t.paymentMethod.changeGiven);
      }
      if (t.paymentMethod.cardAmount > 0) {
        cardTotal += t.paymentMethod.cardAmount;
      }
      if (t.paymentMethod.walletDeduction > 0) {
        walletTotal += t.paymentMethod.walletDeduction;
      }

      for (const item of t.items) {
        if (!itemSalesMap[item.name]) {
          itemSalesMap[item.name] = { name: item.name, category: item.category, qtySold: 0, revenue: 0 };
        }
        itemSalesMap[item.name].qtySold += item.qty;
        itemSalesMap[item.name].revenue += item.price * item.qty;
      }
    }

    const topItems = Object.values(itemSalesMap).sort((a, b) => b.qtySold - a.qtySold).slice(0, 5);
    const lowStockItems = db.data.menuItems.filter(i => !i.isArchived && i.portionsLeft <= i.lowStockThreshold);

    const avgCheckoutSec = checkoutTimes.length > 0 
      ? Number((checkoutTimes.reduce((a, b) => a + b, 0) / checkoutTimes.length).toFixed(1)) 
      : 4.2;

    // Remaining daily portions summary
    const totalPortionsAvailable = db.data.menuItems
      .filter(i => !i.isArchived)
      .reduce((sum, item) => sum + item.portionsLeft, 0);

    res.json({
      totalTransactions: todayTxs.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalMealPlanValue: Number(totalMealPlanValue.toFixed(2)),
      avgCheckoutSec,
      totalPortionsAvailable,
      paymentBreakdown: {
        wallet: Number(walletTotal.toFixed(2)),
        mealPlanCredits: Number(totalMealPlanValue.toFixed(2)),
        cash: Number(cashTotal.toFixed(2)),
        card: Number(cardTotal.toFixed(2))
      },
      topSellingItems: topItems,
      lowStockAlerts: lowStockItems.map(i => ({
        id: i.id,
        name: i.name,
        category: i.category,
        portionsLeft: i.portionsLeft,
        lowStockThreshold: i.lowStockThreshold,
        isSoldOut: i.portionsLeft === 0
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed compiling dashboard metrics' });
  }
});

// --- AUDIT & SYSTEM ERROR LOGS ---

app.get('/api/audit-logs', (req, res) => {
  const { action, limit } = req.query;
  let logs = db.data.auditLogs || [];
  if (action && action !== 'All') {
    logs = logs.filter(l => l.action === action);
  }
  if (limit) {
    logs = logs.slice(0, parseInt(limit, 10));
  }
  res.json(logs);
});

app.get('/api/error-logs', (req, res) => {
  const { severity, limit } = req.query;
  let logs = db.data.errorLogs || [];
  if (severity && severity !== 'All') {
    logs = logs.filter(l => l.severity === severity);
  }
  if (limit) {
    logs = logs.slice(0, parseInt(limit, 10));
  }
  res.json(logs);
});

app.get('/api/system/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    database: {
      studentsCount: db.data.students.length,
      menuItemsCount: db.data.menuItems.length,
      transactionsCount: db.data.transactions.length,
      auditLogsCount: (db.data.auditLogs || []).length,
      errorLogsCount: (db.data.errorLogs || []).length
    },
    version: '2.4.0-school-pos'
  });
});

// Reset demo data
app.post('/api/reset', (req, res) => {
  const freshData = db.reset();
  db.logAudit({
    action: 'DATABASE_RESET_DEMO',
    user: 'System Admin',
    role: 'Admin',
    details: 'Reset system database to fresh demo seed dataset.'
  });
  res.json({ message: 'Database reset to default seed data successfully', data: freshData });
});

// Serve frontend static build if present
const fs = require('fs');
const path = require('path');
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`School POS Server running on port ${PORT}`);
  });
}

module.exports = app;


