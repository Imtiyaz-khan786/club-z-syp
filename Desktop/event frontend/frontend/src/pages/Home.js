import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaAward, FaArrowRight, FaStar, FaRocket, FaGraduationCap, FaCamera, FaTrophy, FaHeart, FaShare } from 'react-icons/fa';
import { getEvents, getAnnouncements, getChampions, getMoments, getGallery } from '../services/api';
import { getImageUrl } from '../utils/imageHelper';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [topMoments, setTopMoments] = useState([]);
  const [champions, setChampions] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    events: 0,
    students: 5000,
    clubs: 50,
    achievements: 200,
    moments: 0,
    champions: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch real events
      const eventsRes = await getEvents();
      const events = eventsRes.data;
      setFeaturedEvents(events.slice(0, 3));
      
      // Fetch real announcements
      const announcementsRes = await getAnnouncements();
      setAnnouncements(announcementsRes.data.slice(0, 3));
      
      // Fetch real champions
      const championsRes = await getChampions();
      setChampions(championsRes.data.slice(0, 3));
      
      // Fetch real moments
      const momentsRes = await getMoments();
      setTopMoments(momentsRes.data.slice(0, 3));
      
      // Fetch gallery images
      const galleryRes = await getGallery();
      setGalleryImages(galleryRes.data.slice(0, 6));
      
      // Update stats with real data
      setStats({
        events: events.length,
        students: 5000, // This could be fetched from users count
        clubs: 50, // This could be from clubs model
        achievements: 200,
        moments: momentsRes.data.length,
        champions: championsRes.data.length
      });
      
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to empty arrays if API fails
      setFeaturedEvents([]);
      setAnnouncements([]);
      setChampions([]);
      setTopMoments([]);
      setGalleryImages([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative px-8 py-20 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in">
            Welcome to Club-Z Portol
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Your gateway to events, activities, and campus life
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/events" className="bg-white text-primary px-8 py-3 rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-2">
              Explore Events <FaArrowRight />
            </Link>
            <Link to="/register" className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-primary transition-all duration-300">
              Join Now
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all">
          <FaCalendarAlt className="text-3xl text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{stats.events}+</div>
          <div className="text-xs text-gray-600">Events</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all">
          <FaUsers className="text-3xl text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{stats.students}+</div>
          <div className="text-xs text-gray-600">Students</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all">
          <FaAward className="text-3xl text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{stats.clubs}+</div>
          <div className="text-xs text-gray-600">Clubs</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all">
          <FaTrophy className="text-3xl text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{stats.champions}+</div>
          <div className="text-xs text-gray-600">Champions</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all">
          <FaCamera className="text-3xl text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{stats.moments}+</div>
          <div className="text-xs text-gray-600">Moments</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all">
          <FaStar className="text-3xl text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{stats.achievements}+</div>
          <div className="text-xs text-gray-600">Achievements</div>
        </div>
      </section>

      {/* Featured Events */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Featured Events</h2>
            <p className="text-gray-600 mt-2">Discover the most anticipated events this month</p>
          </div>
          <Link to="/events" className="text-primary hover:text-secondary font-semibold inline-flex items-center gap-2">
            View All <FaArrowRight />
          </Link>
        </div>
        {featuredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow">
            <p className="text-gray-500">No upcoming events</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Champions Spotlight - UPDATED WITH REAL IMAGES */}
      <section className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">🏆 Champions Spotlight</h2>
            <p className="text-gray-600 mt-2">Celebrating excellence and achievement</p>
          </div>
          <Link to="/champions" className="text-primary hover:text-secondary font-semibold inline-flex items-center gap-2">
            View All Champions <FaArrowRight />
          </Link>
        </div>
        {champions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500">No champions yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {champions.map((champion) => (
              <div key={champion.id} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-yellow-500 bg-gray-100">
                  {champion.image ? (
                    <img 
                      src={getImageUrl(champion.image)} 
                      alt={champion.user?.username || 'Champion'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/100x100?text=Champion';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500">
                      <FaTrophy className="text-3xl text-white" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800">{champion.user?.username || 'Champion'}</h3>
                <p className="text-primary font-semibold mt-1">{champion.title}</p>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{champion.achievement}</p>
                <div className="flex justify-center gap-2 mt-3">
                  <FaTrophy className="text-yellow-500" />
                  <FaStar className="text-yellow-500" />
                  <span className="text-sm text-gray-600 ml-1">{champion.points} pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trending Moments - UPDATED WITH REAL DATA */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">📸 Trending Moments</h2>
            <p className="text-gray-600 mt-2">Most loved event memories</p>
          </div>
          <Link to="/moments" className="text-primary hover:text-secondary font-semibold inline-flex items-center gap-2">
            View All Moments <FaArrowRight />
          </Link>
        </div>
        {topMoments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow">
            <p className="text-gray-500">No moments shared yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topMoments.map((moment) => (
              <div key={moment.id} className="group relative overflow-hidden rounded-2xl shadow-lg">
                <img 
                  src={getImageUrl(moment.media)} 
                  alt={moment.caption} 
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x300?text=Moment';
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <p className="text-white text-sm mb-1">{moment.caption}</p>
                  <div className="flex items-center gap-2 text-white">
                    <FaHeart className="text-red-500" />
                    <span>{moment.likes_count || 0} likes</span>
                    <span className="text-xs ml-2">{moment.user?.username}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Announcements */}
      <section className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Latest Announcements</h2>
        {announcements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500">No announcements yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-all">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{announcement.title}</h3>
                <p className="text-gray-600 mb-3 line-clamp-2">{announcement.content}</p>
                <p className="text-sm text-gray-400">{new Date(announcement.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/holidays" className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white hover:shadow-xl transform hover:scale-105 transition-all">
          <FaCalendarAlt className="text-3xl mb-3" />
          <h3 className="text-xl font-semibold mb-2">Academic Calendar</h3>
          <p className="opacity-90">View holidays and important dates</p>
        </Link>
        <Link to="/gallery" className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:shadow-xl transform hover:scale-105 transition-all">
          <FaCamera className="text-3xl mb-3" />
          <h3 className="text-xl font-semibold mb-2">Event Gallery</h3>
          <p className="opacity-90">Explore memorable moments</p>
        </Link>
        <Link to="/moments" className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white hover:shadow-xl transform hover:scale-105 transition-all">
          <FaGraduationCap className="text-3xl mb-3" />
          <h3 className="text-xl font-semibold mb-2">Share Your Moment</h3>
          <p className="opacity-90">Capture and share memories</p>
        </Link>
      </section>
    </div>
  );
};

export default Home;