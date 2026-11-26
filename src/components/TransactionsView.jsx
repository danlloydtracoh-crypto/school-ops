import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { 
  Receipt, Search, XCircle, Eye, Printer, 
  RotateCcw, DollarSign, Calendar, Check 
} from 'lucide-react';

export default function TransactionsView() {
  const { transactions, voidTransaction, setLatestReceipt, setIsReceiptModalOpen } = usePos();
  const [search, setSearch] = useState('');
  const [voidConfirmTx, setVoidConfirmTx] = useState(null);
  const [voidReason, setVoidReason] = useState('Customer entered wrong item / requested refund');

  const filteredTransactions = transactions.filter(t => 
    t.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
    t.studentName.toLowerCase().includes(search.toLowerCase()) ||
    (t.studentId && t.studentId.toLowerCase().includes(search.toLowerCase())) ||
    t.paymentMethod.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmVoid = async () => {
    if (!voidConfirmTx) return;
    await voidTransaction(voidConfirmTx.id, voidReason);
    setVoidConfirmTx(null);
  };

  const handleViewReceipt = (tx) => {
    setLatestReceipt(tx);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 p-4 overflow-hidden">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 leading-tight">Past Transactions & Receipts</h1>
            <p className="text-xs text-slate-500">Audit sales, inspect itemized tickets, and issue supervisor refunds</p>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search receipt #, student name, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Receipt # / Timestamp</th>
                <th className="py-3 px-3">Student / Customer</th>
                <th className="py-3 px-3">Items Purchased</th>
                <th className="py-3 px-3">Payment Split</th>
                <th className="py-3 px-3">Speed</th>
                <th className="py-3 px-3">Total Charged</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(tx => {
                const isVoided = tx.status === 'VOIDED';
                return (
                  <tr key={tx.id} className={`hover:bg-slate-50/80 transition-colors ${isVoided ? 'bg-red-50/40 text-slate-400' : ''}`}>
                    {/* Receipt Number & Date */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 text-xs block">
                        {tx.receiptNumber}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(tx.timestamp).toLocaleString()}
                      </span>
                    </td>

                    {/* Student */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800 block text-xs">
                        {tx.studentName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {tx.studentGrade || 'Guest'} {tx.studentId ? `• ${tx.studentId}` : ''}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="py-3 px-3 max-w-[200px]">
                      <div className="truncate text-slate-700 text-xs" title={tx.items.map(i => `${i.qty}x ${i.name}`).join(', ')}>
                        {tx.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {tx.items.length} line items
                      </span>
                    </td>

                    {/* Payment Mode */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800 inline-block">
                        {tx.paymentMethod.type}
                      </span>
                      {tx.paymentMethod.walletDeduction > 0 && (
                        <span className="block text-[10px] text-blue-600 font-semibold mt-0.5">
                          Wallet: ${tx.paymentMethod.walletDeduction.toFixed(2)}
                        </span>
                      )}
                      {tx.mealPlanDiscount > 0 && (
                        <span className="block text-[10px] text-purple-600 font-semibold mt-0.5">
                          Voucher: -${tx.mealPlanDiscount.toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Speed */}
                    <td className="py-3 px-3">
                      <span className="font-mono text-slate-600 text-xs">
                        {tx.checkoutDurationSeconds || '4.2'}s
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-3 px-3">
                      <span className={`font-black text-sm ${isVoided ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        ${tx.totalCharged.toFixed(2)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isVoided ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewReceipt(tx)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" /> Ticket
                        </button>

                        {!isVoided && (
                          <button
                            onClick={() => setVoidConfirmTx(tx)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg border border-red-200 flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" /> Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund / Void Confirmation Modal */}
      {voidConfirmTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-100 rounded-xl">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Authorize Refund / Void</h3>
                <p className="text-xs text-slate-500">Receipt #{voidConfirmTx.receiptNumber}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-bold">{voidConfirmTx.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span>Total to Refund:</span>
                <span className="font-black text-red-600">${voidConfirmTx.totalCharged.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t">
                This will automatically return inventory portions to the kitchen and reimburse student wallet balances / meal credits.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Void Reason
              </label>
              <input
                type="text"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
                placeholder="Reason for refund..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setVoidConfirmTx(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVoid}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/20"
              >
                Confirm Refund & Void
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
