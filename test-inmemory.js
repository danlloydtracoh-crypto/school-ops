const app = require('./server/index');
const db = require('./server/db');
const { EventEmitter } = require('events');

function invoke(method, url, body = null) {
  return new Promise((resolve, reject) => {
    const [pathPart, queryPart] = url.split('?');
    const query = {};
    if (queryPart) {
      const sp = new URLSearchParams(queryPart);
      for (const [k, v] of sp.entries()) {
        query[k] = v;
      }
    }

    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.originalUrl = url;
    req.path = pathPart;
    req.headers = { 'content-type': 'application/json' };
    req.query = query;
    req.params = {};
    req.body = body || {};

    const res = new EventEmitter();
    res.statusCode = 200;
    res.headers = {};
    res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; };
    res.getHeader = (k) => res.headers[k.toLowerCase()];
    res.status = (code) => { res.statusCode = code; return res; };
    
    let resolved = false;
    const finish = (data) => {
      if (!resolved) {
        resolved = true;
        resolve({ status: res.statusCode, body: data });
      }
    };

    res.json = (data) => finish(data);
    res.send = (data) => finish(data);
    res.end = (data) => finish(data);

    // Express handler
    app(req, res, (err) => {
      if (err) reject(err);
      else finish({ status: 404, error: 'Not found' });
    });
  });
}

async function runTests() {
  console.log('--- EXECUTING SCHOOL POS DIRECT IN-MEMORY API VERIFICATION ---');

  // Reset demo data first
  db.reset();

  // Test 1: System Health
  const health = await invoke('GET', '/api/system/health');
  console.log(`[TEST 1] System Health: Status ${health.status}, App Status: ${health.body?.status}, Items: ${health.body?.database?.menuItemsCount}, Students: ${health.body?.database?.studentsCount}`);
  if (health.status !== 200 || health.body?.status !== 'ONLINE') throw new Error('Health check failed');

  // Test 2: Student Search
  const students = await invoke('GET', '/api/students?q=Liam');
  console.log(`[TEST 2] Student Search ("Liam"): Found ${students.body?.length} student(s) -> ${students.body[0]?.name} (Allergens: ${students.body[0]?.allergens.join(', ')})`);
  if (!students.body || students.body.length === 0) throw new Error('Student search failed');

  // Test 3: Menu Items
  const items = await invoke('GET', '/api/items?category=Hot%20Meals');
  console.log(`[TEST 3] Hot Meals Query: Found ${items.body?.length} hot meals (e.g. "${items.body[0]?.name}", portions left: ${items.body[0]?.portionsLeft})`);
  if (!items.body || items.body.length === 0) throw new Error('Items query failed');

  // Test 4: Allergy Validation
  const allergyCheck = await invoke('POST', '/api/checkout/validate', {
    studentId: 'STU-1001',
    cartItems: [{ id: 'ITEM-010', name: 'Peanut Crunch Granola Bar', qty: 1 }]
  });
  const hasAllergyAlert = allergyCheck.body?.warnings?.some(w => w.type === 'ALLERGY_ALERT');
  console.log(`[TEST 4] Allergy Guardrail Validation: ${hasAllergyAlert ? 'PASSED (Peanut allergy caught)' : 'FAILED'}`);
  if (!hasAllergyAlert) throw new Error('Allergy validation failed');

  // Test 5: Meal Plan Voucher + Wallet Split Checkout
  const checkout = await invoke('POST', '/api/checkout', {
    studentId: 'STU-1001',
    cartItems: [
      { id: 'ITEM-001', name: 'Signature Jollof Rice & Herb Chicken', qty: 1 },
      { id: 'ITEM-017', name: 'Fresh Crisp Royal Gala Apple', qty: 1 }
    ],
    paymentMode: 'WALLET',
    cashierName: 'Maria Jenkins',
    checkoutDurationSeconds: 3.4
  });

  console.log(`[TEST 5] Checkout Completed: Status ${checkout.status}`);
  console.log(`  -> Receipt: ${checkout.body?.transaction?.receiptNumber}`);
  console.log(`  -> Subtotal: $${checkout.body?.transaction?.subtotal.toFixed(2)}`);
  console.log(`  -> Meal Voucher Discount: -$${checkout.body?.transaction?.mealPlanDiscount.toFixed(2)}`);
  console.log(`  -> Total Charged to Wallet: $${checkout.body?.transaction?.totalCharged.toFixed(2)}`);
  console.log(`  -> Remaining Student Wallet: $${checkout.body?.student?.walletBalance.toFixed(2)}`);
  console.log(`  -> Remaining Meal Plan Vouchers Today: ${checkout.body?.student?.mealPlanRemaining}`);
  if (checkout.status !== 201) throw new Error('Checkout test failed');

  // Test 6: Wallet Top-Up
  const topup = await invoke('POST', '/api/students/STU-1004/topup', {
    amount: 25.00,
    paymentMode: 'Cash (Front Desk)',
    adminName: 'Supervisor Jane',
    notes: 'Parent deposited cash'
  });
  console.log(`[TEST 6] Student Wallet Top-Up: ${topup.body?.student?.name} new balance: $${topup.body?.student?.walletBalance.toFixed(2)}`);
  if (topup.status !== 200) throw new Error('Top-up test failed');

  // Test 7: Kitchen Inventory Restock
  const restock = await invoke('POST', '/api/items/ITEM-001/restock', {
    quantity: 20,
    reason: 'Lunch batch second prep',
    adminName: 'Chef Roland'
  });
  console.log(`[TEST 7] Kitchen Restock Batch: ${restock.body?.item?.name} new portions: ${restock.body?.item?.portionsLeft}`);
  if (restock.status !== 200) throw new Error('Restock test failed');

  // Test 8: End-of-Day Shift Close & Cash Drawer Reconciliation
  const closeShift = await invoke('POST', '/api/shifts/close', {
    countedCash: 105.50,
    notes: 'Shift drawer reconciliation'
  });
  console.log(`[TEST 8] Shift Reconciliation: Status: ${closeShift.body?.summary?.status}, Expected: $${closeShift.body?.summary?.expectedCash}, Counted: $${closeShift.body?.summary?.actualCounted}, Diff: $${closeShift.body?.summary?.discrepancy}`);
  if (closeShift.status !== 200) throw new Error('Shift close failed');

  // Test 9: Open New Shift
  const openShift = await invoke('POST', '/api/shifts/open', {
    cashierName: 'Maria Jenkins (Station 1)',
    openingFloat: 100.00,
    notes: 'After-school tuck shop shift'
  });
  console.log(`[TEST 9] Open Shift: Created ${openShift.body?.id} with float $${openShift.body?.openingFloat}`);
  if (openShift.status !== 201) throw new Error('Open shift failed');

  // Test 10: Immutable Audit Log Verification
  const auditLogs = await invoke('GET', '/api/audit-logs');
  console.log(`[TEST 10] Audit Ledger: ${auditLogs.body?.length} immutable events recorded.`);
  if (!auditLogs.body || auditLogs.body.length === 0) throw new Error('Audit log verification failed');

  // Test 11: Transaction Void & Refund
  const txId = checkout.body?.transaction?.id;
  const voidResult = await invoke('POST', `/api/transactions/${txId}/void`, {
    reason: 'Customer took incorrect meal',
    authorizedBy: 'Shift Supervisor'
  });
  console.log(`[TEST 11] Void & Refund: ${voidResult.body?.message}`);
  if (voidResult.status !== 200) throw new Error('Void test failed');

  console.log('\n======================================================');
  console.log('✓ ALL 11 WORKFLOW AND API TEST SUITES PASSED FLAWLESSLY!');
  console.log('======================================================');
  process.exit(0);
}

runTests().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
