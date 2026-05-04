import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUsers, FaCalendarAlt, FaBell, FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';

const Admin = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [activeTab, token]);

  const fetchData = async () => {
    if (!token) {
      console.log('No token found');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'events') {
        const res = await api.get('/events/');
        console.log('Events fetched:', res.data);
        setEvents(res.data || []);
      } else if (activeTab === 'holidays') {
        const res = await api.get('/holidays/');
        console.log('Holidays fetched:', res.data);
        setHolidays(res.data || []);
      } else if (activeTab === 'announcements') {
        const res = await api.get('/announcements/');
        console.log('Announcements fetched:', res.data);
        setAnnouncements(res.data || []);
      } else if (activeTab === 'users') {
        try {
          const res = await api.get('/users/');
          console.log('Users fetched:', res.data);
          setUsers(res.data || []);
        } catch (error) {
          console.error('Error fetching users:', error);
          if (error.response?.status === 403) {
            toast.error('You don\'t have permission to view users');
          } else {
            toast.error('Failed to fetch users');
          }
          setUsers([]);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
      toast.error(`Failed to fetch ${activeTab}: ${error.response?.data?.error || error.message}`);
      if (activeTab === 'events') setEvents([]);
      else if (activeTab === 'holidays') setHolidays([]);
      else if (activeTab === 'announcements') setAnnouncements([]);
      else if (activeTab === 'users') setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (type) => {
    setModalType(type);
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item, type) => {
    setModalType(type);
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (modalType === 'event') {
        if (editingItem) {
          await api.put(`/events/${editingItem.id}/`, formData);
          toast.success('Event updated successfully');
        } else {
          await api.post('/events/', formData);
          toast.success('Event created successfully');
        }
      } else if (modalType === 'holiday') {
        if (editingItem) {
          await api.put(`/holidays/${editingItem.id}/`, formData);
          toast.success('Holiday updated successfully');
        } else {
          await api.post('/holidays/', formData);
          toast.success('Holiday created successfully');
        }
      } else if (modalType === 'announcement') {
        if (editingItem) {
          await api.put(`/announcements/${editingItem.id}/`, formData);
          toast.success('Announcement updated successfully');
        } else {
          await api.post('/announcements/', formData);
          toast.success('Announcement created successfully');
        }
      }
      
      // Refresh data after successful operation
      await fetchData();
      setShowModal(false);
      setFormData({});
      setEditingItem(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(`Failed to ${editingItem ? 'update' : 'create'} ${modalType}: ${error.response?.data?.error || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Are you sure you want to delete this?')) {
      try {
        if (type === 'event') {
          await api.delete(`/events/${id}/`);
          setEvents(events.filter(e => e.id !== id));
        } else if (type === 'holiday') {
          await api.delete(`/holidays/${id}/`);
          setHolidays(holidays.filter(h => h.id !== id));
        } else if (type === 'announcement') {
          await api.delete(`/announcements/${id}/`);
          setAnnouncements(announcements.filter(a => a.id !== id));
        }
        toast.success('Deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(`Delete failed: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/update_role/`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const stats = [
    { label: 'Total Events', value: events.length, icon: FaCalendarAlt, color: 'text-blue-600' },
    { label: 'Total Users', value: users.length, icon: FaUsers, color: 'text-green-600' },
    { label: 'Announcements', value: announcements.length, icon: FaBell, color: 'text-purple-600' },
    { label: 'Holidays', value: holidays.length, icon: FaCalendarAlt, color: 'text-orange-600' },
  ];

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">
            {editingItem ? `Edit ${modalType}` : `Add New ${modalType}`}
          </h2>
          <form onSubmit={handleSubmit}>
            {modalType === 'event' && (
              <>
                <input
                  type="text"
                  placeholder="Event Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded mb-3"
                  required
                />
                <input
                  type="datetime-local"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 border rounded mb-3"
                  required
                />
                <input
                  type="text"
                  placeholder="Venue"
                  value={formData.venue || ''}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full p-2 border rounded mb-3"
                  required
                />
                <input
                  type="number"
                  placeholder="Capacity"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded mb-3"
                  required
                />
                <input
                  type="datetime-local"
                  placeholder="Registration Deadline"
                  value={formData.registration_deadline || ''}
                  onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                  className="w-full p-2 border rounded mb-3"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded mb-3"
                  rows="3"
                />
                <select
                  value={formData.category || 'academic'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border rounded mb-3"
                >
                  <option value="academic">Academic</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Sports</option>
                  <option value="technical">Technical</option>
                  <option value="workshop">Workshop</option>
                </select>
              </>
            )}
            
            {modalType === 'holiday' && (
              <>
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border rounded mb-3"
                  required
                />
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 border rounded mb-3"
                  required
                />
                <select
                  value={formData.is_public_holiday || false}
                  onChange={(e) => setFormData({ ...formData, is_public_holiday: e.target.value === 'true' })}
                  className="w-full p-2 border rounded mb-3"
                >
                  <option value="true">Public Holiday</option>
                  <option value="false">Academic Break</option>
                </select>
                <textarea
                  placeholder="Description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded mb-3"
                  rows="3"
                />
              </>
            )}
            
            {modalType === 'announcement' && (
              <>
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border rounded mb-3"
                  required
                />
                <textarea
                  placeholder="Content"
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-2 border rounded mb-3"
                  rows="5"
                  required
                />
                <select
                  value={formData.is_active || true}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                  className="w-full p-2 border rounded mb-3"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </>
            )}
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderModal()}
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
        <div className="bg-primary text-white px-4 py-2 rounded-lg">
          Welcome, {user?.username || 'Admin'}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <stat.icon className={`text-3xl ${stat.color} mb-3`} />
            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 overflow-x-auto">
          {['events', 'holidays', 'announcements', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold capitalize transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 capitalize">{activeTab} Management</h2>
            {activeTab !== 'users' && (
              <button
                onClick={() => handleAdd(activeTab.slice(0, -1))}
                className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors"
              >
                <FaPlus /> Add New
              </button>
            )}
            <button
              onClick={fetchData}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-colors"
            >
              <FaSpinner className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'events' && events.length === 0 && (
            <div className="text-center py-8 text-gray-500">No events found. Click "Add New" to create one.</div>
          )}
          
          {activeTab === 'events' && events.length > 0 && (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{event.name}</td>
                    <td className="px-6 py-4">{new Date(event.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{event.venue}</td>
                    <td className="px-6 py-4">{event.registered_count || 0}/{event.capacity}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleEdit(event, 'event')} className="text-blue-600 hover:text-blue-800 mr-3">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(event.id, 'event')} className="text-red-600 hover:text-red-800">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'holidays' && holidays.length === 0 && (
            <div className="text-center py-8 text-gray-500">No holidays found. Click "Add New" to create one.</div>
          )}
          
          {activeTab === 'holidays' && holidays.length > 0 && (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {holidays.map((holiday) => (
                  <tr key={holiday.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{holiday.title}</td>
                    <td className="px-6 py-4">{new Date(holiday.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {holiday.is_public_holiday ? 'Public Holiday' : 'Academic Break'}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleEdit(holiday, 'holiday')} className="text-blue-600 hover:text-blue-800 mr-3">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(holiday.id, 'holiday')} className="text-red-600 hover:text-red-800">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'announcements' && announcements.length === 0 && (
            <div className="text-center py-8 text-gray-500">No announcements found. Click "Add New" to create one.</div>
          )}
          
          {activeTab === 'announcements' && announcements.length > 0 && (
            <div className="divide-y">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{announcement.title}</h3>
                      <p className="text-gray-600 mt-1">{announcement.content}</p>
                      <p className="text-sm text-gray-400 mt-2">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <button onClick={() => handleEdit(announcement, 'announcement')} className="text-blue-600 hover:text-blue-800 mr-3">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(announcement.id, 'announcement')} className="text-red-600 hover:text-red-800">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'users' && users.length === 0 && (
            <div className="text-center py-8 text-gray-500">No users found.</div>
          )}
          
          {activeTab === 'users' && users.length > 0 && (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{userItem.username}</td>
                    <td className="px-6 py-4">{userItem.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        userItem.role === 'admin' ? 'bg-red-100 text-red-800' : 
                        userItem.role === 'leader' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {userItem.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(userItem.date_joined).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className="border rounded px-2 py-1 text-sm"
                        value={userItem.role}
                        onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                        disabled={userItem.id === user?.id}
                      >
                        <option value="student">Student</option>
                        <option value="leader">Leader</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;