import React from 'react';
import { PosProvider, usePos } from './context/PosContext';
import PosView from './components/PosView';
import StudentManagerView from './components/StudentManagerView';
import MenuView from './components/MenuView';
import ShiftView from './components/ShiftView';
import TransactionsView from './components/TransactionsView';
import AuditLogsView from './components/AuditLogsView';
import ReceiptModal from './components/ReceiptModal';
import StudentPickerModal from './components/StudentPickerModal';
import TopupModal from './components/TopupModal';
import ItemModal from './components/ItemModal';
import { 
  Zap, Users, Utensils, TrendingUp, Receipt, 
  ShieldCheck, RotateCcw, AlertTriangle, CheckCircle, 
  Clock, Shield, UserCheck, Coffee 
} from 'lucide-react';

function AppContent() {
  const { 
    activeTab, 
    setActiveTab, 
    userRole, 
    setUserRole, 
    activeMealPeriod, 
    setActiveMealPeriod,
    currentShift, 
    errorNotice, 
    successNotice, 
    resetDemoData, 
    cart 
  } = usePos();

  const periods = ['Breakfast', 'Break', 'Lunch'];

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* GLOBAL NOTIFICATION BANNERS */}
      {errorNotice && (
        <div className="bg-red-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-lg z-50 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>{errorNotice}</span>
          </div>
        </div>
      )}

      {successNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-lg z-50 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-white" />
            <span>{successNotice}</span>
          </div>
        </div>
      )}

      {/* TOP APPLICATION BAR */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-4 flex-shrink-0">
        {/* School Crest & System Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg shadow-md shadow-blue-500/20">
            🥪
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm tracking-tight text-white">
                OAKRIDGE SCHOOL POS
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none mt-0.5">
              High-Speed Cafeteria & Cashless Tuck Shop
            </p>
          </div>
        </div>

        {/* Center: Meal Period Selector */}
        <div className="hidden md:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" /> Active Period:
          </span>
          {periods.map(period => (
            <button
              key={period}
              onClick={() => setActiveMealPeriod(period)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeMealPeriod === period 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Right Controls: Shift Badge + Role Selector + Demo Reset */}
        <div className="flex items-center gap-3">
          {/* Active Shift Indicator */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Station 1:</span>
            <span className="font-bold text-white">
              {currentShift?.active ? currentShift.shift.cashierName.split(' ')[0] : 'Closed'}
            </span>
            <span className="text-slate-400 text-[11px]">
              (Float: ${currentShift?.metrics?.openingFloat.toFixed(0) || '100'})
            </span>
          </div>

          {/* Role Switcher */}
          <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setUserRole('cashier')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                userRole === 'cashier' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cashier
            </button>
            <button
              onClick={() => setUserRole('admin')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                userRole === 'admin' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Re-seed demo data */}
          <button
            onClick={resetDemoData}
            className="p-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
            title="Reset to clean sample data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* NAVIGATION TABS BAR */}
      <nav className="bg-slate-900/90 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between flex-shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('POS')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'POS'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>⚡ POS Register</span>
            {cart.length > 0 && (
              <span className="bg-white text-blue-900 text-[10px] font-black px-1.5 py-0.2 rounded-full ml-1">
                {cart.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('STUDENTS')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'STUDENTS'
                ? 'bg-blue-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>Students & Wallets</span>
          </button>

          <button
            onClick={() => setActiveTab('MENU')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'MENU'
                ? 'bg-blue-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Utensils className="w-4 h-4 text-emerald-400" />
            <span>Menu & Kitchen Portions</span>
          </button>

          <button
            onClick={() => setActiveTab('SHIFTS')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'SHIFTS'
                ? 'bg-blue-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>Shifts & Cash Drawer</span>
          </button>

          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'TRANSACTIONS'
                ? 'bg-blue-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>Receipts & Voids</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'AUDIT'
                ? 'bg-blue-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audit & System Logs</span>
          </button>
        </div>
      </nav>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'POS' && <PosView />}
        {activeTab === 'STUDENTS' && <StudentManagerView />}
        {activeTab === 'MENU' && <MenuView />}
        {activeTab === 'SHIFTS' && <ShiftView />}
        {activeTab === 'TRANSACTIONS' && <TransactionsView />}
        {activeTab === 'AUDIT' && <AuditLogsView />}
      </main>

      {/* POPUP MODALS */}
      <ReceiptModal />
      <StudentPickerModal />
      <TopupModal />
      <ItemModal />
    </div>
  );
}

export default function App() {
  return (
    <PosProvider>
      <AppContent />
    </PosProvider>
  );
}
