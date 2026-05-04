import React, { useState, useEffect } from 'react';
import { 
  getEvents, 
  registerForEvent, 
  checkEventRegistration 
} from '../services/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Events = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [category, search]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category) params.category = category;
      if (search) params.search = search;
      
      const response = await getEvents(params);
      let eventsData = response.data;
      
      // Check registration status for each event if user is logged in
      if (user) {
        const eventsWithRegistrationStatus = await Promise.all(
          eventsData.map(async (event) => {
            try {
              const registrationStatus = await checkEventRegistration(event.id);
              return { ...event, isRegistered: registrationStatus.data.is_registered };
            } catch (error) {
              console.error(`Error checking registration for event ${event.id}:`, error);
              return { ...event, isRegistered: false };
            }
          })
        );
        setEvents(eventsWithRegistrationStatus);
      } else {
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events. Please try again.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    if (!user) {
      toast.error('Please login to register for events');
      navigate('/login');
      return;
    }

    setRegistrationLoading(true);
    try {
      await registerForEvent(eventId);
      toast.success('Successfully registered for event! 🎉');
      
      // Update the events list
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, registered_count: event.registered_count + 1, isRegistered: true }
          : event
      ));
      
      // Close modal if open
      setSelectedEvent(null);
      
    } catch (error) {
      console.error('Error registering for event:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  const categories = ['academic', 'cultural', 'sports', 'technical', 'workshop'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Events</h1>
          <p className="text-gray-600 mt-1">Discover and register for exciting campus events</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode('grid')} 
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button 
            onClick={() => setViewMode('list')} 
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field w-48"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Display */}
      {loading ? (
        <LoadingSpinner />
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No events found</p>
          {search && (
            <button 
              onClick={() => setSearch('')} 
              className="mt-4 text-primary hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onRegister={handleRegister}
              onClick={() => handleEventClick(event)}
              registrationLoading={registrationLoading}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div 
              key={event.id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
              onClick={() => handleEventClick(event)}
            >
              <div className="flex flex-col md:flex-row">
                {event.image && (
                  <div className="md:w-48 h-48 md:h-auto">
                    <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex-1">
                      <span className="badge badge-primary mb-2 inline-block">{event.category}</span>
                      <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
                      <p className="text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {event.isRegistered ? (
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                          ✓ Registered
                        </span>
                      ) : event.registered_count >= event.capacity ? (
                        <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                          Full
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegister(event.id);
                          }}
                          disabled={registrationLoading}
                          className="btn-primary"
                        >
                          Register
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
                    <div className="flex items-center text-gray-500 text-sm">
                      <FaCalendarAlt className="mr-2" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <FaMapMarkerAlt className="mr-2" />
                      {event.venue}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <FaUsers className="mr-2" />
                      {event.registered_count}/{event.capacity} registered
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {selectedEvent.image && (
              <div className="h-64 overflow-hidden rounded-t-2xl">
                <img src={selectedEvent.image} alt={selectedEvent.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="badge badge-primary mb-2 inline-block">{selectedEvent.category}</span>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedEvent.name}</h2>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl">
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">{selectedEvent.description}</p>
                
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-primary mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-semibold">{new Date(selectedEvent.date).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-primary mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Venue</p>
                      <p className="font-semibold">{selectedEvent.venue}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaUsers className="text-primary mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-semibold">{selectedEvent.registered_count}/{selectedEvent.capacity}</p>
                      <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(selectedEvent.registered_count / selectedEvent.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  {!selectedEvent.isRegistered && selectedEvent.registered_count < selectedEvent.capacity && (
                    <button
                      onClick={() => handleRegister(selectedEvent.id)}
                      disabled={registrationLoading}
                      className="btn-primary flex-1"
                    >
                      {registrationLoading ? 'Registering...' : 'Register Now'}
                    </button>
                  )}
                  {selectedEvent.isRegistered && (
                    <button disabled className="btn-secondary flex-1 opacity-50 cursor-not-allowed">
                      ✓ Already Registered
                    </button>
                  )}
                  {selectedEvent.registered_count >= selectedEvent.capacity && !selectedEvent.isRegistered && (
                    <button disabled className="btn-secondary flex-1 opacity-50 cursor-not-allowed">
                      Event Full
                    </button>
                  )}
                  <button onClick={closeModal} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;