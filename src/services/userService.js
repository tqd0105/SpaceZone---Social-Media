import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth token
const createAuthenticatedRequest = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: `${API_URL}/users`,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
};

/**
 * Search users by username or fullName
 * @param {string} query - Search query (username or fullName)
 * @returns {Promise} API response with users list
 */
export const searchUsers = async (query) => {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, users: [], query: '', count: 0 };
    }

    console.log(`🔍 Searching users with query: "${query}"`);
    const api = createAuthenticatedRequest();
    const response = await api.get(`/search/${encodeURIComponent(query.trim())}`);
    
    console.log(`✅ Found ${response.data.users.length} users`);
    return response.data;
    
  } catch (error) {
    console.error('❌ Search users error:', error.response?.data || error.message);
    throw error.response?.data || { error: 'Failed to search users' };
  }
};

const updateAvatar = async (userId, file) => {
    const formData = new FormData();
    formData.append("avatar", file);
  
    try {
      const res = await fetch(`${API_URL}/users/${userId}/avatar`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      console.log("Avatar updated:", data);
    } catch (err) {
      console.error("Lỗi cập nhật avatar:", err);
    }
  };
  
  const updateCoverImage = async (userId, file) => {
    const formData = new FormData();
    formData.append("coverImage", file);
  
    try {
      const res = await fetch(`${API_URL}/users/${userId}/cover`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      console.log("Cover image updated:", data);
    } catch (err) {
      console.error("Lỗi cập nhật cover:", err);
    }
  };

export { updateAvatar, updateCoverImage };
  