import React, { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaStar, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { getChampions } from '../services/api';
import { getImageUrl } from '../utils/imageHelper';

const Champions = () => {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchChampions();
  }, []);

  const fetchChampions = async () => {
    try {
      setLoading(true);
      const response = await getChampions();
      console.log('Champions data:', response.data);
      setChampions(response.data);
    } catch (error) {
      console.error('Error fetching champions:', error);
      setChampions([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'academic', 'technical', 'cultural', 'sports', 'community'];
  
  const filteredChampions = selectedCategory === 'all' 
    ? champions 
    : champions.filter(c => c.category === selectedCategory);

  const getMedalColor = (medal) => {
    switch(medal) {
      case 'gold': return 'text-yellow-500';
      case 'silver': return 'text-gray-400';
      case 'bronze': return 'text-amber-600';
      default: return 'text-primary';
    }
  };

  const topChampions = [...champions].sort((a, b) => b.points - a.points).slice(0, 3);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">🏆 Champions Hall of Fame</h1>
            <p className="text-lg opacity-90">Celebrating excellence and achievement</p>
          </div>
          <FaTrophy className="text-6xl opacity-50" />
        </div>
      </div>

      {/* Top 3 Champions */}
      {topChampions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topChampions.map((champion, index) => (
            <div key={champion.id} className="relative bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all">
              <div className={`absolute top-0 right-0 w-20 h-20 ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'} rounded-bl-full flex items-center justify-center`}>
                <FaTrophy className="text-2xl text-white" />
              </div>
              <div className="p-6 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary bg-gray-100 flex items-center justify-center">
                  {champion.image ? (
                    <img src={getImageUrl(champion.image)} alt={champion.user?.username} className="w-full h-full object-cover" />
                  ) : (
                    <FaUser className="text-4xl text-gray-400" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800">{champion.user?.username || 'Champion'}</h3>
                <p className="text-primary font-semibold mt-1">{champion.title}</p>
                <div className="flex justify-center gap-2 mt-3">
                  <FaMedal className={getMedalColor(champion.medal)} />
                  <span className="text-sm text-gray-600">{champion.points} points</span>
                </div>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{champion.achievement}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full capitalize transition-all ${
              selectedCategory === cat
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Champions List */}
      {filteredChampions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No champions found</p>
          <p className="text-gray-400 text-sm mt-2">Check back later to see our achievers!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChampions.map((champion) => (
            <div key={champion.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
              <div className="flex p-4">
                <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                  {champion.image ? (
                    <img src={getImageUrl(champion.image)} alt={champion.user?.username} className="w-full h-full object-cover" />
                  ) : (
                    <FaUser className="text-3xl text-gray-400" />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-800">{champion.user?.username || 'Champion'}</h3>
                  <p className="text-primary text-sm font-medium">{champion.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <FaStar className="text-yellow-500" />
                    <span className="text-sm text-gray-600">{champion.points} points</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{champion.achievement}</p>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <FaCalendarAlt />
                  <span>{champion.year}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaMedal className={getMedalColor(champion.medal)} />
                  <span className="text-sm capitalize">{champion.medal}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      {champions.length > 0 && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">🏅 Overall Leaderboard</h2>
          <div className="space-y-3">
            {champions.slice(0, 5).map((champion, idx) => (
              <div key={champion.id} className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold w-8">#{idx + 1}</span>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                    {champion.image ? (
                      <img src={getImageUrl(champion.image)} alt={champion.user?.username} className="w-full h-full object-cover" />
                    ) : (
                      <FaUser className="text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{champion.user?.username || 'Champion'}</p>
                    <p className="text-sm opacity-75">{champion.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{champion.points}</p>
                  <p className="text-xs opacity-75">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Champions;