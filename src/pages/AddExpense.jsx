import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';
import ReceiptCapture from '../components/ReceiptCapture';
import { ChevronLeft, Save, Plus } from 'lucide-react';

const AddExpense = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { addExpense, updateExpense, expenses, categories, customers, projects } = useExpenses();

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Meals',
    customer: '',
    project: '',
    date: new Date().toISOString().split('T')[0],
    receiptImage: null,
    notes: '',
    paymentMethod: 'Credit Card',
    type: 'expense', // 'expense' or 'mileage'
    mileage: '',
  });

  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);

  useEffect(() => {
    if (editId && expenses.length > 0) {
      const existing = expenses.find(e => e.id === editId);
      if (existing) {
        setFormData(existing);
      }
    }
  }, [editId, expenses]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.type === 'expense' && !formData.amount) {
      alert('Please enter an amount');
      return;
    }
    if (formData.type === 'mileage' && !formData.mileage) {
      alert('Please enter mileage');
      return;
    }
    
    const submittedData = {
      ...formData,
      amount: formData.type === 'expense' ? parseFloat(formData.amount) : 0,
      mileage: formData.type === 'mileage' ? parseFloat(formData.mileage) : 0,
    };

    if (editId) {
      updateExpense(editId, submittedData);
    } else {
      addExpense(submittedData);
    }
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <header className="flex items-center justify-between p-4 sticky top-0 bg-white border-b z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{editId ? 'Edit Entry' : 'Add New Entry'}</h1>
        <div className="w-10"></div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              formData.type === 'expense' ? 'bg-white shadow text-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setFormData((prev) => ({ ...prev, type: 'expense' }))}
          >
            Expense
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              formData.type === 'mileage' ? 'bg-white shadow text-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setFormData((prev) => ({ ...prev, type: 'mileage' }))}
          >
            Mileage
          </button>
        </div>

        {formData.type === 'expense' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Image</label>
              <ReceiptCapture 
                onCapture={(img) => setFormData(p => ({...p, receiptImage: img}))} 
                existingImage={formData.receiptImage}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                required
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distance (miles)</label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              placeholder="0"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
              required
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Customer</label>
              <button
                type="button"
                onClick={() => setShowNewCustomer(!showNewCustomer)}
                className="text-xs text-blue-600 flex items-center"
              >
                <Plus size={14} className="mr-1" /> New
              </button>
            </div>
            {showNewCustomer ? (
              <input
                type="text"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                placeholder="Customer Name"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
              />
            ) : (
              <select
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Project</label>
              <button
                type="button"
                onClick={() => setShowNewProject(!showNewProject)}
                className="text-xs text-blue-600 flex items-center"
              >
                <Plus size={14} className="mr-1" /> New
              </button>
            </div>
            {showNewProject ? (
              <input
                type="text"
                name="project"
                value={formData.project}
                onChange={handleChange}
                placeholder="Project Name"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
              />
            ) : (
              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add some details..."
            rows="3"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Save size={20} />
          <span>{editId ? 'Update Entry' : 'Save Entry'}</span>
        </button>
      </form>
    </div>
  );
};

export default AddExpense;
