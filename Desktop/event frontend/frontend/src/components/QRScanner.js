import React, { useState } from 'react';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const [scanning, setScanning] = useState(false);

  // Simulate QR scan for demo
  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      const mockData = {
        event_id: "1",
        user_id: "current"
      };
      if (onScanSuccess) {
        onScanSuccess(JSON.stringify(mockData));
      }
      setScanning(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gray-50 rounded-2xl">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-2xl flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        
        {scanning ? (
          <div>
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mx-auto mb-3"></div>
            <p className="text-gray-600">Scanning QR Code...</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">QR Scanner</h3>
            <p className="text-sm text-gray-500 mb-4">
              Click the button below to simulate scanning a QR code
            </p>
            <button
              onClick={handleSimulateScan}
              className="btn-primary"
            >
              Simulate QR Scan
            </button>
            <p className="text-xs text-gray-400 mt-3">
              Note: This is a demo. Full QR scanning will work when connected to backend.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default QRScanner;