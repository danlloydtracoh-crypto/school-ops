import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { Search, X, UserCheck, ShieldAlert, Award, QrCode, CreditCard, Sparkles } from 'lucide-react';

export default function StudentPickerModal() {
  const { 
    isStudentPickerOpen, 
    setIsStudentPickerOpen, 
    students, 
    selectStudent, 
    clearStudent 
  } = usePos();

  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All');

  if (!isStudentPickerOpen) return null;

  const grades = ['All', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.studentNumber.toLowerCase().includes(search.toLowerCase()) ||
      student.barcode.toLowerCase().includes(search.toLowerCase()) ||
      student.grade.toLowerCase().includes(search.toLowerCase()) ||
      (student.allergens && student.allergens.some(a => a.toLowerCase().includes(search.toLowerCase())));
    
    const matchesGrade = selectedGrade === 'All' || student.grade.startsWith(selectedGrade);
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Identify Student Account</h2>
              <p className="text-xs text-slate-300">Scan ID badge, search student name, or select guest</p>
            </div>
          </div>
          <button 
            onClick={() => setIsStudentPickerOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Quick Scans */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name, Student ID (e.g. STU-1001), Barcode, or Allergy..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            />
          </div>

          {/* Quick Barcode Simulator for Testing */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Scan:
            </span>
            <button
              onClick={() => {
                const s = students.find(x => x.name.includes('Liam'));
                if (s) selectStudent(s);
              }}
              className="px-2.5 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded-lg whitespace-nowrap font-semibold border border-red-200 transition-colors"
            >
              🥜 Liam (Nut Allergy)
            </button>
            <button
              onClick={() => {
                const s = students.find(x => x.name.includes('Sophia'));
                if (s) selectStudent(s);
              }}
              className="px-2.5 py-1 bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-lg whitespace-nowrap font-semibold border border-amber-200 transition-colors"
            >
              🌾 Sophia (Gluten/Dairy-Free)
            </button>
            <button
              onClick={() => {
                const s = students.find(x => x.name.includes('Lucas'));
                if (s) selectStudent(s);
              }}
              className="px-2.5 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200 rounded-lg whitespace-nowrap font-semibold border border-purple-200 transition-colors"
            >
              ⚠️ Lucas ($10.50 spent / $12 limit)
            </button>
            <button
              onClick={() => {
                const s = students.find(x => x.name.includes('Ethan'));
                if (s) selectStudent(s);
              }}
              className="px-2.5 py-1 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg whitespace-nowrap font-semibold border border-slate-300 transition-colors"
            >
              📉 Ethan (Low $2.50)
            </button>
            <button
              onClick={() => {
                const s = students.find(x => x.name.includes('Amara'));
                if (s) selectStudent(s);
              }}
              className="px-2.5 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg whitespace-nowrap font-semibold border border-emerald-200 transition-colors"
            >
              🥗 Amara (Halal / Meal Plan)
            </button>
          </div>

          {/* Grade filter pills */}
          <div className="flex gap-1.5 overflow-x-auto text-xs pt-1">
            {grades.map(grade => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap ${
                  selectedGrade === grade
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        {/* Student Cards List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-2">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="font-semibold text-slate-600">No students found matching "{search}"</p>
              <p className="text-xs mt-1">Try another name, ID, or choose Guest Walk-in.</p>
            </div>
          ) : (
            filteredStudents.map(student => (
              <div 
                key={student.id}
                onClick={() => selectStudent(student)}
                className="p-3 bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={student.photo} 
                    alt={student.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 group-hover:border-blue-500 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 group-hover:text-blue-700 text-base">
                        {student.name}
                      </span>
                      <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded">
                        {student.grade}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        #{student.studentNumber}
                      </span>
                    </div>

                    {/* Allergies and Restrictions */}
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {student.allergens && student.allergens.length > 0 ? (
                        student.allergens.map(a => (
                          <span key={a} className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <ShieldAlert className="w-3 h-3" /> Allergic: {a}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-full">
                          ✓ No Allergies
                        </span>
                      )}

                      {student.mealPlan && student.mealPlan.active && (
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Award className="w-3 h-3" /> {student.mealPlan.remainingToday} Credit Today
                        </span>
                      )}

                      {student.categoryRestrictions && student.categoryRestrictions.length > 0 && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">
                          Rule: {student.categoryRestrictions[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side balance */}
                <div className="text-right whitespace-nowrap">
                  <div className="text-sm font-black text-slate-900">
                    Wallet: <span className={student.walletBalance < 5 ? 'text-red-600' : 'text-emerald-700'}>${student.walletBalance.toFixed(2)}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Today: ${student.todaySpent.toFixed(2)} / ${student.dailySpendLimit.toFixed(2)}
                  </div>
                  <button className="mt-1 text-xs bg-blue-600 text-white font-semibold px-3 py-1 rounded-lg group-hover:bg-blue-700 transition-colors">
                    Select
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Guest Option */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              clearStudent();
              setIsStudentPickerOpen(false);
            }}
            className="text-sm text-slate-600 hover:text-slate-900 font-semibold px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Clear / Continue as Guest Walk-in
          </button>
          <span className="text-xs text-slate-500">
            {filteredStudents.length} Students Listed
          </span>
        </div>
      </div>
    </div>
  );
}
