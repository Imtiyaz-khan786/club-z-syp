import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaQrcode, FaUsers, FaCalendarAlt, FaCheckCircle, FaClock } from 'react-icons/fa';
import api from '../services/api';
import QRScanner from '../components/QRScanner';
import toast from 'react-hot-toast';

const Leader = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my-events');
  const [myEvents, setMyEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const res = await api.get('/events/', { params: { created_by: user?.id } });
      setMyEvents(res.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Mock data
      setMyEvents([
        { id: 1, name: 'Tech Workshop', date: new Date(), venue: 'Lab 101', registered_count: 45, capacity: 50 },
        { id: 2, name: 'Cultural Night', date: new Date(), venue: 'Auditorium', registered_count: 120, capacity: 200 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (eventId) => {
    try {
      const res = await api.get(`/events/${eventId}/participants/`);
      setParticipants(res.data);
    } catch (error) {
      // Mock data
      setParticipants([
        { id: 1, username: 'john_doe', email: 'john@university.com', status: 'registered', registered_at: new Date() },
        { id: 2, username: 'jane_smith', email: 'jane@university.com', status: 'attended', registered_at: new Date() },
      ]);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    try {
      const data = JSON.parse(decodedText);
      await api.post(`/events/${selectedEvent.id}/mark_attendance/`, {
        user_id: data.user_id
      });
      toast.success('Attendance marked successfully!');
      setShowScanner(false);
      fetchParticipants(selectedEvent.id);
    } catch (error) {
      toast.error('Invalid QR code');
    }
  };

  const stats = [
    { label: 'My Events', value: myEvents.length, icon: FaCalendarAlt, color: 'text-blue-600' },
    { label: 'Total Participants', value: participants.length, icon: FaUsers, color: 'text-green-600' },
    { label: 'Attendance Rate', value: '68%', icon: FaCheckCircle, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Leader Dashboard</h1>
        <div className="bg-primary text-white px-4 py-2 rounded-lg">
          Welcome, {user?.username}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-lg p-6">
            <stat.icon className={`text-3xl ${stat.color} mb-3`} />
            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('my-events')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'my-events'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Events
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'attendance'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mark Attendance
          </button>
        </nav>
      </div>

      {/* My Events Tab */}
      {activeTab === 'my-events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{event.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{new Date(event.date).toLocaleDateString()}</p>
              <p className="text-gray-500 text-sm mb-2">Venue: {event.venue}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">
                  {event.registered_count}/{event.capacity} registered
                </span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(event.registered_count / event.capacity) * 100}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedEvent(event);
                  setActiveTab('attendance');
                }}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <FaQrcode /> Mark Attendance
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {!showScanner ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <FaQrcode className="text-6xl text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Mark Attendance</h2>
              <p className="text-gray-600 mb-6">
                Select an event to start scanning QR codes
              </p>
              <select
                onChange={(e) => {
                  const event = myEvents.find(ev => ev.id === parseInt(e.target.value));
                  setSelectedEvent(event);
                }}
                className="input-field max-w-md mx-auto mb-4"
              >
                <option value="">Select an event</option>
                {myEvents.map(event => (
                  <option key={event.id} value={event.id}>{event.name}</option>
                ))}
              </select>
              <button
                onClick={() => selectedEvent && setShowScanner(true)}
                disabled={!selectedEvent}
                className="btn-primary"
              >
                Start Scanning
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedEvent?.name}</h2>
                  <p className="text-gray-600">Scan QR codes to mark attendance</p>
                </div>
                <button
                  onClick={() => setShowScanner(false)}
                  className="btn-secondary"
                >
                  Close Scanner
                </button>
              </div>
              <QRScanner 
                onScanSuccess={handleScanSuccess}
                onScanError={(err) => console.log(err)}
              />
            </div>
          )}

          {/* Participants List */}
          {selectedEvent && participants.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold">Participants</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {participants.map((participant) => (
                      <tr key={participant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{participant.username}</td>
                        <td className="px-6 py-4">{participant.email}</td>
                        <td className="px-6 py-4">
                          <span className={`badge ${participant.status === 'attended' ? 'badge-success' : 'badge-warning'}`}>
                            {participant.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">{new Date(participant.registered_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leader;