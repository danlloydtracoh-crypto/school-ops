import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PosContext = createContext();

export function PosProvider({ children }) {
  // Navigation & Role
  const [activeTab, setActiveTab] = useState('POS'); // 'POS', 'STUDENTS', 'MENU', 'SHIFTS', 'TRANSACTIONS'
  const [userRole, setUserRole] = useState('cashier'); // 'cashier' or 'admin'
  const [activeMealPeriod, setActiveMealPeriod] = useState('Lunch'); // 'Breakfast', 'Break', 'Lunch', 'All'

  // Data from backend
  const [items, setItems] = useState([]);
  const [students, setStudents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentShift, setCurrentShift] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Cashier POS Active Session
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [cart, setCart] = useState([]);
  const [itemCategoryFilter, setItemCategoryFilter] = useState('All');
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [validationResult, setValidationResult] = useState({
    valid: true,
    warnings: [],
    errors: [],
    subtotal: 0,
    mealPlanDiscount: 0,
    finalPayable: 0,
    mealPlanCreditsToUse: 0,
    hasSufficientWallet: true
  });

  // Modal States
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [latestReceipt, setLatestReceipt] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isStudentPickerOpen, setIsStudentPickerOpen] = useState(false);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [topupTargetStudent, setTopupTargetStudent] = useState(null);
  const [isItemEditModalOpen, setIsItemEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockTargetItem, setRestockTargetItem] = useState(null);
  const [isShiftCloseModalOpen, setIsShiftCloseModalOpen] = useState(false);
  const [shiftCloseSummary, setShiftCloseSummary] = useState(null);

  // Speed timer tracking
  const [transactionStartTime, setTransactionStartTime] = useState(Date.now());

  // Show temporary notifications
  const notifySuccess = (msg) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const notifyError = (msg) => {
    setErrorNotice(msg);
    setTimeout(() => setErrorNotice(null), 5000);
  };

  // Fetch Items
  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/items');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error('Error fetching items:', e);
    }
  }, []);

  // Fetch Students
  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
        // Refresh selected student if updated
        if (selectedStudent) {
          const updated = data.find(s => s.id === selectedStudent.id);
          if (updated) setSelectedStudent(updated);
        }
      }
    } catch (e) {
      console.error('Error fetching students:', e);
    }
  }, [selectedStudent]);

  // Fetch Transactions
  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (e) {
      console.error('Error fetching transactions:', e);
    }
  }, []);

  // Fetch Current Shift
  const fetchCurrentShift = useCallback(async () => {
    try {
      const res = await fetch('/api/shifts/current');
      if (res.ok) {
        const data = await res.json();
        setCurrentShift(data);
      }
    } catch (e) {
      console.error('Error fetching shift:', e);
    }
  }, []);

  // Fetch Dashboard Stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data);
      }
    } catch (e) {
      console.error('Error fetching stats:', e);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchItems();
    fetchStudents();
    fetchTransactions();
    fetchCurrentShift();
    fetchDashboardStats();
  }, [fetchItems, fetchStudents, fetchTransactions, fetchCurrentShift, fetchDashboardStats]);

  // Run Cart & Student Validation
  useEffect(() => {
    if (cart.length === 0) {
      setValidationResult({
        valid: true,
        warnings: [],
        errors: [],
        subtotal: 0,
        mealPlanDiscount: 0,
        finalPayable: 0,
        mealPlanCreditsToUse: 0,
        hasSufficientWallet: true
      });
      return;
    }

    async function validate() {
      try {
        const res = await fetch('/api/checkout/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: selectedStudent ? selectedStudent.id : null,
            cartItems: cart
          })
        });
        if (res.ok) {
          const data = await res.json();
          setValidationResult(data);
        }
      } catch (err) {
        console.error('Validation error:', err);
      }
    }

    const timer = setTimeout(validate, 100);
    return () => clearTimeout(timer);
  }, [cart, selectedStudent]);

  // Cart Operations
  const addToCart = (item) => {
    if (cart.length === 0) {
      setTransactionStartTime(Date.now());
    }

    if (item.portionsLeft <= 0) {
      notifyError(`"${item.name}" is completely sold out!`);
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(i => i.id === item.id);
      if (existing) {
        if (existing.qty + 1 > item.portionsLeft) {
          notifyError(`Cannot add more: Only ${item.portionsLeft} portions left.`);
          return prevCart;
        }
        return prevCart.map(i => 
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      } else {
        return [...prevCart, {
          id: item.id,
          sku: item.sku,
          name: item.name,
          category: item.category,
          price: item.price,
          qty: 1,
          mealPlanEligible: item.mealPlanEligible,
          allergens: item.allergens || [],
          dietaryBadges: item.dietaryBadges || [],
          notes: ''
        }];
      }
    });
  };

  const updateCartQty = (itemId, delta) => {
    const itemInfo = items.find(i => i.id === itemId);
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === itemId) {
          const newQty = item.qty + delta;
          if (newQty <= 0) return null;
          if (itemInfo && newQty > itemInfo.portionsLeft) {
            notifyError(`Cannot exceed available stock (${itemInfo.portionsLeft} portions)`);
            return item;
          }
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(i => i.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setTransactionStartTime(Date.now());
  };

  // Student Selection
  const selectStudent = (student) => {
    setSelectedStudent(student);
    setIsStudentPickerOpen(false);
    notifySuccess(`Student identified: ${student.name} (${student.grade})`);
  };

  const clearStudent = () => {
    setSelectedStudent(null);
  };

  // Process Checkout
  const handleCheckout = async (paymentMode, cashTendered = 0, overrideWarnings = false) => {
    if (cart.length === 0) {
      notifyError('Cart is empty.');
      return false;
    }

    const durationSeconds = Math.max(1.5, ((Date.now() - transactionStartTime) / 1000)).toFixed(1);

    try {
      setLoading(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent ? selectedStudent.id : null,
          cartItems: cart,
          paymentMode,
          cashTendered: parseFloat(cashTendered) || 0,
          cashierName: currentShift?.shift?.cashierName || 'Cashier Station 1',
          checkoutDurationSeconds: parseFloat(durationSeconds),
          overrideWarnings
        })
      });

      const data = await res.json();
      if (!res.ok) {
        notifyError(data.error || 'Checkout failed');
        setLoading(false);
        return false;
      }

      // Success
      setLatestReceipt(data.transaction);
      setIsReceiptModalOpen(true);
      setIsCheckoutModalOpen(false);
      clearCart();
      notifySuccess(`Payment completed in ${durationSeconds}s! Receipt #${data.transaction.receiptNumber}`);

      // Refresh data
      fetchItems();
      fetchStudents();
      fetchTransactions();
      fetchCurrentShift();
      fetchDashboardStats();
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Checkout error:', err);
      notifyError('Network error during checkout');
      setLoading(false);
      return false;
    }
  };

  // Void Transaction
  const voidTransaction = async (txId, reason) => {
    try {
      const res = await fetch(`/api/transactions/${txId}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason || 'Customer requested void / correction',
          authorizedBy: userRole === 'admin' ? 'Admin Manager' : 'Shift Supervisor'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        notifyError(data.error || 'Failed to void transaction');
        return false;
      }

      notifySuccess(`Transaction #${txId} voided. Stock & balance restored.`);
      fetchItems();
      fetchStudents();
      fetchTransactions();
      fetchCurrentShift();
      fetchDashboardStats();
      return true;
    } catch (e) {
      console.error('Void error:', e);
      notifyError('Failed to communicate with server');
      return false;
    }
  };

  // Top Up Student
  const topupStudent = async (studentId, amount, paymentMode, notes) => {
    try {
      const res = await fetch(`/api/students/${studentId}/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentMode: paymentMode || 'Cash (Counter)',
          adminName: userRole === 'admin' ? 'Admin Reynolds' : 'Cashier Shift 1',
          notes: notes || 'Front desk counter top-up'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        notifyError(data.error || 'Failed to top up');
        return false;
      }

      notifySuccess(`Successfully added $${parseFloat(amount).toFixed(2)} to ${data.student.name}'s balance!`);
      fetchStudents();
      setIsTopupModalOpen(false);
      return true;
    } catch (e) {
      notifyError('Failed to process top-up');
      return false;
    }
  };

  // Restock Item
  const restockItem = async (itemId, quantity, reason) => {
    try {
      const res = await fetch(`/api/items/${itemId}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: parseInt(quantity, 10),
          reason: reason || 'Fresh kitchen prep batch',
          adminName: 'Kitchen Staff'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        notifyError(data.error || 'Restock failed');
        return false;
      }

      notifySuccess(`Restocked ${data.item.name} (+${quantity} portions).`);
      fetchItems();
      setIsRestockModalOpen(false);
      return true;
    } catch (e) {
      notifyError('Failed to restock item');
      return false;
    }
  };

  // Update Item
  const saveItem = async (itemData) => {
    try {
      let res;
      if (itemData.id) {
        res = await fetch(`/api/items/${itemData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        });
      } else {
        res = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        });
      }

      const data = await res.json();
      if (!res.ok) {
        notifyError(data.error || 'Failed saving item');
        return false;
      }

      notifySuccess(`Item "${data.name}" saved successfully.`);
      fetchItems();
      setIsItemEditModalOpen(false);
      return true;
    } catch (e) {
      notifyError('Failed to save item');
      return false;
    }
  };

  // Toggle Archive
  const toggleArchiveItem = async (itemId) => {
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        notifySuccess(data.message);
        fetchItems();
      }
    } catch (e) {
      notifyError('Failed archiving item');
    }
  };

  // Save Student
  const saveStudent = async (studentData) => {
    try {
      let res;
      if (studentData.id) {
        res = await fetch(`/api/students/${studentData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentData)
        });
      } else {
        res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentData)
        });
      }

      const data = await res.json();
      if (!res.ok) {
        notifyError(data.error || 'Failed saving student');
        return false;
      }

      notifySuccess(`Student ${data.name} profile updated.`);
      fetchStudents();
      return true;
    } catch (e) {
      notifyError('Failed to save student profile');
      return false;
    }
  };

  // Close Shift
  const closeCurrentShift = async (countedCash, notes) => {
    try {
      const res = await fetch('/api/shifts/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countedCash: parseFloat(countedCash) || 0, notes })
      });
      const data = await res.json();
      if (!res.ok) {
        notifyError(data.error || 'Failed closing shift');
        return false;
      }

      setShiftCloseSummary(data.summary);
      notifySuccess('Shift successfully closed and reconciled!');
      fetchCurrentShift();
      return true;
    } catch (e) {
      notifyError('Failed to close shift');
      return false;
    }
  };

  // Open Shift
  const openNewShift = async (openingFloat, notes) => {
    try {
      const res = await fetch('/api/shifts/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cashierName: userRole === 'admin' ? 'Admin Cashier' : 'Station 1 Cashier',
          openingFloat: parseFloat(openingFloat) || 100.00,
          notes
        })
      });
      const data = await res.json();
      if (!res.ok) {
        notifyError(data.error || 'Failed to open shift');
        return false;
      }

      notifySuccess('New shift opened with float $' + parseFloat(openingFloat).toFixed(2));
      fetchCurrentShift();
      return true;
    } catch (e) {
      notifyError('Failed to open shift');
      return false;
    }
  };

  // Reset demo data
  const resetDemoData = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        notifySuccess('Demo database re-seeded successfully!');
        clearCart();
        setSelectedStudent(null);
        fetchItems();
        fetchStudents();
        fetchTransactions();
        fetchCurrentShift();
        fetchDashboardStats();
      }
    } catch (e) {
      notifyError('Failed to reset demo data');
    }
  };

  return (
    <PosContext.Provider value={{
      activeTab,
      setActiveTab,
      userRole,
      setUserRole,
      activeMealPeriod,
      setActiveMealPeriod,
      items,
      students,
      transactions,
      currentShift,
      dashboardStats,
      loading,
      errorNotice,
      successNotice,
      notifySuccess,
      notifyError,
      // Cart & POS
      selectedStudent,
      selectStudent,
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
      studentSearchTerm,
      setStudentSearchTerm,
      validationResult,
      handleCheckout,
      // Modals
      isReceiptModalOpen,
      setIsReceiptModalOpen,
      latestReceipt,
      setLatestReceipt,
      isCheckoutModalOpen,
      setIsCheckoutModalOpen,
      isStudentPickerOpen,
      setIsStudentPickerOpen,
      isTopupModalOpen,
      setIsTopupModalOpen,
      topupTargetStudent,
      setTopupTargetStudent,
      isItemEditModalOpen,
      setIsItemEditModalOpen,
      editingItem,
      setEditingItem,
      isRestockModalOpen,
      setIsRestockModalOpen,
      restockTargetItem,
      setRestockTargetItem,
      isShiftCloseModalOpen,
      setIsShiftCloseModalOpen,
      shiftCloseSummary,
      setShiftCloseSummary,
      // Actions
      voidTransaction,
      topupStudent,
      restockItem,
      saveItem,
      toggleArchiveItem,
      saveStudent,
      closeCurrentShift,
      openNewShift,
      resetDemoData
    }}>
      {children}
    </PosContext.Provider>
  );
}

export function usePos() {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
}
