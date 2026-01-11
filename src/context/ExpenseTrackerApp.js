import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ExpenseProvider } from './context/ExpenseContext';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import Settings from './pages/Settings';
import PWAReloadPrompt from './components/PWAReloadPrompt';

function App() {
  return (
      <ExpenseProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add" element={<AddExpense />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
            <PWAReloadPrompt />
          </div>
        </Router>
      </ExpenseProvider>
  );
}

export default App;
