import React, { useState, useEffect } from 'react';
import { getDashboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaCalendarAlt, FaCheckCircle, FaClock, FaTrophy } from 'react-icons/fa';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await getDashboard();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const stats = [
    { icon: FaCalendarAlt, label: 'Upcoming Events', value: data?.upcoming_events?.length || 0, color: 'text-blue-600' },
    { icon: FaCheckCircle, label: 'Registered Events', value: data?.registered_events?.length || 0, color: 'text-green-600' },
    { icon: FaClock, label: 'Holidays', value: data?.upcoming_holidays?.length || 0, color: 'text-yellow-600' },
    { icon: FaTrophy, label: 'Events Attended', value: data?.total_events_attended || 0, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome back, {user?.username}! 👋</h2>
        <p className="opacity-90 mt-2">Here's what's happening with your events and activities.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow p-6">
            <stat.icon className={`text-3xl ${stat.color} mb-3`} />
            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Events */}
      {data?.upcoming_events?.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {data.upcoming_events.map((event, index) => (
              <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">{event.name}</h3>
                  <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <span className="badge badge-primary">{event.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;