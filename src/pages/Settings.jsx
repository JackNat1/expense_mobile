import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Database, HardDrive, Cloud, Info, 
  Trash2, Eye, EyeOff, ChevronUp, ChevronDown, SortAsc, Plus 
} from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';

const ListEditor = ({ title, type, items, hiddenItems, onUpdate, onToggleVisibility, isUsed }) => {
  const moveItem = (index, direction) => {
    const newList = [...items];
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < newList.length) {
      [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
      onUpdate(type, newList);
    }
  };

  const deleteItem = (value) => {
    const displayValue = typeof value === 'object' ? value.title : value;
    if (isUsed(type, value)) {
      alert(`Cannot delete "${displayValue}" because it is already used in one or more entries.`);
      return;
    }
    if (confirm(`Are you sure you want to delete "${displayValue}"?`)) {
      onUpdate(type, items.filter(i => i !== value));
    }
  };

  const sortAlphanumerically = () => {
    const newList = [...items].sort((a, b) => {
      const valA = typeof a === 'object' ? a.title : a;
      const valB = typeof b === 'object' ? b.title : b;
      return valA.localeCompare(valB);
    });
    onUpdate(type, newList);
  };

  const addItem = () => {
    if (type === 'mileageRates') {
      const title = prompt("Enter rate title (e.g., 2026 IRS Rate):");
      if (!title) return;
      const value = prompt("Enter rate value (e.g., 0.65):");
      if (!value || isNaN(parseFloat(value))) return;
      
      const newRate = {
        id: Date.now().toString(),
        title,
        value: parseFloat(value)
      };
      onUpdate(type, [...items, newRate]);
    } else {
      const newValue = prompt(`Enter new ${title.toLowerCase().slice(0, -1)}:`);
      if (newValue) {
        onUpdate(type, [...items, newValue]);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
      <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
        <h3 className="font-bold text-gray-700">{title}</h3>
        <div className="flex items-center space-x-3">
          <button 
            onClick={addItem}
            className="text-xs flex items-center text-green-600 font-medium"
          >
            <Plus size={14} className="mr-1" /> Add
          </button>
          <button 
            onClick={sortAlphanumerically}
            className="text-xs flex items-center text-blue-600 font-medium"
          >
            <SortAsc size={14} className="mr-1" /> Sort A-Z
          </button>
        </div>
      </div>
      <ul className="divide-y divide-gray-100">
        {items.map((item, index) => {
          const isHidden = hiddenItems.some(h => 
            typeof h === 'object' ? h.id === item.id : h === item
          );
          const displayValue = typeof item === 'object' ? `${item.title} (@ $${item.value.toFixed(3)})` : item;
          
          return (
            <li key={typeof item === 'object' ? item.id : item} className={`flex items-center justify-between p-3 ${isHidden ? 'bg-gray-50 opacity-60' : ''}`}>
              <span className={`flex-1 font-medium ${isHidden ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {displayValue}
              </span>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  className="p-1.5 text-gray-400 hover:text-blue-600 disabled:opacity-20"
                >
                  <ChevronUp size={18} />
                </button>
                <button 
                  onClick={() => moveItem(index, 1)}
                  disabled={index === items.length - 1}
                  className="p-1.5 text-gray-400 hover:text-blue-600 disabled:opacity-20"
                >
                  <ChevronDown size={18} />
                </button>
                <button 
                  onClick={() => onToggleVisibility(type, item)}
                  className={`p-1.5 ${isHidden ? 'text-orange-500' : 'text-gray-400 hover:text-blue-600'}`}
                  title={isHidden ? "Show" : "Hide"}
                >
                  {isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button 
                  onClick={() => deleteItem(item)}
                  className="p-1.5 text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="p-4 text-center text-sm text-gray-500 italic">No items found</li>
        )}
      </ul>
    </div>
  );
};

const Settings = () => {
  const navigate = useNavigate();
  const { 
    preferences, setPreferences, 
    categories, customers, projects, paymentMethods, mileageRates,
    hiddenItems, updateList, toggleItemVisibility, isItemUsed
  } = useExpenses();
  const [syncMode, setSyncMode] = useState(() => {
    return localStorage.getItem('sync_mode') || 'local';
  });

  const [filePath, setFilePath] = useState(() => {
    return localStorage.getItem('sync_file_path') || '';
  });

  useEffect(() => {
    localStorage.setItem('sync_mode', syncMode);
  }, [syncMode]);

  useEffect(() => {
    localStorage.setItem('sync_file_path', filePath);
  }, [filePath]);

  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <header className="flex items-center justify-between p-4 sticky top-0 bg-white border-b z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
        <div className="w-10"></div>
      </header>

      <main className="p-4 space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
            Data Storage & Synchronization
          </h2>
          
          <div className="space-y-3">
            {/* Option 1: Local Only */}
            <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${syncMode === 'local' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${syncMode === 'local' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <HardDrive size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Device Only</span>
                    <input 
                      type="radio" 
                      name="sync" 
                      checked={syncMode === 'local'} 
                      onChange={() => setSyncMode('local')}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Data is saved only in this browser. Fastest and most private.</p>
                </div>
              </div>
            </label>

            {/* Option 2: Local File Path */}
            <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${syncMode === 'file-system' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${syncMode === 'file-system' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Database size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Linked File System</span>
                    <input 
                      type="radio" 
                      name="sync" 
                      checked={syncMode === 'file-system'} 
                      onChange={() => setSyncMode('file-system')}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Sync via a specific data file on your device (Desktop/Chrome only).</p>
                </div>
              </div>
              {syncMode === 'file-system' && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                  <input 
                    type="text" 
                    placeholder="e.g. C:\Users\Documents\expenses.json"
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value)}
                    className="w-full p-2 text-sm border rounded bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-orange-600 mt-1 font-medium italic">* Experimental: Requires modern browser file-system API access.</p>
                </div>
              )}
            </label>

            {/* Option 3: Cloud Database */}
            <label className={`block p-4 rounded-xl border-2 cursor-not-allowed transition-all ${syncMode === 'cloud' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white opacity-60'}`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${syncMode === 'cloud' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Cloud size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Cloud Sync (Coming Soon)</span>
                    <input 
                      type="radio" 
                      name="sync" 
                      disabled
                      checked={syncMode === 'cloud'} 
                      onChange={() => setSyncMode('cloud')}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Automatic sync across all devices via secure cloud account.</p>
                </div>
              </div>
            </label>
          </div>
        </section>

        <section className="bg-gray-50 p-4 rounded-xl flex items-start space-x-3">
          <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
          <p className="text-xs text-gray-600 leading-relaxed">
            Changing these settings will not move your existing data. If you switch to Cloud Sync once available, you will be prompted to migrate your local records.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
            Entry Preferences
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 divide-y">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">Remember last Customer</p>
                <p className="text-xs text-gray-500">Auto-fill customer from previous entry</p>
              </div>
              <button 
                onClick={() => togglePreference('rememberCustomer')}
                className={`w-12 h-6 rounded-full transition-colors relative ${preferences.rememberCustomer ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.rememberCustomer ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">Remember last Project</p>
                <p className="text-xs text-gray-500">Auto-fill project from previous entry</p>
              </div>
              <button 
                onClick={() => togglePreference('rememberProject')}
                className={`w-12 h-6 rounded-full transition-colors relative ${preferences.rememberProject ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.rememberProject ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">Remember last Payment Method</p>
                <p className="text-xs text-gray-500">Auto-fill payment method from previous entry</p>
              </div>
              <button 
                onClick={() => togglePreference('rememberPaymentMethod')}
                className={`w-12 h-6 rounded-full transition-colors relative ${preferences.rememberPaymentMethod ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.rememberPaymentMethod ? 'left-7' : 'left-1'}`}  />
              </button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">Remember last Date</p>
                <p className="text-xs text-gray-500">Auto-fill date from previous entry</p>
              </div>
              <button 
                onClick={() => togglePreference('rememberDate')}
                className={`w-12 h-6 rounded-full transition-colors relative ${preferences.rememberDate ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.rememberDate ? 'left-7' : 'left-1'}`}  />
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
            List Management
          </h2>
          
          <ListEditor 
            title="Categories" 
            type="categories"
            items={categories} 
            hiddenItems={hiddenItems.categories || []}
            onUpdate={updateList}
            onToggleVisibility={toggleItemVisibility}
            isUsed={isItemUsed}
          />

          <ListEditor 
            title="Mileage Rates" 
            type="mileageRates"
            items={mileageRates} 
            hiddenItems={hiddenItems.mileageRates || []}
            onUpdate={updateList}
            onToggleVisibility={toggleItemVisibility}
            isUsed={isItemUsed}
          />

          <ListEditor 
            title="Customers" 
            type="customers"
            items={customers} 
            hiddenItems={hiddenItems.customers || []}
            onUpdate={updateList}
            onToggleVisibility={toggleItemVisibility}
            isUsed={isItemUsed}
          />

          <ListEditor 
            title="Projects" 
            type="projects"
            items={projects} 
            hiddenItems={hiddenItems.projects || []}
            onUpdate={updateList}
            onToggleVisibility={toggleItemVisibility}
            isUsed={isItemUsed}
          />

          <ListEditor 
            title="Payment Methods" 
            type="paymentMethods"
            items={paymentMethods} 
            hiddenItems={hiddenItems.paymentMethods || []}
            onUpdate={updateList}
            onToggleVisibility={toggleItemVisibility}
            isUsed={isItemUsed}
          />
        </section>
      </main>
    </div>
  );
};

export default Settings;
