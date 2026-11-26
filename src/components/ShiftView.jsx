import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { 
  DollarSign, TrendingUp, CreditCard, Award, 
  CheckCircle, AlertTriangle, ShieldCheck, Clock, 
  Printer, Lock, Unlock, Zap 
} from 'lucide-react';

export default function ShiftView() {
  const { 
    currentShift, 
    dashboardStats, 
    closeCurrentShift, 
    openNewShift, 
    notifySuccess 
  } = usePos();

  const [countedCashInput, setCountedCashInput] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [openingFloatInput, setOpeningFloatInput] = useState('100.00');
  const [openingNotes, setOpeningNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeShift = currentShift?.active ? currentShift.shift : null;
  const metrics = currentShift?.metrics || {
    transactionCount: 0,
    totalSales: 0,
    cashSales: 0,
    cardSales: 0,
    walletSales: 0,
    mealPlanVouchersValue: 0,
    openingFloat: 100,
    expectedCashInDrawer: 100
  };

  const countedNum = parseFloat(countedCashInput) || 0;
  const discrepancy = Number((countedNum - metrics.expectedCashInDrawer).toFixed(2));

  const handleCloseShift = async (e) => {
    e.preventDefault();
    if (!countedCashInput) return;
    setIsSubmitting(true);
    await closeCurrentShift(countedNum, closingNotes);
    setIsSubmitting(false);
  };

  const handleOpenShift = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await openNewShift(openingFloatInput, openingNotes);
    setIsSubmitting(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-4 space-y-4">
      {/* Shift Status Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-2xl text-white ${activeShift ? 'bg-emerald-600' : 'bg-slate-700'}`}>
            {activeShift ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {activeShift ? `Register Shift: ${activeShift.id}` : 'Register Closed'}
              </h1>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                activeShift ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {activeShift ? '● Active Cashier Shift' : 'Shift Inactive'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeShift 
                ? `Station 1 • Cashier: ${activeShift.cashierName} • Started: ${new Date(activeShift.startTime).toLocaleTimeString()}`
                : 'No shift currently running. Open a shift below with an opening cash float to begin transactions.'}
            </p>
          </div>
        </div>

        {/* Speed Indicator */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
          <Zap className="w-5 h-5 text-amber-500" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Checkout Speed</span>
            <span className="text-sm font-black text-slate-800">{dashboardStats?.avgCheckoutSec || '4.2'} seconds / student</span>
          </div>
        </div>
      </div>

      {/* Real-Time Shift Revenue Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block">Today's Total Sales</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ${dashboardStats?.totalRevenue.toFixed(2) || '0.00'}
          </div>
          <span className="text-xs text-slate-500 block mt-1">
            {dashboardStats?.totalTransactions || 0} completed orders
          </span>
        </div>

        {/* Cashless Student Wallets */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase text-blue-600 tracking-wider block flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5" /> Student Wallet
          </span>
          <div className="text-2xl font-black text-blue-700 mt-1">
            ${dashboardStats?.paymentBreakdown.wallet.toFixed(2) || '0.00'}
          </div>
          <span className="text-xs text-slate-500 block mt-1">Direct cashless deductions</span>
        </div>

        {/* Meal Plan Vouchers Redeemed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase text-purple-600 tracking-wider block flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> Meal Plan Credits
          </span>
          <div className="text-2xl font-black text-purple-700 mt-1">
            ${dashboardStats?.totalMealPlanValue.toFixed(2) || '0.00'}
          </div>
          <span className="text-xs text-slate-500 block mt-1">Voucher subsidy equivalent</span>
        </div>

        {/* Cash Sales in Drawer */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider block flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Cash in Register
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ${metrics.cashSales.toFixed(2)}
          </div>
          <span className="text-xs text-slate-500 block mt-1">Float + Cash sales: ${metrics.expectedCashInDrawer.toFixed(2)}</span>
        </div>
      </div>

      {/* Main Grid: Reconciliation + Top Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: Cash Drawer Reconciliation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-base text-slate-900">
              End-of-Day Cash Drawer Reconciliation
            </h2>
          </div>

          {activeShift ? (
            <form onSubmit={handleCloseShift} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Opening Cash Float:</span>
                  <span className="font-bold text-slate-800 text-sm">${metrics.openingFloat.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Cash Sales:</span>
                  <span className="font-bold text-emerald-700 text-sm">+${metrics.cashSales.toFixed(2)}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-700">Expected Cash In Drawer:</span>
                  <span className="text-base font-black text-slate-900">${metrics.expectedCashInDrawer.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Actual Physical Cash Counted in Drawer ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.05"
                    required
                    placeholder="Count notes and coins..."
                    value={countedCashInput}
                    onChange={(e) => setCountedCashInput(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border rounded-xl font-bold text-base focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Live Discrepancy Preview */}
              {countedCashInput && (
                <div className={`p-3 rounded-xl border text-xs flex justify-between items-center ${
                  discrepancy === 0 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : discrepancy > 0 
                    ? 'bg-blue-50 border-blue-200 text-blue-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div>
                    <span className="font-bold block">
                      {discrepancy === 0 ? '✓ Drawer Exactly Balanced!' : discrepancy > 0 ? 'Drawer Over (+)' : 'Drawer Short (-)'}
                    </span>
                    <span className="text-[11px]">
                      {discrepancy === 0 ? 'Count matches system cash register sales.' : `Difference of $${Math.abs(discrepancy).toFixed(2)}`}
                    </span>
                  </div>
                  <span className="text-lg font-black">
                    {discrepancy >= 0 ? `+$${discrepancy.toFixed(2)}` : `-$${Math.abs(discrepancy).toFixed(2)}`}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Closing Shift Notes / Reason (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. End of lunch rush handover"
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !countedCashInput}
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow transition-all active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? 'Closing...' : 'Close & Reconcile Shift'}
              </button>
            </form>
          ) : (
            /* Open Shift Form */
            <form onSubmit={handleOpenShift} className="space-y-4">
              <p className="text-xs text-slate-600">
                Register is currently closed. Provide the starting cash float to open a new cashier station.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Opening Float Amount ($)
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={openingFloatInput}
                  onChange={(e) => setOpeningFloatInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-slate-900"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-98"
              >
                {isSubmitting ? 'Opening...' : 'Start New Shift (Open Register)'}
              </button>
            </form>
          )}
        </div>

        {/* RIGHT: Top Selling Items & Low Stock Alerts */}
        <div className="space-y-4">
          {/* Top Selling Meals */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Top-Selling Meals & Snacks Today
            </h2>
            <div className="space-y-2">
              {dashboardStats?.topSellingItems?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No items sold yet today.</p>
              ) : (
                dashboardStats?.topSellingItems?.map((item, idx) => (
                  <div key={item.name} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-100 text-blue-800 font-bold rounded-full flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <span className="text-[10px] text-slate-500 block">{item.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900">{item.qtySold} portions</span>
                      <span className="text-[10px] text-slate-500 block">${item.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Watchlist */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Kitchen Inventory Alerts
            </h2>
            <div className="space-y-2">
              {dashboardStats?.lowStockAlerts?.length === 0 ? (
                <p className="text-xs text-emerald-600 font-medium">✓ All kitchen portions are healthy.</p>
              ) : (
                dashboardStats?.lowStockAlerts?.map(alert => (
                  <div key={alert.id} className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-amber-950">{alert.name}</span>
                      <span className="text-[10px] text-amber-700 block">{alert.category}</span>
                    </div>
                    <span className={`font-black px-2 py-0.5 rounded text-xs ${
                      alert.isSoldOut ? 'bg-red-200 text-red-900' : 'bg-amber-200 text-amber-900'
                    }`}>
                      {alert.isSoldOut ? 'SOLD OUT' : `${alert.portionsLeft} remaining`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
