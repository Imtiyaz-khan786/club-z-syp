import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaUpload, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getGallery, likeGallery, uploadGallery } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageHelper';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: 'event',
    image: null
  });
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await getGallery();
      console.log('Gallery data:', response.data);
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast.error('Failed to load gallery');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    if (!isAuthenticated) {
      toast.error('Please login to like');
      return;
    }
    try {
      const response = await likeGallery(id);
      // Update the likes count in the images state
      setImages(images.map(img => 
        img.id === id 
          ? { ...img, likes_count: response.data.likes_count, is_liked: response.data.liked }
          : img
      ));
      toast.success(response.data.liked ? 'Liked!' : 'Unliked');
    } catch (error) {
      console.error('Error liking:', error);
      toast.error('Failed to like');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.image || !uploadData.title) {
      toast.error('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('category', uploadData.category);
    formData.append('image', uploadData.image);

    try {
      const response = await uploadGallery(formData);
      toast.success('Image uploaded successfully!');
      setShowUpload(false);
      setUploadData({ title: '', description: '', category: 'event', image: null });
      fetchGallery(); // Refresh gallery
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Failed to upload image');
    }
  };

  const categories = ['all', 'event', 'cultural', 'sports', 'workshop', 'academic'];
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredImages = activeCategory === 'all' 
    ? images 
    : images.filter(img => img.category === activeCategory);

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
          <h1 className="text-3xl font-bold text-gray-800">Event Gallery</h1>
          <p className="text-gray-600 mt-1">Explore memorable moments from campus events</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'leader') && (
          <button
            onClick={() => setShowUpload(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FaUpload /> Upload Photo
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full capitalize transition-all ${
              activeCategory === cat
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No gallery images yet</p>
          {(user?.role === 'admin' || user?.role === 'leader') && (
            <button
              onClick={() => setShowUpload(true)}
              className="btn-primary mt-4 inline-flex items-center gap-2"
            >
              <FaUpload /> Upload First Image
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <div key={image.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="relative h-56 overflow-hidden cursor-pointer" onClick={() => setSelectedImage(image)}>
                <img 
                  src={getImageUrl(image.image)} 
                  alt={image.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                  {image.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800">{image.title}</h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{image.description}</p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <button 
                    onClick={() => handleLike(image.id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    {image.is_liked ? (
                      <FaHeart className="text-red-500" />
                    ) : (
                      <FaRegHeart />
                    )}
                    <span>{image.likes_count || 0}</span>
                  </button>
                  <div className="flex items-center gap-1 text-gray-500">
                    <span>{new Date(image.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
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
              <h2 className="text-2xl font-bold">Upload Photo</h2>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                  className="input-field"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  value={uploadData.category}
                  onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                  className="input-field"
                >
                  <option value="event">Event</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Sports</option>
                  <option value="workshop">Workshop</option>
                  <option value="academic">Academic</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Select Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadData({...uploadData, image: e.target.files[0]})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Upload Photo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl max-h-[90vh] relative">
            <img src={getImageUrl(selectedImage.image)} alt={selectedImage.title} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4 rounded-b-lg">
              <h3 className="text-xl font-bold">{selectedImage.title}</h3>
              <p className="text-sm mt-1">{selectedImage.description}</p>
              <div className="flex gap-4 mt-2">
                <span>❤️ {selectedImage.likes_count || 0} likes</span>
                <span>📅 {new Date(selectedImage.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <button className="absolute top-4 right-4 text-white text-2xl" onClick={() => setSelectedImage(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;