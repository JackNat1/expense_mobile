import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';
import { Plus, Download, Search, Filter, Trash2, Edit2, Image as ImageIcon, Settings } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Dashboard = () => {
  const { expenses, deleteExpense, categories } = useExpenses();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const effectiveCategory = e.type === 'mileage' ? 'Mileage' : (e.category || 'Other');
      
      const matchesSearch =
          (e.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          effectiveCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (e.customer?.toLowerCase() || '').includes(searchTerm.toLowerCase());
          
      const matchesCustomer = filterCustomer ? e.customer === filterCustomer : true;
      const matchesCategory = filterCategory ? effectiveCategory === filterCategory : true;
      
      return matchesSearch && matchesCustomer && matchesCategory;
    });
  }, [expenses, searchTerm, filterCustomer, filterCategory]);

  const totalAmount = useMemo(() => {
    return filteredExpenses
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [filteredExpenses]);

  const totalMileage = useMemo(() => {
    return filteredExpenses
        .filter(e => e.type === 'mileage')
        .reduce((sum, e) => sum + (Number(e.mileage) || 0), 0);
  }, [filteredExpenses]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Expense Summary Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 14, 30);

    const tableData = filteredExpenses.map((e) => [
      e.date,
      e.type === 'expense' ? 'Expense' : 'Mileage',
      e.type === 'mileage' ? 'Mileage' : e.category,
      e.customer || '-',
      e.project || '-',
      e.type === 'expense' ? `$${(Number(e.amount) || 0).toFixed(2)}` : `${Number(e.mileage) || 0} mi ($${(Number(e.amount) || 0).toFixed(2)})`,
      e.paymentMethod || '-',
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Type', 'Category', 'Customer', 'Project', 'Amount/Dist', 'Payment']],
      body: tableData,
    });

    const finalY = doc.lastAutoTable.finalY || 40;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Expenses: $${totalAmount.toFixed(2)}`, 14, finalY + 10);
    doc.text(`Total Mileage: ${totalMileage.toFixed(1)} miles`, 14, finalY + 17);

    doc.save(`expense-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
      <div className="max-w-4xl mx-auto pb-24">
        <header className="p-4 bg-white sticky top-0 z-10 border-b">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">My Expenses</h1>
            <div className="flex items-center space-x-2">
              <Link
                  to="/settings"
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Settings"
              >
                <Settings size={24} />
              </Link>
              <button
                  onClick={generatePDF}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Download PDF"
              >
                <Download size={24} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                  type="text"
                  placeholder="Search notes, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="">All Categories</option>
                  <option value="Mileage">Mileage</option>
                  {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                    value={filterCustomer}
                    onChange={(e) => setFilterCustomer(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="">All Customers</option>
                  {[...new Set(expenses.map(e => e.customer).filter(Boolean))].map(c => (
                      <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            <div className="bg-blue-50 p-3 rounded-xl min-w-35">
              <p className="text-xs text-blue-600 font-semibold uppercase">Total Expenses</p>
              <p className="text-xl font-bold text-blue-900">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl min-w-35">
              <p className="text-xs text-green-600 font-semibold uppercase">Total Mileage</p>
              <p className="text-xl font-bold text-green-900">{totalMileage.toFixed(1)} mi</p>
            </div>
          </div>
        </header>

        <main className="p-4 space-y-3">
          {filteredExpenses.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p>No entries found. Tap the + to start!</p>
              </div>
          ) : (
              filteredExpenses.map((expense) => (
                  <div key={expense.id} className="bg-white p-4 rounded-xl border shadow-sm flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${expense.type === 'expense' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                      {expense.receiptImage ? <ImageIcon size={20} /> : <div className="w-5 h-5 flex items-center justify-center font-bold text-xs">{(expense.type === 'mileage' ? 'Mileage' : expense.category)[0]}</div>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900 truncate">{expense.type === 'mileage' ? 'Mileage' : expense.category}</h3>
                        <span className="font-bold text-gray-900">
                    {expense.type === 'expense' ? `$${(Number(expense.amount) || 0).toFixed(2)}` : `${Number(expense.mileage) || 0} mi ($${(Number(expense.amount) || 0).toFixed(2)})`}
                  </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center justify-between">
                  <span>
                    {(() => {
                      try {
                        return format(parseISO(expense.date), 'MMM d, yyyy');
                      } catch (e) {
                        return 'Invalid Date';
                      }
                    })()} • {expense.customer || 'No Customer'}
                  </span>
                        <div className="flex space-x-2">
                          <Link
                              to={`/add?edit=${expense.id}`}
                              className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                              onClick={() => { if(confirm('Delete this entry?')) deleteExpense(expense.id)}}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              ))
          )}
        </main>

        <Link
            to="/add"
            className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-transform active:scale-90 z-20"
        >
          <Plus size={32} />
        </Link>
      </div>
  );
};

export default Dashboard;