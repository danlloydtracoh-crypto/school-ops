import React, { useState, useEffect } from 'react';
import { usePos } from '../context/PosContext';
import { Utensils, X, Check } from 'lucide-react';

export default function ItemModal() {
  const { isItemEditModalOpen, setIsItemEditModalOpen, editingItem, saveItem } = usePos();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Hot Meals',
    price: 5.00,
    mealPlanEligible: true,
    portionsTotal: 30,
    lowStockThreshold: 10,
    dietaryBadges: [],
    allergens: [],
    activePeriods: ['Lunch'],
    description: ''
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        ...editingItem,
        allergensStr: (editingItem.allergens || []).join(', '),
        dietaryStr: (editingItem.dietaryBadges || []).join(', ')
      });
    }
  }, [editingItem]);

  if (!isItemEditModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      portionsTotal: parseInt(formData.portionsTotal, 10) || 30,
      portionsLeft: formData.id ? formData.portionsLeft : parseInt(formData.portionsTotal, 10) || 30,
      lowStockThreshold: parseInt(formData.lowStockThreshold, 10) || 10,
      allergens: formData.allergensStr ? formData.allergensStr.split(',').map(s => s.trim()).filter(Boolean) : [],
      dietaryBadges: formData.dietaryStr ? formData.dietaryStr.split(',').map(s => s.trim()).filter(Boolean) : []
    };
    delete payload.allergensStr;
    delete payload.dietaryStr;

    await saveItem(payload);
  };

  const categories = ['Hot Meals', 'Combos', 'Snacks', 'Drinks', 'Bakery/Fruit'];
  const allPeriods = ['Breakfast', 'Break', 'Lunch'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">
                {formData.id ? 'Edit Menu Item' : 'Add New Cafeteria Item'}
              </h2>
              <p className="text-xs text-slate-400">Set pricing, allergens, and kitchen portions</p>
            </div>
          </div>
          <button 
            onClick={() => setIsItemEditModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Item Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm font-semibold"
              placeholder="e.g. Crispy Falafel Wrap"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price ($)</label>
              <input
                type="number"
                step="0.05"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Daily Prep Portions</label>
              <input
                type="number"
                min="0"
                value={formData.portionsTotal}
                onChange={(e) => setFormData({ ...formData, portionsTotal: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Low Stock Alert Level</label>
              <input
                type="number"
                min="1"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          {/* Meal Plan Eligibility */}
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-purple-900 block">Prepaid Meal Plan Eligible</span>
              <span className="text-[11px] text-purple-700">Can students redeem their prepaid daily lunch voucher for this item?</span>
            </div>
            <input
              type="checkbox"
              checked={formData.mealPlanEligible}
              onChange={(e) => setFormData({ ...formData, mealPlanEligible: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded"
            />
          </div>

          {/* Active Meal Periods */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Active Meal Periods</label>
            <div className="flex gap-2">
              {allPeriods.map(period => {
                const isActive = formData.activePeriods?.includes(period);
                return (
                  <button
                    key={period}
                    type="button"
                    onClick={() => {
                      const updated = isActive
                        ? formData.activePeriods.filter(p => p !== period)
                        : [...(formData.activePeriods || []), period];
                      setFormData({ ...formData, activePeriods: updated });
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                      isActive 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {period}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allergens & Dietary Tags */}
          <div>
            <label className="block text-xs font-bold text-red-700 uppercase mb-1">
              Contains Allergens (Comma separated, e.g. "Peanuts, Dairy, Gluten")
            </label>
            <input
              type="text"
              value={formData.allergensStr}
              onChange={(e) => setFormData({ ...formData, allergensStr: e.target.value })}
              className="w-full px-3 py-2 border border-red-200 rounded-xl text-xs bg-red-50/50"
              placeholder="Leave blank if nut-free/allergen-free"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Dietary Badges (Comma separated, e.g. "Halal, Vegetarian, Nut-Free")
            </label>
            <input
              type="text"
              value={formData.dietaryStr}
              onChange={(e) => setFormData({ ...formData, dietaryStr: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-xs"
              placeholder="e.g. Halal, Vegan, Gluten-Free"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-xs"
              placeholder="Ingredients and prep notes..."
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsItemEditModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
            >
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
