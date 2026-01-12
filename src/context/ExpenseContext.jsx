import React, { createContext, useContext, useState, useEffect } from 'react';

const ExpenseContext = createContext();

export const useExpenses = () => useContext(ExpenseContext);

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('expenses');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse expenses', e);
      return [];
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('categories');
      return saved ? JSON.parse(saved) : ['Meals', 'Travel', 'Supplies', 'Utilities', 'Software', 'Other'];
    } catch (e) {
      return ['Meals', 'Travel', 'Supplies', 'Utilities', 'Software', 'Other'];
    }
  });

  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem('customers');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('projects');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [paymentMethods, setPaymentMethods] = useState(() => {
    try {
      const saved = localStorage.getItem('payment_methods');
      return saved ? JSON.parse(saved) : ['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer'];
    } catch (e) {
      return ['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer'];
    }
  });

  const [mileageRates, setMileageRates] = useState(() => {
    try {
      const saved = localStorage.getItem('mileage_rates');
      return saved ? JSON.parse(saved) : [
        { id: '1', title: '2024 IRS Rate', value: 0.670 },
        { id: '2', title: '2023 IRS Rate', value: 0.655 }
      ];
    } catch (e) {
      return [
        { id: '1', title: '2024 IRS Rate', value: 0.670 },
        { id: '2', title: '2023 IRS Rate', value: 0.655 }
      ];
    }
  });

  const [hiddenItems, setHiddenItems] = useState(() => {
    try {
      const saved = localStorage.getItem('hidden_items');
      return saved ? JSON.parse(saved) : {
        categories: [],
        customers: [],
        projects: [],
        paymentMethods: [],
        mileageRates: []
      };
    } catch (e) {
      return {
        categories: [],
        customers: [],
        projects: [],
        paymentMethods: [],
        mileageRates: []
      };
    }
  });

  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('expense_preferences');
      return saved ? JSON.parse(saved) : {
        rememberCustomer: false,
        rememberProject: false,
        rememberPaymentMethod: false,
        rememberDate: false
      };
    } catch (e) {
      return {
        rememberCustomer: false,
        rememberProject: false,
        rememberPaymentMethod: false,
        rememberDate: false
      };
    }
  });

  const [lastEntry, setLastEntry] = useState(() => {
    try {
      const saved = localStorage.getItem('last_entry');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('payment_methods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  useEffect(() => {
    localStorage.setItem('mileage_rates', JSON.stringify(mileageRates));
  }, [mileageRates]);

  useEffect(() => {
    localStorage.setItem('hidden_items', JSON.stringify(hiddenItems));
  }, [hiddenItems]);

  useEffect(() => {
    localStorage.setItem('expense_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('last_entry', JSON.stringify(lastEntry));
  }, [lastEntry]);

  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    
    setLastEntry({
      customer: expense.customer,
      project: expense.project,
      paymentMethod: expense.paymentMethod,
      date: expense.date
    });

    // Auto-add new customer/project/category if they don't exist
    if (expense.customer && !customers.includes(expense.customer)) {
      setCustomers((prev) => [...prev, expense.customer]);
      setHiddenItems(prev => ({ ...prev, customers: prev.customers.filter(c => c !== expense.customer) }));
    }
    if (expense.project && !projects.includes(expense.project)) {
      setProjects((prev) => [...prev, expense.project]);
      setHiddenItems(prev => ({ ...prev, projects: prev.projects.filter(p => p !== expense.project) }));
    }
    if (expense.category && !categories.includes(expense.category)) {
      setCategories((prev) => [...prev, expense.category]);
      setHiddenItems(prev => ({ ...prev, categories: prev.categories.filter(c => c !== expense.category) }));
    }
  };

  const updateExpense = (id, updatedExpense) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...updatedExpense, id, updatedAt: new Date().toISOString() } : e))
    );

    setLastEntry({
      customer: updatedExpense.customer,
      project: updatedExpense.project,
      paymentMethod: updatedExpense.paymentMethod,
      date: updatedExpense.date
    });

    // Auto-add new customer/project/category if they don't exist
    if (updatedExpense.customer && !customers.includes(updatedExpense.customer)) {
      setCustomers((prev) => [...prev, updatedExpense.customer]);
      setHiddenItems(prev => ({ ...prev, customers: prev.customers.filter(c => c !== updatedExpense.customer) }));
    }
    if (updatedExpense.project && !projects.includes(updatedExpense.project)) {
      setProjects((prev) => [...prev, updatedExpense.project]);
      setHiddenItems(prev => ({ ...prev, projects: prev.projects.filter(p => p !== updatedExpense.project) }));
    }
    if (updatedExpense.category && !categories.includes(updatedExpense.category)) {
      setCategories((prev) => [...prev, updatedExpense.category]);
      setHiddenItems(prev => ({ ...prev, categories: prev.categories.filter(c => c !== updatedExpense.category) }));
    }
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const isItemUsed = (type, value) => {
    switch (type) {
      case 'categories':
        return expenses.some(e => e.category === value);
      case 'customers':
        return expenses.some(e => e.customer === value);
      case 'projects':
        return expenses.some(e => e.project === value);
      case 'paymentMethods':
        return expenses.some(e => e.paymentMethod === value);
      case 'mileageRates':
        return expenses.some(e => e.mileageRateId === value.id);
      default:
        return false;
    }
  };

  const updateList = (type, newList) => {
    switch (type) {
      case 'categories':
        setCategories(newList);
        break;
      case 'customers':
        setCustomers(newList);
        break;
      case 'projects':
        setProjects(newList);
        break;
      case 'paymentMethods':
        setPaymentMethods(newList);
        break;
      case 'mileageRates':
        setMileageRates(newList);
        break;
    }
  };

  const toggleItemVisibility = (type, value) => {
    setHiddenItems(prev => {
      const currentHidden = prev[type] || [];
      if (currentHidden.includes(value)) {
        return { ...prev, [type]: currentHidden.filter(i => i !== value) };
      } else {
        return { ...prev, [type]: [...currentHidden, value] };
      }
    });
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        categories,
        customers,
        projects,
        paymentMethods,
        mileageRates,
        hiddenItems,
        preferences,
        setPreferences,
        lastEntry,
        addExpense,
        updateExpense,
        deleteExpense,
        isItemUsed,
        updateList,
        toggleItemVisibility,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
