import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaTicketAlt, FaQrcode, FaCamera } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const QRScan = () => {
  const { user } = useAuth();
  const [eventCode, setEventCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState('manual'); // 'manual' or 'camera'
  const [qrScannerActive, setQrScannerActive] = useState(false);

  // Function to validate if the code is a valid event ID or QR data
  const validateAndExtractEventId = (input) => {
    // If input is empty
    if (!input || !input.trim()) {
      return null;
    }

    // Try to parse as JSON (for QR codes that contain JSON)
    try {
      const parsed = JSON.parse(input);
      // Check if parsed data has event_id or id
      if (parsed.event_id) return parsed.event_id;
      if (parsed.id) return parsed.id;
      if (parsed.eventId) return parsed.eventId;
    } catch {
      // Not JSON, continue to next validation
    }

    // If it's a simple string, assume it's the event ID
    // You might want to add format validation here based on your event ID format
    // For example: if your event IDs are numbers
    if (/^\d+$/.test(input)) {
      return parseInt(input);
    }
    
    // If it's alphanumeric (like EVT-123)
    if (/^[A-Z0-9-]+$/i.test(input)) {
      return input;
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const eventId = validateAndExtractEventId(eventCode);
    
    if (!eventId) {
      toast.error('Please enter a valid event code or scan QR code');
      return;
    }

    setLoading(true);
    try {
      // First, get the event details to verify it exists
      const eventResponse = await api.get(`/events/${eventId}/`);
      const event = eventResponse.data;
      
      if (!event) {
        toast.error('Event not found');
        return;
      }

      // Check if event has already passed
      if (new Date(event.date) < new Date()) {
        toast.error('This event has already ended');
        return;
      }

      // Check if user is already registered for this event
      try {
        const registrationCheck = await api.get(`/events/${eventId}/registrations/`);
        const isRegistered = registrationCheck.data.some(reg => reg.user_id === user?.id);
        
        if (!isRegistered) {
          toast.error('You are not registered for this event');
          return;
        }
      } catch (error) {
        // If registration check fails, try to mark attendance anyway
        console.log('Registration check failed, proceeding with attendance marking');
      }

      // Mark attendance
      const attendanceResponse = await api.post(`/events/${eventId}/mark_attendance/`, {
        user_id: user?.id,
        event_id: eventId,
        timestamp: new Date().toISOString()
      });
      
      toast.success(`Attendance marked successfully for ${event.name}! 🎉`);
      setEventCode('');
      
      // Optional: Play success sound
      // new Audio('/success.mp3').play();
      
    } catch (error) {
      console.error('Attendance marking error:', error);
      
      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data?.error || 
                           error.response.data?.message || 
                           error.response.data?.detail;
        
        if (error.response.status === 404) {
          toast.error('Event not found. Please check the event code.');
        } else if (error.response.status === 400) {
          toast.error(errorMessage || 'Invalid request. Already marked?');
        } else if (error.response.status === 401) {
          toast.error('Please login to mark attendance');
        } else if (error.response.status === 403) {
          toast.error('You do not have permission for this event');
        } else {
          toast.error(errorMessage || 'Failed to mark attendance');
        }
      } else if (error.request) {
        // Request made but no response
        toast.error('Cannot connect to server. Please check your connection.');
      } else {
        // Something else happened
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock function for QR code scanning
  const handleQRScan = () => {
    // Toggle scanner active state
    setQrScannerActive(!qrScannerActive);
    
    if (!qrScannerActive) {
      toast.success('Camera mode activated. Point camera at QR code.');
      // Here you would initialize the actual QR scanner
      // For now, we'll just show a prompt
      setTimeout(() => {
        // Simulate a QR scan after 5 seconds (for demo purposes)
        if (qrScannerActive) {
          const mockQRData = '123'; // Mock event ID
          setEventCode(mockQRData);
          setQrScannerActive(false);
          toast.success('QR Code detected! Event ID: ' + mockQRData);
        }
      }, 5000);
    } else {
      // Deactivate scanner
      toast('Camera mode deactivated');
    }
  };

  // Function to simulate QR scan (for demo purposes)
  const simulateQRScan = () => {
    const mockEventId = Math.floor(Math.random() * 1000) + 1;
    setEventCode(mockEventId.toString());
    toast.success(`Demo QR scanned! Event ID: ${mockEventId}`);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTicketAlt className="text-4xl text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Mark Attendance
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.username ? `Welcome, ${user.username}!` : 'Please login to mark attendance'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => {
              setScanMode('manual');
              setQrScannerActive(false);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              scanMode === 'manual'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaTicketAlt className="inline mr-2" />
            Manual Entry
          </button>
          <button
            onClick={() => {
              setScanMode('camera');
              handleQRScan();
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              scanMode === 'camera' && qrScannerActive
                ? 'bg-primary text-white shadow-md'
                : scanMode === 'camera'
                ? 'bg-green-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaCamera className="inline mr-2" />
            {qrScannerActive ? 'Scanning...' : 'Scan QR'}
          </button>
        </div>

        {scanMode === 'manual' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Event Code / QR Data</label>
              <input
                type="text"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
                placeholder="Enter event ID (e.g., 123) or paste QR code data"
                className="input-field text-center text-lg font-mono"
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                You can enter the event ID or paste the complete QR code data
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || !user}
              className="btn-primary w-full"
            >
              {loading ? 'Processing...' : 'Mark Attendance'}
            </button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className={`w-48 h-48 bg-gray-100 rounded-xl mx-auto flex items-center justify-center mb-4 transition-all ${
              qrScannerActive ? 'ring-4 ring-green-500 ring-opacity-50' : ''
            }`}>
              <FaQrcode className={`text-6xl ${qrScannerActive ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
            </div>
            <p className="text-gray-600 mb-4">
              {qrScannerActive 
                ? 'Camera is active. Point at QR code to scan...' 
                : 'Click "Scan QR" to start camera'}
            </p>
            {qrScannerActive && (
              <button
                onClick={simulateQRScan}
                className="btn-secondary mb-2 w-full"
              >
                Simulate QR Scan (Demo)
              </button>
            )}
            <button
              onClick={handleQRScan}
              className={`${qrScannerActive ? 'btn-secondary' : 'btn-primary'} w-full`}
            >
              <FaCamera className="inline mr-2" />
              {qrScannerActive ? 'Stop Camera' : 'Start Camera'}
            </button>
            
            {/* Demo QR Code */}
            {!qrScannerActive && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Demo QR Code (for testing):</p>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <code className="text-xs text-gray-800">{"event_id: 123"}</code>
                </div>
                <button
                  onClick={() => setEventCode('123')}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Use this demo code
                </button>
              </div>
            )}
          </div>
        )}

        {/* Information Section */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl">
          <h3 className="font-semibold text-blue-800 mb-2">How to mark attendance?</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Manual Entry:</strong> Enter the event ID provided by your event coordinator</li>
            <li>• <strong>QR Code:</strong> Scan the QR code displayed at the event venue</li>
            <li>• You must be registered for the event before marking attendance</li>
            <li>• Attendance can only be marked during the event period</li>
            {!user && (
              <li className="text-red-600 font-semibold">⚠️ Please login to mark attendance</li>
            )}
          </ul>
        </div>

        {/* Recent Events - Optional */}
        <div className="mt-6">
          <button
            onClick={async () => {
              try {
                const loadingToast = toast.loading('Fetching upcoming events...');
                const response = await api.get('/events/upcoming/');
                const upcomingEvents = response.data.slice(0, 3);
                toast.dismiss(loadingToast);
                
                if (upcomingEvents.length > 0) {
                  toast.success(
                    `Upcoming events: ${upcomingEvents.map(e => e.name).join(', ')}`,
                    { duration: 5000 }
                  );
                } else {
                  toast('No upcoming events found');
                }
              } catch (error) {
                toast.dismiss();
                toast.error('Failed to fetch upcoming events');
                console.error('Failed to fetch upcoming events:', error);
              }
            }}
            className="text-sm text-primary hover:underline"
          >
            View upcoming events
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScan;