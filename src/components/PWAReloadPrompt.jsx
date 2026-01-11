import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const PWAReloadPrompt = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needUpdate: [needUpdate, setNeedUpdate],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedUpdate(false);
  };

  return (
    <div className="fixed bottom-0 right-0 p-4 z-50">
      {(offlineReady || needUpdate) && (
        <div className="bg-white border rounded-lg shadow-xl p-4 max-w-sm">
          <div className="mb-2">
            {offlineReady ? (
              <span className="text-sm text-gray-700">App ready to work offline</span>
            ) : (
              <span className="text-sm text-gray-700">New content available, click on reload button to update.</span>
            )}
          </div>
          <div className="flex gap-2">
            {needUpdate && (
              <button
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                onClick={() => updateServiceWorker(true)}
              >
                Reload
              </button>
            )}
            <button
              className="px-4 py-2 border text-sm font-medium rounded hover:bg-gray-50"
              onClick={() => close()}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAReloadPrompt;
