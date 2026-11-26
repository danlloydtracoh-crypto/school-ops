import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { 
  UtensilsCrossed, Plus, Search, Filter, AlertTriangle, 
  CheckCircle, Edit, Archive, RefreshCw, Award 
} from 'lucide-react';

export default function MenuView() {
  const { 
    items, 
    restockItem, 
    toggleArchiveItem, 
    saveItem, 
    setIsItemEditModalOpen, 
    setEditingItem 
  } = usePos();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [periodFilter, setPeriodFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [restockInputId, setRestockInputId] = useState(null);
  const [restockQty, setRestockQty] = useState('20');

  const categories = ['All', 'Hot Meals', 'Combos', 'Snacks', 'Drinks', 'Bakery/Fruit'];
  const periods = ['All', 'Breakfast', 'Break', 'Lunch'];

  const filteredItems = items.filter(item => {
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesPeriod = periodFilter === 'All' || item.activePeriods.includes(periodFilter);
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesPeriod && matchesSearch;
  });

  const handleQuickRestock = async (itemId, qty) => {
    await restockItem(itemId, qty, 'Kitchen batch prep');
    setRestockInputId(null);
  };

  const openNewItemModal = () => {
    setEditingItem({
      name: '',
      category: 'Hot Meals',
      price: 5.00,
      mealPlanEligible: true,
      portionsTotal: 40,
      lowStockThreshold: 10,
      dietaryBadges: ['Nut-Free'],
      allergens: [],
      activePeriods: ['Lunch'],
      description: ''
    });
    setIsItemEditModalOpen(true);
  };

  const openEditItemModal = (item) => {
    setEditingItem(item);
    setIsItemEditModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 p-4 overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 leading-tight">Kitchen & Daily Menu Management</h1>
            <p className="text-xs text-slate-500">Plan daily meal periods, track portions, and restock inventory</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search items, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
            />
          </div>

          <button
            onClick={openNewItemModal}
            className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 whitespace-nowrap transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Menu Item
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Categories */}
        <div className="flex gap-1.5 overflow-x-auto text-xs">
          <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider self-center mr-1">Category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Meal Periods */}
        <div className="flex gap-1.5 overflow-x-auto text-xs">
          <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider self-center mr-1">Period:</span>
          {periods.map(period => (
            <button
              key={period}
              onClick={() => setPeriodFilter(period)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
                periodFilter === period
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Items Table */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Item & Description</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Meal Plan</th>
                <th className="py-3 px-3">Periods</th>
                <th className="py-3 px-4 text-center">Portions Available</th>
                <th className="py-3 px-4 text-right">Quick Restock / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => {
                const isSoldOut = item.portionsLeft <= 0;
                const isLowStock = item.portionsLeft > 0 && item.portionsLeft <= item.lowStockThreshold;

                return (
                  <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors ${item.isArchived ? 'opacity-50 bg-slate-50' : ''}`}>
                    {/* Item Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</div>
                      <div className="flex gap-1 mt-1">
                        {item.dietaryBadges?.map(b => (
                          <span key={b} className="text-[9px] bg-slate-100 text-slate-700 font-medium px-1.5 py-0.2 rounded">
                            {b}
                          </span>
                        ))}
                        {item.allergens?.map(a => (
                          <span key={a} className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                            ⚠️ {a}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-3 font-bold text-slate-900 text-sm">
                      ${item.price.toFixed(2)}
                    </td>

                    {/* Meal Plan */}
                    <td className="py-3.5 px-3">
                      {item.mealPlanEligible ? (
                        <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                          <Award className="w-3 h-3" /> Eligible
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">À la carte</span>
                      )}
                    </td>

                    {/* Active Periods */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {item.activePeriods?.map(p => (
                          <span key={p} className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Portions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`text-base font-black ${
                          isSoldOut ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-slate-800'
                        }`}>
                          {item.portionsLeft} <span className="text-xs font-normal text-slate-400">/ {item.portionsTotal}</span>
                        </span>
                        {isSoldOut ? (
                          <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 px-1.5 rounded">
                            SOLD OUT
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 rounded flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Restock & Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleQuickRestock(item.id, 10)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition-colors"
                          title="Quick restock +10 portions"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleQuickRestock(item.id, 25)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition-colors"
                          title="Quick restock +25 portions"
                        >
                          +25
                        </button>

                        <button
                          onClick={() => openEditItemModal(item)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="Edit Item"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => toggleArchiveItem(item.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.isArchived 
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title={item.isArchived ? 'Restore' : 'Archive'}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
