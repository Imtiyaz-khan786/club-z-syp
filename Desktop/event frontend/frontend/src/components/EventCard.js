import React, { useState } from 'react';
import { format } from 'date-fns';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaTicketAlt, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const EventCard = ({ event, onRegister }) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const isFull = event.registered_count >= event.capacity;
  const isPast = new Date(event.date) < new Date();
  const isRegistered = event.is_registered;

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to register for events');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post(`/events/${event.id}/register/`);
      toast.success('Successfully registered for event! 🎉');
      if (onRegister) onRegister();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-700',
      cultural: 'bg-purple-100 text-purple-700',
      sports: 'bg-green-100 text-green-700',
      technical: 'bg-red-100 text-red-700',
      workshop: 'bg-orange-100 text-orange-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const canRegister = !isPast && !isFull && !isRegistered && isAuthenticated;

  return (
    <div className="card animate-fade-in">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <span className={`badge ${getCategoryColor(event.category)}`}>
            {event.category.toUpperCase()}
          </span>
          {isFull && <span className="badge badge-danger">Full</span>}
          {isPast && <span className="badge badge-secondary">Completed</span>}
          {isRegistered && !isPast && <span className="badge badge-success">Registered</span>}
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">{event.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-500 text-sm">
            <FaCalendarAlt className="mr-2 text-primary" />
            <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <FaClock className="mr-2 text-primary" />
            <span>{format(new Date(event.date), 'h:mm a')}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <FaMapMarkerAlt className="mr-2 text-primary" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <FaUsers className="mr-2 text-primary" />
            <span>{event.registered_count} / {event.capacity} registered</span>
          </div>
        </div>
        
        {!isPast && (
          <button
            onClick={handleRegister}
            disabled={!canRegister || isLoading}
            className={`w-full py-2.5 rounded-xl font-semibold transition-all ${
              canRegister
                ? 'btn-primary'
                : isRegistered
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              </div>
            ) : (
              <>
                {isRegistered ? (
                  <>
                    <FaCheckCircle className="inline mr-2" />
                    Already Registered
                  </>
                ) : !isAuthenticated ? (
                  <>
                    <FaTicketAlt className="inline mr-2" />
                    Login to Register
                  </>
                ) : isFull ? (
                  <>
                    <FaTimesCircle className="inline mr-2" />
                    Event Full
                  </>
                ) : (
                  <>
                    <FaTicketAlt className="inline mr-2" />
                    Register Now
                  </>
                )}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;