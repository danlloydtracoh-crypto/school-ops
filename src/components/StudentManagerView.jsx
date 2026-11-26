import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { 
  Users, Search, Plus, ShieldAlert, Award, 
  DollarSign, Clock, Phone, AlertCircle, Edit, Check 
} from 'lucide-react';

export default function StudentManagerView() {
  const { 
    students, 
    transactions, 
    setIsTopupModalOpen, 
    setTopupTargetStudent, 
    saveStudent, 
    notifySuccess 
  } = usePos();

  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(students[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.studentNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.grade.toLowerCase().includes(search.toLowerCase()) ||
    (s.allergens && s.allergens.some(a => a.toLowerCase().includes(search.toLowerCase())))
  );

  const studentTxHistory = transactions.filter(t => 
    selectedStudent && t.studentId === selectedStudent.id
  );

  const startEdit = (student) => {
    setEditForm({
      ...student,
      allergensStr: (student.allergens || []).join(', '),
      restrictionsStr: (student.categoryRestrictions || []).join(', ')
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const updated = {
      ...editForm,
      dailySpendLimit: parseFloat(editForm.dailySpendLimit) || 15.00,
      allergens: editForm.allergensStr.split(',').map(s => s.trim()).filter(Boolean),
      categoryRestrictions: editForm.restrictionsStr.split(',').map(s => s.trim()).filter(Boolean)
    };
    delete updated.allergensStr;
    delete updated.restrictionsStr;

    const ok = await saveStudent(updated);
    if (ok) {
      setIsEditing(false);
      setSelectedStudent(updated);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-100 p-4 gap-4">
      {/* LEFT: Students Directory */}
      <div className="w-1/3 min-w-[340px] max-w-[420px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-base text-slate-900">Student Directory</h2>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
              {students.length} Total
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name, grade, allergy..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          {filteredStudents.map(student => {
            const isSelected = selectedStudent && selectedStudent.id === student.id;
            return (
              <div
                key={student.id}
                onClick={() => {
                  setSelectedStudent(student);
                  setIsEditing(false);
                }}
                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected 
                    ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img 
                    src={student.photo} 
                    alt={student.name} 
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{student.name}</p>
                    <p className="text-xs text-slate-500">{student.grade} • #{student.studentNumber}</p>
                    {student.allergens && student.allergens.length > 0 && (
                      <span className="inline-block mt-0.5 text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded">
                        ⚠️ {student.allergens.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className={`text-sm font-black block ${student.walletBalance < 5 ? 'text-red-500' : 'text-emerald-700'}`}>
                    ${student.walletBalance.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Limit: ${student.dailySpendLimit.toFixed(0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Detailed Profile & History */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {selectedStudent ? (
          isEditing ? (
            /* EDIT FORM */
            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-lg text-slate-900">Edit Student Safety & Limits</h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Class / Grade</label>
                  <input
                    type="text"
                    value={editForm.grade}
                    onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daily Spending Limit ($)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={editForm.dailySpendLimit}
                    onChange={(e) => setEditForm({ ...editForm, dailySpendLimit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Parent Contact</label>
                  <input
                    type="text"
                    value={editForm.parentContact}
                    onChange={(e) => setEditForm({ ...editForm, parentContact: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-red-700 mb-1">
                  Recorded Allergies (Comma separated, e.g. "Peanuts, Dairy, Gluten")
                </label>
                <input
                  type="text"
                  value={editForm.allergensStr}
                  onChange={(e) => setEditForm({ ...editForm, allergensStr: e.target.value })}
                  className="w-full px-3 py-2 border border-red-200 rounded-xl text-sm bg-red-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-700 mb-1">
                  Parent Category Restrictions (e.g. "No Sugary Drinks, Max 1 Snack")
                </label>
                <input
                  type="text"
                  value={editForm.restrictionsStr}
                  onChange={(e) => setEditForm({ ...editForm, restrictionsStr: e.target.value })}
                  className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm bg-amber-50/50"
                />
              </div>

              {/* Meal Plan Tier Toggle */}
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-purple-900">Prepaid Daily Meal Plan</span>
                  <input
                    type="checkbox"
                    checked={editForm.mealPlan?.active || false}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      mealPlan: {
                        ...editForm.mealPlan,
                        active: e.target.checked,
                        creditsPerDay: e.target.checked ? 1 : 0,
                        remainingToday: e.target.checked ? 1 : 0,
                        tier: e.target.checked ? 'Daily Hot Lunch Plan' : 'None'
                      }
                    })}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                </div>
                {editForm.mealPlan?.active && (
                  <p className="text-[11px] text-purple-700">
                    Student receives 1 hot lunch credit per day automatically redeemable for eligible entrees.
                  </p>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            /* VIEW DETAILS */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Profile Top Bar */}
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img 
                    src={selectedStudent.photo} 
                    alt={selectedStudent.name} 
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">{selectedStudent.name}</h2>
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">
                        {selectedStudent.grade}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Student ID: {selectedStudent.id} • Barcode: {selectedStudent.barcode}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5" /> Emergency/Parent: {selectedStudent.parentContact || 'Not listed'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(selectedStudent)}
                    className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Profile
                  </button>

                  <button
                    onClick={() => {
                      setTopupTargetStudent(selectedStudent);
                      setIsTopupModalOpen(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
                  >
                    <DollarSign className="w-4 h-4" /> Top Up Wallet
                  </button>
                </div>
              </div>

              {/* Status Metric Cards */}
              <div className="p-6 grid grid-cols-3 gap-4 border-b border-slate-100 bg-white">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
                    Wallet Balance
                  </span>
                  <span className={`text-2xl font-black ${selectedStudent.walletBalance < 5 ? 'text-red-500' : 'text-emerald-700'}`}>
                    ${selectedStudent.walletBalance.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Tuck shop & extras</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200">
                  <span className="text-[11px] font-bold uppercase text-purple-600 block tracking-wider flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Meal Plan
                  </span>
                  <span className="text-base font-black text-purple-900 mt-1 block">
                    {selectedStudent.mealPlan && selectedStudent.mealPlan.active 
                      ? `${selectedStudent.mealPlan.remainingToday} Credit Left Today` 
                      : 'None'}
                  </span>
                  <span className="text-[10px] text-purple-600 block">
                    {selectedStudent.mealPlan?.tier || 'Cashless wallet only'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200">
                  <span className="text-[11px] font-bold uppercase text-blue-600 block tracking-wider">
                    Daily Spending Cap
                  </span>
                  <span className="text-xl font-black text-blue-900 mt-1 block">
                    ${selectedStudent.todaySpent.toFixed(2)} <span className="text-sm font-medium text-slate-400">/ ${selectedStudent.dailySpendLimit.toFixed(2)}</span>
                  </span>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        selectedStudent.todaySpent >= selectedStudent.dailySpendLimit 
                          ? 'bg-red-500' 
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, (selectedStudent.todaySpent / selectedStudent.dailySpendLimit) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Medical & Dietary Safety Banners */}
              <div className="p-6 border-b border-slate-100 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Health, Allergies & Dietary Restrictions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.allergens && selectedStudent.allergens.length > 0 ? (
                    selectedStudent.allergens.map(a => (
                      <div key={a} className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold text-red-800">
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                        <span>Allergy Alert: {a}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" /> No Allergies Recorded
                    </div>
                  )}

                  {selectedStudent.dietaryTags && selectedStudent.dietaryTags.map(t => (
                    <span key={t} className="p-2 bg-teal-50 border border-teal-200 rounded-xl text-xs font-bold text-teal-800">
                      Diet: {t}
                    </span>
                  ))}

                  {selectedStudent.categoryRestrictions && selectedStudent.categoryRestrictions.map(r => (
                    <span key={r} className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
                      Rule: {r}
                    </span>
                  ))}
                </div>

                {selectedStudent.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold">Medical / Cafeteria Notes:</span> {selectedStudent.notes}
                  </p>
                )}
              </div>

              {/* Purchase History */}
              <div className="flex-1 overflow-y-auto p-6">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Recent Cafeteria Purchases ({studentTxHistory.length})
                </h4>

                {studentTxHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No transactions recorded yet today.</p>
                ) : (
                  <div className="space-y-2">
                    {studentTxHistory.map(tx => (
                      <div key={tx.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-800">
                            {tx.receiptNumber} • {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            {tx.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-slate-900">${tx.totalCharged.toFixed(2)}</span>
                          <span className="block text-[10px] text-slate-400 uppercase font-bold">{tx.paymentMethod.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Select a student to view balance and profile.
          </div>
        )}
      </div>
    </div>
  );
}
