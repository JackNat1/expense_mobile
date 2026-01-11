import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Database, HardDrive, Cloud, Info } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
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
      </main>
    </div>
  );
};

export default Settings;
