import React, { useState, useEffect } from 'react';
import { FaCamera, FaHeart, FaRegHeart, FaShare, FaUpload, FaTimes, FaPlay, FaCalendarAlt, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getMoments, likeMoment, createMoment, getEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getImageUrl, getMediaUrl } from '../utils/imageHelper';

const EventMoments = () => {
  const [moments, setMoments] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [uploadData, setUploadData] = useState({
    eventId: '',
    caption: '',
    media: null,
    mediaType: 'image'
  });
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchMoments();
    fetchEvents();
  }, []);

  const fetchMoments = async () => {
    try {
      setLoading(true);
      const response = await getMoments();
      console.log('Moments data:', response.data);
      setMoments(response.data);
    } catch (error) {
      console.error('Error fetching moments:', error);
      toast.error('Failed to load moments');
      setMoments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await getEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleLike = async (id) => {
    if (!isAuthenticated) {
      toast.error('Please login to like');
      return;
    }
    try {
      const response = await likeMoment(id);
      setMoments(moments.map(m => 
        m.id === id 
          ? { ...m, likes_count: response.data.likes_count, is_liked: response.data.liked }
          : m
      ));
      toast.success(response.data.liked ? 'Liked!' : 'Unliked');
    } catch (error) {
      console.error('Error liking:', error);
      toast.error('Failed to like');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.eventId || !uploadData.media || !uploadData.caption) {
      toast.error('Please fill all fields');
      return;
    }

    const formData = new FormData();
    formData.append('event', uploadData.eventId);
    formData.append('caption', uploadData.caption);
    formData.append('media', uploadData.media);
    formData.append('media_type', uploadData.mediaType);

    try {
      const response = await createMoment(formData);
      toast.success('Moment shared successfully!');
      setShowUpload(false);
      setUploadData({ eventId: '', caption: '', media: null, mediaType: 'image' });
      fetchMoments(); // Refresh moments
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Failed to share moment');
    }
  };

  const getEventName = (eventId) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.name : 'Unknown Event';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Event Moments</h1>
          <p className="text-gray-600 mt-1">Capture and share your favorite event memories</p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setShowUpload(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FaCamera /> Share Moment
          </button>
        )}
      </div>

      {/* Event Highlights */}
      {events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.slice(0, 6).map(event => (
            <div key={event.id} className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                  <FaCalendarAlt className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 line-clamp-1">{event.name}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString()} • {event.venue}
                  </p>
                </div>
                {isAuthenticated && (
                  <button 
                    onClick={() => { setSelectedEvent(event); setUploadData({...uploadData, eventId: event.id}); setShowUpload(true); }} 
                    className="text-primary text-sm"
                  >
                    Share
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Moments Feed */}
      {moments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <FaCamera className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No moments shared yet</p>
          <p className="text-gray-400 text-sm mt-2">Be the first to share your event memories!</p>
          {isAuthenticated && (
            <button
              onClick={() => setShowUpload(true)}
              className="btn-primary mt-4 inline-flex items-center gap-2"
            >
              <FaUpload /> Share Your Moment
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {moments.map((moment) => (
            <div key={moment.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                        <FaUser className="text-primary text-sm" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{moment.user?.username || 'User'}</h3>
                        <p className="text-sm text-primary">{moment.event_name || getEventName(moment.event)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(moment.created_at).toLocaleString()}
                    </p>
                  </div>
                  {moment.media_type === 'video' && <FaPlay className="text-primary" />}
                </div>
                <p className="mt-3 text-gray-700">{moment.caption}</p>
              </div>
              
              <div className="relative">
                {moment.media_type === 'image' ? (
                  <img 
                    src={getMediaUrl(moment.media)} 
                    alt={moment.caption} 
                    className="w-full max-h-96 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                    }}
                  />
                ) : (
                  <video 
                    src={getMediaUrl(moment.media)} 
                    controls 
                    className="w-full max-h-96"
                  />
                )}
              </div>
              
              <div className="p-4 flex justify-between items-center">
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleLike(moment.id)} 
                    className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    {moment.is_liked ? (
                      <FaHeart className="text-red-500" />
                    ) : (
                      <FaRegHeart />
                    )}
                    <span>{moment.likes_count || 0}</span>
                  </button>
                </div>
                <button className="text-gray-500 hover:text-primary">
                  <FaShare />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Share Your Moment</h2>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Select Event *</label>
                <select
                  value={uploadData.eventId}
                  onChange={(e) => setUploadData({...uploadData, eventId: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Choose an event</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Caption *</label>
                <textarea
                  value={uploadData.caption}
                  onChange={(e) => setUploadData({...uploadData, caption: e.target.value})}
                  className="input-field"
                  rows="3"
                  placeholder="Share your experience..."
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Media Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="image"
                      checked={uploadData.mediaType === 'image'}
                      onChange={(e) => setUploadData({...uploadData, mediaType: e.target.value})}
                    />
                    <FaCamera /> Photo
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="video"
                      checked={uploadData.mediaType === 'video'}
                      onChange={(e) => setUploadData({...uploadData, mediaType: e.target.value})}
                    />
                    <FaPlay /> Video
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Upload Media *</label>
                <input
                  type="file"
                  accept={uploadData.mediaType === 'image' ? 'image/*' : 'video/*'}
                  onChange={(e) => setUploadData({...uploadData, media: e.target.files[0]})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Share Moment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventMoments;