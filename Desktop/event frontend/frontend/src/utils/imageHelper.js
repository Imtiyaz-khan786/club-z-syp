// utils/imageHelper.js
const API_BASE_URL = 'http://localhost:8000';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/media/')) return `${API_BASE_URL}${imagePath}`;
  return `${API_BASE_URL}/media/${imagePath}`;
};

export const getMediaUrl = (mediaPath) => {
  if (!mediaPath) return null;
  if (mediaPath.startsWith('http')) return mediaPath;
  return `${API_BASE_URL}${mediaPath}`;
};