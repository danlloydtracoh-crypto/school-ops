# Oakridge School Cafeteria & Tuck Shop Point-of-Sale (POS)

A queue-optimized, safety-first Point-of-Sale web application built specifically for school cafeterias, tuck shops, bookshops, and uniform desks. Engineered for peak lunch and break queues (< 10 seconds per student checkout) with built-in student safety guardrails, cashless student wallets, prepaid meal plans, and end-of-day drawer reconciliation.

---

## 🚀 Key Features

### 1. High-Speed Cashier Checkout & Touch Grid
- **One-Tap Category Filters:** Instant switching between *Hot Meals*, *Combos*, *Snacks*, *Drinks*, and *Bakery/Fruit*.
- **Visual Dietary & Allergen Badges:** Color-coded badges (*Vegetarian*, *Vegan*, *Halal*, *Nut-Free*, *Gluten-Free*, *Dairy-Free*) on every meal card.
- **Queue-Optimized Layout:** Split-screen interface (touch menu grid on the left, student identification & live cart on the right).
- **Fast Cart Operations:** One-tap item additions, +/- quantity controls, real-time subtotal, void support, and checkout speed timer.

### 2. Student Identification & Safety Guardrails
- **Instant Student Lookup:** Instant search by name, student number, class/grade, or barcode scan.
- **Critical Allergy Banners:** Automatic, prominent red alert banner if an item in the cart conflicts with a student's recorded medical allergies (e.g. *Liam Chen's severe peanut allergy*).
- **Parent Category Restrictions:** Restricts unapproved items (e.g., *"No sugary drinks"* or *"Max 1 snack per day"*).
- **Prepaid Meal Plans & Cashless Wallets:** Automatically redeems daily lunch vouchers for eligible hot meals/combos and charges snacks or extras directly to the student's cashless wallet, with cash/card fallback.
- **Daily Spending Limits:** Enforces configurable per-student daily spending caps, warning cashiers when a student approaches or exceeds their daily limit.

### 3. Kitchen & Daily Menu Management
- **Daily Menu Planner:** Toggle meal items active/inactive by meal period (*Breakfast*, *Break*, *Lunch*).
- **Live Portion Tracking:** Real-time portion count decrements upon checkout, with low-stock warnings and out-of-stock prevention.
- **Batch Restocking:** One-tap `+10` or `+25` portion restock buttons with audit logging.

### 4. Shifts & Cash Drawer Reconciliation
- **Shift Revenue Breakdown:** Real-time tracking of cash sales, card sales, cashless wallet deductions, and meal plan vouchers redeemed.
- **End-of-Day Reconciliation:** Cash drawer calculator comparing opening float + cash sales against counted physical cash, highlighting exact over/short discrepancies.

### 5. Supervisor Voids & Transaction Audit
- **80mm Thermal Receipt Generator:** Printable mini ticket receipts with school crest, cashier ID, itemized vouchers, and barcodes.
- **Authorized Voids & Refunds:** Automatically restores inventory portions to the kitchen and reimburses student wallet balances or meal credits.

### 6. Immutable Audit Trail & Runtime Error Diagnostics
- **Immutable Audit Ledger:** Tracks every sensitive event (*SHIFT_OPEN*, *WALLET_TOPUP*, *PORTION_RESTOCK*, *CHECKOUT_COMPLETED*, *TRANSACTION_VOIDED*) with timestamps, roles, and before/after values.
- **Runtime Error Diagnostics:** Filterable admin view of runtime errors and safety interceptions, complete with a one-click **"Copy Error Details"** button for fast debugging.

---

## 🛠️ Data Model & Architecture

```
                  ┌────────────────────────────────────────┐
                  │      React 18 + Tailwind UI            │
                  │   (Vite + Lucide Icons + Print CSS)    │
                  └───────────────────┬────────────────────┘
                                      │ /api REST
                                      ▼
                  ┌────────────────────────────────────────┐
                  │     Express.js Application Server      │
                  │  (Atomic Validation & Business Rules)  │
                  └───────────────────┬────────────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
     ┌────────────────────┐                        ┌───────────────────┐
     │  Primary Entities  │                        │  Audit & Safety   │
     │  - Students        │                        │  - AuditLogs      │
     │  - MenuItems       │                        │  - ErrorLogs      │
     │  - Shifts          │                        │  - RestockLogs    │
     │  - Transactions    │                        │  - TopupRecords   │
     └────────────────────┘                        └───────────────────┘
```

---

## 🏃 Quick Start

### 1. Start the Full-Stack Server
```bash
# In C:\Users\HP\.gemini\antigravity\scratch\school-pos:
npm start
```
The server will start at `http://localhost:4000`, serving both the backend REST API and the production client application.

### 2. Development Mode
To run Vite with hot-module reloading:
```bash
# Terminal 1:
npm run server

# Terminal 2:
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Run Automated E2E Verification
```bash
node test-inmemory.js
```
Runs 11 end-to-end integration tests verifying health, student lookups, allergy safety guardrails, meal plan voucher deductions, wallet top-ups, batch restocks, shift reconciliation, and transaction voids.
