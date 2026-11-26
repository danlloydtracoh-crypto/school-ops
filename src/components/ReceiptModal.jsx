import React from 'react';
import { usePos } from '../context/PosContext';
import { Printer, CheckCircle, X, Copy, Award, ShieldAlert } from 'lucide-react';

export default function ReceiptModal() {
  const { isReceiptModalOpen, setIsReceiptModalOpen, latestReceipt, notifySuccess } = usePos();

  if (!isReceiptModalOpen || !latestReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `
========================================
       OAKRIDGE SCHOOL CAFETERIA
           & TUCK SHOP POS
========================================
Receipt: ${latestReceipt.receiptNumber}
Date:    ${new Date(latestReceipt.timestamp).toLocaleString()}
Cashier: ${latestReceipt.cashierName}
Student: ${latestReceipt.studentName} (${latestReceipt.studentGrade})
----------------------------------------
${latestReceipt.items.map(i => `${i.qty}x ${i.name.padEnd(26).slice(0, 26)} $${i.lineTotal.toFixed(2)}${i.coveredByMealPlan ? ' [VOUCHER]' : ''}`).join('\n')}
----------------------------------------
Subtotal:              $${latestReceipt.subtotal.toFixed(2)}
${latestReceipt.mealPlanDiscount > 0 ? `Meal Plan Credit:     -$${latestReceipt.mealPlanDiscount.toFixed(2)}\n` : ''}Total Charged:         $${latestReceipt.totalCharged.toFixed(2)}

Payment Method:        ${latestReceipt.paymentMethod.type}
${latestReceipt.paymentMethod.walletDeduction > 0 ? `Wallet Deduction:      $${latestReceipt.paymentMethod.walletDeduction.toFixed(2)}\n` : ''}${latestReceipt.paymentMethod.cashTendered > 0 ? `Cash Tendered:         $${latestReceipt.paymentMethod.cashTendered.toFixed(2)}\nChange Given:          $${latestReceipt.paymentMethod.changeGiven.toFixed(2)}\n` : ''}----------------------------------------
Checkout Speed:        ${latestReceipt.checkoutDurationSeconds}s
Status:                ${latestReceipt.status}
Thank you for dining with Oakridge School!
========================================
    `.trim();

    navigator.clipboard.writeText(text);
    notifySuccess('Receipt text copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-200" />
            <div>
              <h2 className="font-bold text-lg leading-tight">Checkout Completed</h2>
              <p className="text-xs text-emerald-100">Speed: {latestReceipt.checkoutDurationSeconds}s | Instant Receipt</p>
            </div>
          </div>
          <button 
            onClick={() => setIsReceiptModalOpen(false)}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Receipt Paper View */}
        <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
          <div id="thermal-receipt" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm font-mono text-xs text-slate-800 space-y-3">
            {/* School Header */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <p className="text-sm font-black tracking-wider uppercase">Oakridge Academy</p>
              <p className="text-[11px] text-slate-500 font-sans">Cafeteria & Tuck Shop Register #1</p>
              <p className="text-[10px] text-slate-400 mt-1">Receipt: {latestReceipt.receiptNumber}</p>
              <p className="text-[10px] text-slate-400">{new Date(latestReceipt.timestamp).toLocaleString()}</p>
            </div>

            {/* Student Info */}
            <div className="bg-slate-50 p-2 rounded text-[11px] font-sans border border-slate-100 flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-700">{latestReceipt.studentName}</span>
                <span className="text-slate-500 block text-[10px]">{latestReceipt.studentGrade}</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                Cashier: {latestReceipt.cashierName.split(' ')[0]}
              </span>
            </div>

            {/* Line Items */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between font-bold text-slate-500 text-[10px] border-b border-slate-200 pb-1">
                <span>ITEM</span>
                <span>TOTAL</span>
              </div>
              {latestReceipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-[11px]">
                  <div className="flex-1 pr-2">
                    <span className="font-bold text-slate-900">{item.qty}x</span> {item.name}
                    {item.coveredByMealPlan && (
                      <span className="block text-[10px] text-emerald-600 font-bold">
                        🎟️ Covered by Meal Voucher
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-slate-900">
                    ${item.lineTotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculation Breakdowns */}
            <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${latestReceipt.subtotal.toFixed(2)}</span>
              </div>
              {latestReceipt.mealPlanDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Meal Voucher Credit</span>
                  <span>-${latestReceipt.mealPlanDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-300 pt-1.5">
                <span>Total Due</span>
                <span>${latestReceipt.totalCharged.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Record */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 text-[11px] font-sans">
              <div className="flex justify-between text-slate-700 font-medium">
                <span>Payment Mode:</span>
                <span className="font-bold uppercase text-slate-900">{latestReceipt.paymentMethod.type}</span>
              </div>
              {latestReceipt.paymentMethod.walletDeduction > 0 && (
                <div className="flex justify-between text-blue-700 font-semibold">
                  <span>Student Wallet Deducted:</span>
                  <span>${latestReceipt.paymentMethod.walletDeduction.toFixed(2)}</span>
                </div>
              )}
              {latestReceipt.paymentMethod.cashTendered > 0 && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>Cash Tendered:</span>
                    <span>${latestReceipt.paymentMethod.cashTendered.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Change Returned:</span>
                    <span>${latestReceipt.paymentMethod.changeGiven.toFixed(2)}</span>
                  </div>
                </>
              )}
              {latestReceipt.paymentMethod.cardAmount > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Card / Contactless:</span>
                  <span>${latestReceipt.paymentMethod.cardAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Barcode & Footer */}
            <div className="text-center pt-2">
              <div className="font-mono text-[9px] tracking-widest text-slate-400">
                |||| | ||||| || |||||| | |||| ||||
              </div>
              <p className="text-[10px] text-slate-500 font-sans mt-1">
                Healthy Students, Brighter Futures 🍎
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-slate-200 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            Print 80mm Receipt
          </button>
          <button
            onClick={handleCopy}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center transition-all"
            title="Copy Text"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsReceiptModalOpen(false)}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2.5 px-4 rounded-xl transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
