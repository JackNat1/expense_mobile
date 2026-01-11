import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ExpenseProvider } from './context/ExpenseContext';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import PWAReloadPrompt from './components/PWAReloadPrompt';

function App() {
  return (
    <ExpenseProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddExpense />} />
          </Routes>
          <PWAReloadPrompt />
        </div>
      </Router>
    </ExpenseProvider>
  );
}

export default App;
