import React, { useState, useEffect, useRef } from 'react';
import { usePos } from '../context/PosContext';
import { 
  Search, Plus, Minus, Trash2, AlertTriangle, ShieldAlert, 
  CheckCircle, Zap, User, CreditCard, DollarSign, Award, 
  Sparkles, RefreshCw, X, ShoppingBag, ArrowRight
} from 'lucide-react';

export default function PosView() {
  const {
    items,
    selectedStudent,
    setIsStudentPickerOpen,
    clearStudent,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    itemCategoryFilter,
    setItemCategoryFilter,
    itemSearchTerm,
    setItemSearchTerm,
    validationResult,
    handleCheckout,
    loading,
    setIsTopupModalOpen,
    setTopupTargetStudent,
    currentShift
  } = usePos();

  const [dietaryFilter, setDietaryFilter] = useState('All');
  const [cashTenderInput, setCashTenderInput] = useState('');
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const barcodeInputRef = useRef(null);

  // Categories list
  const categories = ['All', 'Hot Meals', 'Combos', 'Snacks', 'Drinks', 'Bakery/Fruit'];
  const dietaryOptions = ['All', 'Halal', 'Nut-Free', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'];

  // Speed timer for queue optimization
  useEffect(() => {
    let timer;
    if (cart.length > 0) {
      timer = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setSecondsElapsed(0);
    }
    return () => clearInterval(timer);
  }, [cart.length]);

  // Handle barcode scanner input
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const query = itemSearchTerm.trim().toLowerCase();
    if (!query) return;

    // Check if it's a student barcode / ID
    if (query.startsWith('stu') || query.startsWith('2024')) {
      // Find student
      fetch(`/api/students/${query}`)
        .then(res => res.json())
        .then(student => {
          if (student && !student.error) {
            usePos().selectStudent(student);
            setItemSearchTerm('');
          }
        });
      return;
    }

    // Otherwise find item by barcode or SKU
    const match = items.find(i => 
      i.barcode.toLowerCase() === query || 
      i.sku.toLowerCase() === query ||
      i.name.toLowerCase().includes(query)
    );

    if (match) {
      addToCart(match);
      setItemSearchTerm('');
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    if (item.isArchived) return false;
    const matchesCategory = itemCategoryFilter === 'All' || item.category === itemCategoryFilter;
    const matchesSearch = 
      item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
      item.barcode.toLowerCase().includes(itemSearchTerm.toLowerCase());
    const matchesDietary = dietaryFilter === 'All' || (item.dietaryBadges && item.dietaryBadges.includes(dietaryFilter));
    return matchesCategory && matchesSearch && matchesDietary;
  });

  // Calculate change for quick cash buttons
  const cashNum = parseFloat(cashTenderInput) || 0;
  const changeDue = Math.max(0, cashNum - validationResult.finalPayable);

  // Critical allergy warnings
  const criticalAllergyWarning = validationResult.warnings.find(w => w.type === 'ALLERGY_ALERT');
  const restrictionWarning = validationResult.warnings.find(w => w.type === 'RESTRICTION_ALERT');
  const limitWarning = validationResult.warnings.find(w => w.type === 'DAILY_LIMIT_ALERT');

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-100">
      {/* LEFT SECTION (65% width): Fast Category Tabs + Touch Grid + Barcode Search */}
      <div className="flex-1 flex flex-col p-3 overflow-hidden border-r border-slate-200">
        
        {/* Top Controls: Barcode/Search + Dietary Badges */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 space-y-2 mb-3">
          <div className="flex gap-2">
            <form onSubmit={handleBarcodeSubmit} className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scan Barcode / SKU / Search Meal or Snack..."
                value={itemSearchTerm}
                onChange={(e) => setItemSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm font-medium"
              />
            </form>
            <button 
              type="button"
              onClick={() => setItemSearchTerm('')}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-xl"
            >
              Clear
            </button>
          </div>

          {/* Category Tabs (Large touch targets for rapid cashier flow) */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setItemCategoryFilter(cat)}
                className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl font-bold text-sm transition-all text-center whitespace-nowrap shadow-sm active:scale-95 ${
                  itemCategoryFilter === cat
                    ? 'bg-blue-600 text-white shadow-blue-500/20 shadow-md ring-2 ring-blue-600/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat === 'Hot Meals' && '🍲 '}
                {cat === 'Combos' && '🍱 '}
                {cat === 'Snacks' && '🥨 '}
                {cat === 'Drinks' && '🧃 '}
                {cat === 'Bakery/Fruit' && '🍎 '}
                {cat === 'All' && '✨ '}
                {cat}
              </button>
            ))}
          </div>

          {/* Dietary Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1">
            <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider pl-1">Dietary:</span>
            {dietaryOptions.map(tag => (
              <button
                key={tag}
                onClick={() => setDietaryFilter(tag)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                  dietaryFilter === tag
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Touch Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredItems.map(item => {
              const isSoldOut = item.portionsLeft <= 0;
              const isLowStock = item.portionsLeft > 0 && item.portionsLeft <= item.lowStockThreshold;

              // Check if in cart
              const cartItem = cart.find(c => c.id === item.id);
              const qtyInCart = cartItem ? cartItem.qty : 0;

              return (
                <div
                  key={item.id}
                  onClick={() => !isSoldOut && addToCart(item)}
                  className={`relative p-3.5 rounded-2xl border transition-all select-none flex flex-col justify-between group ${
                    isSoldOut
                      ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-white hover:border-blue-500 hover:shadow-md border-slate-200 cursor-pointer active:scale-[0.98]'
                  }`}
                >
                  {/* Cart Quantity Badge if selected */}
                  {qtyInCart > 0 && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-blue-600 text-white font-black rounded-full flex items-center justify-center text-xs shadow-md ring-2 ring-white">
                      {qtyInCart}
                    </div>
                  )}

                  <div>
                    {/* Top Row: Category & Meal Plan Badge */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      {item.mealPlanEligible && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5" title="Meal Plan Voucher Eligible">
                          <Award className="w-3 h-3" /> Voucher
                        </span>
                      )}
                    </div>

                    {/* Item Name */}
                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 min-h-[38px] group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>

                    {/* Dietary Badges */}
                    <div className="flex flex-wrap gap-1 mt-1.5 min-h-[20px]">
                      {item.dietaryBadges && item.dietaryBadges.map(badge => (
                        <span 
                          key={badge} 
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            badge === 'Nut-Free' ? 'bg-emerald-100 text-emerald-800' :
                            badge === 'Halal' ? 'bg-indigo-100 text-indigo-800' :
                            badge === 'Vegan' || badge === 'Vegetarian' ? 'bg-teal-100 text-teal-800' :
                            'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {badge}
                        </span>
                      ))}
                      {item.allergens && item.allergens.length > 0 && (
                        <span className="text-[9px] font-semibold text-red-600 bg-red-50 px-1 py-0.5 rounded">
                          Allergens: {item.allergens.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Price and Portions Left */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-base font-black text-slate-900">
                      ${item.price.toFixed(2)}
                    </span>

                    <div>
                      {isSoldOut ? (
                        <span className="text-[10px] font-black uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                          SOLD OUT
                        </span>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isLowStock 
                            ? 'bg-amber-100 text-amber-800 animate-pulse' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.portionsLeft} left
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION (35% width): Student Identification + Active Cart + Guardrails + Checkout */}
      <div className="w-[420px] max-w-[420px] flex flex-col bg-white border-l border-slate-200 shadow-lg overflow-hidden">
        
        {/* STUDENT IDENTIFIER CARD */}
        <div className="p-3 bg-slate-900 text-white border-b border-slate-800">
          {selectedStudent ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img 
                    src={selectedStudent.photo} 
                    alt={selectedStudent.name} 
                    className="w-11 h-11 rounded-full object-cover border-2 border-blue-400 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-base leading-tight">{selectedStudent.name}</span>
                      <span className="text-xs bg-blue-600/60 font-semibold px-2 py-0.5 rounded">
                        {selectedStudent.grade}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ID: {selectedStudent.id}
                    </span>
                  </div>
                </div>
                <button
                  onClick={clearStudent}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-bold"
                  title="Switch / Clear Student"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Wallet Balance & Meal Plan Status Bar */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                {/* Cashless Wallet */}
                <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Wallet Balance:</span>
                    <button 
                      onClick={() => {
                        setTopupTargetStudent(selectedStudent);
                        setIsTopupModalOpen(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 font-bold hover:underline"
                    >
                      + Top Up
                    </button>
                  </div>
                  <div className={`text-base font-black ${selectedStudent.walletBalance < 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                    ${selectedStudent.walletBalance.toFixed(2)}
                  </div>
                </div>

                {/* Meal Plan Voucher */}
                <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Award className="w-3 h-3 text-purple-400" /> Meal Plan:
                  </div>
                  <div className="text-xs font-bold text-purple-300 truncate mt-0.5">
                    {selectedStudent.mealPlan && selectedStudent.mealPlan.active 
                      ? `${selectedStudent.mealPlan.remainingToday} Lunch Credit Left` 
                      : 'No Meal Plan'}
                  </div>
                </div>
              </div>

              {/* Daily Spend Limit Tracker */}
              <div className="bg-slate-800/50 px-2.5 py-1.5 rounded-lg flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Today's Spend:</span>
                <span className="font-semibold text-slate-200">
                  ${selectedStudent.todaySpent.toFixed(2)} <span className="text-slate-400">/ ${selectedStudent.dailySpendLimit.toFixed(2)} limit</span>
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsStudentPickerOpen(true)}
              className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <User className="w-4 h-4 text-blue-400" />
              <span>Tap to Identify Student / Scan Badge</span>
            </button>
          )}
        </div>

        {/* PROMINENT SAFETY GUARDRAILS & WARNING BANNERS */}
        {criticalAllergyWarning && (
          <div className="bg-red-600 text-white p-3 font-bold text-xs flex items-start gap-2.5 allergy-alert-banner shadow-inner border-y border-red-700">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-200 mt-0.5" />
            <div className="flex-1">
              <span className="uppercase tracking-wider font-black block text-[11px]">CRITICAL ALLERGY ALERT</span>
              <p className="font-medium text-[11px] leading-tight mt-0.5">{criticalAllergyWarning.message}</p>
            </div>
          </div>
        )}

        {restrictionWarning && (
          <div className="bg-amber-500 text-slate-900 p-2.5 font-bold text-xs flex items-center gap-2 border-b border-amber-600">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-slate-900" />
            <span className="text-[11px]">{restrictionWarning.message}</span>
          </div>
        )}

        {limitWarning && (
          <div className="bg-purple-100 text-purple-900 p-2 text-xs flex items-center gap-2 border-b border-purple-200 font-semibold">
            <Zap className="w-4 h-4 text-purple-700 flex-shrink-0" />
            <span className="text-[11px]">{limitWarning.message}</span>
          </div>
        )}

        {/* CART ITEMS LIST */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 text-center">
              <ShoppingBag className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
              <p className="font-bold text-slate-600 text-sm">Cart is empty</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                Tap items on the menu or scan barcodes to begin queue checkout.
              </p>
            </div>
          ) : (
            cart.map(item => {
              const itemTotal = item.price * item.qty;
              return (
                <div key={item.id} className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm truncate">{item.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      ${item.price.toFixed(2)} each
                      {item.mealPlanEligible && (
                        <span className="text-purple-600 font-semibold ml-1.5">🎟️ Eligible</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateCartQty(item.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-300 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 active:scale-95 shadow-sm"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-black text-sm text-slate-900">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.id, 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-300 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 active:scale-95 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="text-right pl-2">
                    <div className="font-bold text-slate-900 text-sm">
                      ${itemTotal.toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 text-[10px] font-semibold transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* CART TOTALS & SUMMARY */}
        {cart.length > 0 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold">${validationResult.subtotal.toFixed(2)}</span>
            </div>

            {validationResult.mealPlanDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Meal Plan Voucher Discount:
                </span>
                <span>-${validationResult.mealPlanDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-1 border-t border-slate-200 font-black text-base text-slate-900">
              <span>Total Payable:</span>
              <span className="text-xl text-blue-700">
                ${validationResult.finalPayable.toFixed(2)}
              </span>
            </div>

            {/* Quick Speed Meter */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Speed target: &lt;10s
              </span>
              <span className="font-mono font-bold text-slate-700">
                Timer: {secondsElapsed}s
              </span>
            </div>
          </div>
        )}

        {/* ONE-TAP PAYMENT CONTROLS */}
        <div className="p-3 bg-white border-t border-slate-200 space-y-2">
          {cart.length === 0 ? (
            <button
              disabled
              className="w-full py-4 rounded-xl bg-slate-200 text-slate-400 font-bold text-sm cursor-not-allowed"
            >
              Add Items to Checkout
            </button>
          ) : (
            <>
              {/* Option 1: 100% Meal Plan Voucher Checkout */}
              {validationResult.finalPayable === 0 && validationResult.mealPlanDiscount > 0 ? (
                <button
                  disabled={loading}
                  onClick={() => handleCheckout('MEAL_PLAN', 0, true)}
                  className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-base shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Award className="w-5 h-5" />
                  <span>One-Tap Meal Voucher Redeem ($0.00 Due)</span>
                </button>
              ) : (
                <>
                  {/* Option 2: Student Cashless Wallet (1-Tap!) */}
                  {selectedStudent && (
                    <button
                      disabled={loading || !validationResult.hasSufficientWallet}
                      onClick={() => handleCheckout('WALLET', 0, true)}
                      className={`w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-between transition-all active:scale-98 shadow-sm ${
                        validationResult.hasSufficientWallet
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span>Pay via Student Wallet</span>
                      </div>
                      <span className="font-bold">
                        ${validationResult.finalPayable.toFixed(2)}
                      </span>
                    </button>
                  )}

                  {/* Option 3: Instant Cash with Tendered Presets */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleCheckout('CASH', validationResult.finalPayable, true)}
                        className="flex-1 py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        Exact Cash (${validationResult.finalPayable.toFixed(2)})
                      </button>

                      {/* Fast Bill Tender buttons ($5, $10, $20) */}
                      {[5, 10, 20].map(bill => {
                        if (bill < validationResult.finalPayable) return null;
                        return (
                          <button
                            key={bill}
                            onClick={() => handleCheckout('CASH', bill, true)}
                            className="py-2.5 px-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-300 font-bold text-xs active:scale-95 transition-all"
                            title={`Tender $${bill} (Change: $${(bill - validationResult.finalPayable).toFixed(2)})`}
                          >
                            ${bill}
                          </button>
                        );
                      })}
                    </div>

                    {/* Card / Contactless button */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCheckout('CARD', 0, true)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Card / POS Terminal
                      </button>

                      <button
                        onClick={clearCart}
                        className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors border border-red-200"
                        title="Void / Clear Cart"
                      >
                        Void Cart
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
