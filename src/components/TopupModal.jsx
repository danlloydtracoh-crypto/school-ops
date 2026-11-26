import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { DollarSign, X, Check, CreditCard, Shield } from 'lucide-react';

export default function TopupModal() {
  const { 
    isTopupModalOpen, 
    setIsTopupModalOpen, 
    topupTargetStudent, 
    topupStudent 
  } = usePos();

  const [amount, setAmount] = useState('20.00');
  const [paymentMode, setPaymentMode] = useState('Cash (Front Desk)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isTopupModalOpen || !topupTargetStudent) return null;

  const quickAmounts = ['10.00', '20.00', '30.00', '50.00', '100.00'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    setIsSubmitting(true);
    await topupStudent(topupTargetStudent.id, num, paymentMode, notes);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-700 rounded-xl">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Top Up Student Wallet</h2>
              <p className="text-xs text-blue-100">Add funds to tuck shop & cafeteria balance</p>
            </div>
          </div>
          <button 
            onClick={() => setIsTopupModalOpen(false)}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-blue-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Summary */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={topupTargetStudent.photo} 
              alt={topupTargetStudent.name} 
              className="w-10 h-10 rounded-full object-cover border border-slate-300"
            />
            <div>
              <p className="font-bold text-slate-800 text-sm">{topupTargetStudent.name}</p>
              <p className="text-xs text-slate-500">{topupTargetStudent.grade} • ID: {topupTargetStudent.id}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Current Balance</span>
            <span className="text-base font-black text-slate-900">${topupTargetStudent.walletBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* Top-up Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Top-Up Amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-base">$</span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg text-slate-900"
              />
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex gap-2">
            {quickAmounts.map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                  amount === val
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                ${val.split('.')[0]}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Payment Tender Mode
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-800 bg-white"
            >
              <option value="Cash (Front Desk)">💵 Cash (Front Desk Counter)</option>
              <option value="Card (Admin Terminal)">💳 Credit/Debit Card (Admin Terminal)</option>
              <option value="Bank Transfer (Parent)">🏦 Parent Bank Transfer / Mobile Money</option>
              <option value="School Bursar Credit">🏛️ School Bursar Scholarship / Subsidy</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reference / Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Receipt #4401 or Parent Note"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800"
            />
          </div>

          {/* New Balance Preview */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
            <span className="font-semibold text-emerald-800">Projected New Balance:</span>
            <span className="text-base font-black text-emerald-700">
              ${(topupTargetStudent.walletBalance + (parseFloat(amount) || 0)).toFixed(2)}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsTopupModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Top-Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
