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

  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    
    // Auto-add new customer/project if they don't exist
    if (expense.customer && !customers.includes(expense.customer)) {
      setCustomers((prev) => [...prev, expense.customer]);
    }
    if (expense.project && !projects.includes(expense.project)) {
      setProjects((prev) => [...prev, expense.project]);
    }
  };

  const updateExpense = (id, updatedExpense) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...updatedExpense, id, updatedAt: new Date().toISOString() } : e))
    );

    // Auto-add new customer/project if they don't exist
    if (updatedExpense.customer && !customers.includes(updatedExpense.customer)) {
      setCustomers((prev) => [...prev, updatedExpense.customer]);
    }
    if (updatedExpense.project && !projects.includes(updatedExpense.project)) {
      setProjects((prev) => [...prev, updatedExpense.project]);
    }
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        categories,
        customers,
        projects,
        addExpense,
        updateExpense,
        deleteExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
