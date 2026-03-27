import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('📤 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Simple error handling (no refresh token since your backend doesn't have it)
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error('📥 API Response Error:', error.response || error);
    
    // Handle 401 Unauthorized - Redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ==================== AUTH ENDPOINTS ====================
export const login = (credentials) => api.post('/login/', credentials);
export const register = (userData) => api.post('/register/', userData);
export const getCurrentUser = () => api.get('/users/me/');
export const changePassword = (data) => api.post('/change-password/', data);
export const resetPassword = (email) => api.post('/reset-password/', { email });

// ==================== EVENT ENDPOINTS ====================
export const getEvents = (params) => api.get('/events/', { params });
export const getEvent = (id) => api.get(`/events/${id}/`);
export const createEvent = (data) => api.post('/events/', data);
export const updateEvent = (id, data) => api.put(`/events/${id}/`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}/`);
export const registerForEvent = (id) => api.post(`/events/${id}/register/`);
export const checkEventRegistration = (id) => api.get(`/events/${id}/check_registration/`);
export const cancelEventRegistration = (id) => api.post(`/events/${id}/cancel_registration/`);
export const markAttendance = (id, userId) => api.post(`/events/${id}/mark_attendance/`, { user_id: userId });
export const getEventParticipants = (id) => api.get(`/events/${id}/participants/`);
export const getUpcomingEvents = () => api.get('/events/upcoming/');
export const getMyRegisteredEvents = () => api.get('/events/my_registrations/');

// ==================== HOLIDAY ENDPOINTS ====================
export const getHolidays = (params) => api.get('/holidays/', { params });
export const getHoliday = (id) => api.get(`/holidays/${id}/`);
export const createHoliday = (data) => api.post('/holidays/', data);
export const updateHoliday = (id, data) => api.put(`/holidays/${id}/`, data);
export const deleteHoliday = (id) => api.delete(`/holidays/${id}/`);

// ==================== ANNOUNCEMENT ENDPOINTS ====================
export const getAnnouncements = (params) => api.get('/announcements/', { params });
export const getAnnouncement = (id) => api.get(`/announcements/${id}/`);
export const createAnnouncement = (data) => api.post('/announcements/', data);
export const updateAnnouncement = (id, data) => api.put(`/announcements/${id}/`, data);
export const deleteAnnouncement = (id) => api.delete(`/announcements/${id}/`);

// ==================== GALLERY ENDPOINTS ====================
export const getGallery = (params) => api.get('/gallery/', { params });
export const getGalleryItem = (id) => api.get(`/gallery/${id}/`);
export const uploadGallery = (data) => api.post('/gallery/', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const likeGallery = (id) => api.post(`/gallery/${id}/like/`);
export const deleteGalleryItem = (id) => api.delete(`/gallery/${id}/`);

// ==================== CHAMPION ENDPOINTS ====================
export const getChampions = (params) => api.get('/champions/', { params });
export const getChampion = (id) => api.get(`/champions/${id}/`);
export const createChampion = (data) => api.post('/champions/', data);
export const updateChampion = (id, data) => api.put(`/champions/${id}/`, data);
export const deleteChampion = (id) => api.delete(`/champions/${id}/`);

// ==================== MOMENT ENDPOINTS ====================
export const getMoments = (params) => api.get('/moments/', { params });
export const getMoment = (id) => api.get(`/moments/${id}/`);
export const createMoment = (data) => api.post('/moments/', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const likeMoment = (id) => api.post(`/moments/${id}/like/`);
export const deleteMoment = (id) => api.delete(`/moments/${id}/`);

// ==================== CHAT ENDPOINTS ====================
export const getMessages = (room) => api.get(`/chat-messages/?room=${room}`);
export const sendMessage = (data) => api.post('/chat-messages/', data);
export const getChatRooms = () => api.get('/chat-rooms/');
export const createChatRoom = (data) => api.post('/chat-rooms/', data);

// ==================== DASHBOARD ENDPOINT ====================
export const getDashboard = () => api.get('/dashboard/');
export const getAdminStats = () => api.get('/admin/stats/');

// ==================== USER MANAGEMENT ENDPOINTS ====================
export const getUsers = (params) => api.get('/users/', { params });
export const getUser = (id) => api.get(`/users/${id}/`);
export const updateUser = (id, data) => api.patch(`/users/${id}/`, data);
export const updateUserRole = (id, role) => api.patch(`/users/${id}/update_role/`, { role });
export const deleteUser = (id) => api.delete(`/users/${id}/`);
export const getUserStats = () => api.get('/users/stats/');
export const getProfile = () => api.get('/profile/');
export const updateProfile = (data) => api.patch('/profile/', data);

// ==================== NOTIFICATION ENDPOINTS ====================
export const getNotifications = () => api.get('/notifications/');
export const markNotificationRead = (id) => api.post(`/notifications/${id}/read/`);
export const markAllNotificationsRead = () => api.post('/notifications/read-all/');
export const deleteNotification = (id) => api.delete(`/notifications/${id}/`);

// ==================== FEEDBACK ENDPOINTS ====================
export const submitFeedback = (data) => api.post('/feedback/', data);
export const getFeedback = (params) => api.get('/feedback/', { params });
export const deleteFeedback = (id) => api.delete(`/feedback/${id}/`);

// ==================== RESOURCE ENDPOINTS ====================
export const getResources = (params) => api.get('/resources/', { params });
export const getResource = (id) => api.get(`/resources/${id}/`);
export const createResource = (data) => api.post('/resources/', data);
export const updateResource = (id, data) => api.put(`/resources/${id}/`, data);
export const deleteResource = (id) => api.delete(`/resources/${id}/`);
export const downloadResource = (id) => api.get(`/resources/${id}/download/`, {
  responseType: 'blob'
});

// ==================== CLUB ENDPOINTS ====================
export const getClubs = () => api.get('/clubs/');
export const getClub = (id) => api.get(`/clubs/${id}/`);
export const createClub = (data) => api.post('/clubs/', data);
export const updateClub = (id, data) => api.put(`/clubs/${id}/`, data);
export const deleteClub = (id) => api.delete(`/clubs/${id}/`);
export const joinClub = (id) => api.post(`/clubs/${id}/join/`);
export const leaveClub = (id) => api.post(`/clubs/${id}/leave/`);
export const getClubMembers = (id) => api.get(`/clubs/${id}/members/`);

// ==================== VENUE ENDPOINTS ====================
export const getVenues = () => api.get('/venues/');
export const getVenue = (id) => api.get(`/venues/${id}/`);
export const createVenue = (data) => api.post('/venues/', data);
export const updateVenue = (id, data) => api.put(`/venues/${id}/`, data);
export const deleteVenue = (id) => api.delete(`/venues/${id}/`);
export const checkVenueAvailability = (id, date) => api.get(`/venues/${id}/availability/`, { params: { date } });

// ==================== ATTENDANCE ENDPOINTS ====================
export const getAttendanceHistory = () => api.get('/attendance/');
export const getUserAttendance = (userId) => api.get(`/attendance/user/${userId}/`);
export const getEventAttendance = (eventId) => api.get(`/attendance/event/${eventId}/`);
export const exportAttendance = (eventId) => api.get(`/attendance/event/${eventId}/export/`, {
  responseType: 'blob'
});

// ==================== REPORT ENDPOINTS ====================
export const generateReport = (type, params) => api.post(`/reports/${type}/`, params);
export const getReports = () => api.get('/reports/');
export const downloadReport = (id) => api.get(`/reports/${id}/download/`, {
  responseType: 'blob'
});

// ==================== SEARCH ENDPOINTS ====================
export const globalSearch = (query, type) => api.get('/search/', { params: { q: query, type } });
export const searchEvents = (query) => api.get('/search/events/', { params: { q: query } });
export const searchUsers = (query) => api.get('/search/users/', { params: { q: query } });

// ==================== EXPORT HELPER FUNCTIONS ====================
export const exportToCSV = (data, filename) => {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
  ];
  return csvRows.join('\n');
};

// ==================== ERROR HANDLING HELPER ====================
export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 400:
        return data.error || data.message || 'Bad request. Please check your input.';
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Already registered or conflict exists.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data.error || data.message || 'An error occurred.';
    }
  } else if (error.request) {
    return 'Network error. Please check your internet connection and make sure the backend server is running on http://localhost:8000';
  } else {
    return error.message || 'An unexpected error occurred.';
  }
};

export default api;