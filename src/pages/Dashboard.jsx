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
  const [filterProject, setFilterProject] = useState('');
  const [filterWorkSegment, setFilterWorkSegment] = useState('');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const effectiveCategory = e.type === 'mileage' ? 'Mileage' : (e.category || 'Other');
      
      const matchesSearch =
          (e.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          effectiveCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (e.customer?.toLowerCase() || '').includes(searchTerm.toLowerCase());
          
      const matchesCustomer = filterCustomer ? e.customer === filterCustomer : true;
      const matchesCategory = filterCategory ? effectiveCategory === filterCategory : true;
      const matchesProject = filterProject ? e.project === filterProject : true;
      const matchesWorkSegment = filterWorkSegment ? e.workSegment === filterWorkSegment : true;
      
      return matchesSearch && matchesCustomer && matchesCategory && matchesProject && matchesWorkSegment;
    });
  }, [expenses, searchTerm, filterCustomer, filterCategory, filterProject, filterWorkSegment]);

  const availableFilters = useMemo(() => {
    const getFiltered = (exclude) => {
      return expenses.filter(e => {
        const effectiveCategory = e.type === 'mileage' ? 'Mileage' : (e.category || 'Other');
        const matchesSearch = (e.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                             effectiveCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (e.customer?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        
        const matchesCustomer = (exclude === 'customer' || !filterCustomer) ? true : e.customer === filterCustomer;
        const matchesCategory = (exclude === 'category' || !filterCategory) ? true : effectiveCategory === filterCategory;
        const matchesProject = (exclude === 'project' || !filterProject) ? true : e.project === filterProject;
        const matchesWorkSegment = (exclude === 'workSegment' || !filterWorkSegment) ? true : e.workSegment === filterWorkSegment;
        
        return matchesSearch && matchesCustomer && matchesCategory && matchesProject && matchesWorkSegment;
      });
    };

    const forCustomer = getFiltered('customer');
    const forCategory = getFiltered('category');
    const forProject = getFiltered('project');
    const forWorkSegment = getFiltered('workSegment');

    return {
      customers: [...new Set(forCustomer.map(e => e.customer).filter(Boolean))].sort(),
      categories: [...new Set(forCategory.map(e => e.type === 'mileage' ? 'Mileage' : (e.category || 'Other')))].sort(),
      projects: [...new Set(forProject.map(e => e.project).filter(Boolean))].sort(),
      workSegments: [...new Set(forWorkSegment.map(e => e.workSegment).filter(Boolean))].sort(),
    };
  }, [expenses, searchTerm, filterCustomer, filterCategory, filterProject, filterWorkSegment]);

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

    // Sort expenses by date
    const sortedExpenses = [...filteredExpenses].sort((a, b) => new Date(a.date) - new Date(b.date));

    const tableData = sortedExpenses.map((e) => [
      e.date,
      e.type === 'expense' ? 'Expense' : 'Mileage',
      e.type === 'mileage' ? 'Mileage' : e.category,
      e.customer || '-',
      e.project || '-',
      e.workSegment || '-',
      e.type === 'expense' ? `$${(Number(e.amount) || 0).toFixed(2)}` : `${Number(e.mileage) || 0} mi ($${(Number(e.amount) || 0).toFixed(2)})`,
      e.paymentMethod || '-',
    ]);

    // Generate Category Summary
    const categoriesWithMileage = [...categories, 'Mileage'];
    const categoryTotals = sortedExpenses.reduce((acc, e) => {
      const cat = e.type === 'mileage' ? 'Mileage' : (e.category || 'Other');
      acc[cat] = (acc[cat] || 0) + (Number(e.amount) || 0);
      return acc;
    }, {});

    // Sort categories based on the order in categoriesWithMileage
    const summaryData = categoriesWithMileage
      .filter(cat => categoryTotals[cat] > 0)
      .map(cat => [cat, `$${categoryTotals[cat].toFixed(2)}`]);

    // Add 'Other' if it has entries and isn't in categories
    if (categoryTotals['Other'] > 0 && !categoriesWithMileage.includes('Other')) {
      summaryData.push(['Other', `$${categoryTotals['Other'].toFixed(2)}`]);
    }

    // Add Summary Table at the top
    doc.setFontSize(14);
    doc.text('Category Summary', 14, 40);
    autoTable(doc, {
      startY: 45,
      head: [['Category', 'Total Amount']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [100, 100, 100] },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 14 },
      tableWidth: 100,
    });

    let finalY = doc.lastAutoTable.finalY || 45;

    // Add Detail Table below Summary
    doc.setFontSize(14);
    doc.text('Expense Details', 14, finalY + 15);
    autoTable(doc, {
      startY: finalY + 20,
      head: [['Date', 'Type', 'Category', 'Customer', 'Project', 'Work Segment', 'Amount/Dist', 'Payment']],
      body: tableData,
    });

    finalY = doc.lastAutoTable.finalY || (finalY + 20);
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
                  {availableFilters.categories.map(c => (
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
                  {availableFilters.customers.map(c => (
                      <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="">All Projects</option>
                  {availableFilters.projects.map(p => (
                      <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                    value={filterWorkSegment}
                    onChange={(e) => setFilterWorkSegment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="">All Work Segments</option>
                  {availableFilters.workSegments.map(ws => (
                      <option key={ws} value={ws}>{ws}</option>
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
                        <h3 className="font-semibold text-gray-900 truncate">
                          {expense.type === 'mileage' ? 'Mileage' : expense.category}
                          {expense.workSegment && <span className="text-xs text-gray-500 ml-2 font-normal">({expense.workSegment})</span>}
                        </h3>
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