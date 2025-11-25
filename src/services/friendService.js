import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth token
const createAuthenticatedRequest = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: `${API_URL}/friends`,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
};

// LOG: Friend service initialization
console.log('👥 Initializing Friend Service...');

/**
 * Send friend request to user
 * @param {string} receiverId - ID of user to send request to
 * @returns {Promise} API response
 */
export const sendFriendRequest = async (receiverId) => {
  try {
    console.log(`📤 Sending friend request to: ${receiverId}`);
    const api = createAuthenticatedRequest();
    const response = await api.post('/send-request', { receiverId });
    console.log('✅ Friend request sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Send friend request error:', error.response?.data || error.message);
    throw error.response?.data || { error: 'Failed to send friend request' };
  }
};

/**
 * Accept friend request
 * @param {string} requestId - ID of friend request to accept
 * @returns {Promise} API response
 */
export const acceptFriendRequest = async (requestId) => {
  try {
    console.log(`✅ Accepting friend request: ${requestId}`);
    const api = createAuthenticatedRequest();
    const response = await api.post(`/accept/${requestId}`);
    console.log('✅ Friend request accepted:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Accept friend request error:', error.response?.data || error.message);
    throw error.response?.data || { error: 'Failed to accept friend request' };
  }
};

/**
 * Reject friend request
 * @param {string} requestId - ID of friend request to reject
 * @returns {Promise} API response
 */
export const rejectFriendRequest = async (requestId) => {
  try {
    console.log(`❌ Rejecting friend request: ${requestId}`);
    const api = createAuthenticatedRequest();
    const response = await api.post(`/reject/${requestId}`);
    console.log('✅ Friend request rejected:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Reject friend request error:', error.response?.data || error.message);
    throw error.response?.data || { error: 'Failed to reject friend request' };
  }
};

/**
 * Block user
 * @param {string} userId - ID of user to block
 * @returns {Promise} API response
 */
export const blockUser = async (userId) => {
  try {
    console.log(`🚫 Blocking user: ${userId}`);
    const api = createAuthenticatedRequest();
    const response = await api.post(`/block/${userId}`);
    console.log('✅ User blocked successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Block user error:', error.response?.data || error.message);
    throw error.response?.data || { error: 'Failed to block user' };
  }
};

/**
 * Remove friend
 * @param {string} friendId - ID of friend to remove
 * @returns {Promise} API response
 */
export const removeFriend = async (friendId) => {
  try {
    console.log(`💔 Removing friend: ${friendId}`);
    const api = createAuthenticatedRequest();
    const response = await api.delete(`/remove/${friendId}`);
    console.log('✅ Friend removed successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Remove friend error:', error.response?.data || error.message);
    throw error.response?.data || { error: 'Failed to remove friend' };
  }
};

/**
 * Get friends list
 * @param {object} params - Query parameters (page, limit, search)
 * @returns {Promise} API response with friends list
 */
export const getFriends = async (params = {}) => {
  try {
    console.log('👥 Fetching friends list:', params);
    const api = createAuthenticatedRequest();
    const response = await api.get('/list', { params });
    console.log(`✅ Retrieved ${response.data.data.friends.length} friends`);
    return response.data;
  } catch (error) {
    console.error('❌ Get friends error:', error.response?.data || error.message);
    throw error.response?.data || { error: 'Failed to get friends list' };
  }
};

/**
 * Get friend requests
 * @param {object} params - Query parameters (type, page, limit)
 * @returns {Promise} API response with friend requests
 */
export const getFriendRequests = async (params = {}) => {
  try {
    console.log('📨 Fetching friend requests:', params);
    const api = createAuthenticatedRequest();
    const response = await api.get('/requests', { params });
    console.log(`✅ Retrieved ${response.data.data.requests.length} friend requests`);
    return response.data;
  } catch (error) {
    console.error('❌ Get friend requests error:', error.response?.data || error.message);
    throw error.response?.data || { error: 'Failed to get friend requests' };
  }
};

/**
 * Get friend suggestions
 * @param {number} limit - Number of suggestions to get
 * @returns {Promise} API response with friend suggestions
 */
export const getFriendSuggestions = async (limit = 10) => {
  try {
    console.log(`🎯 Fetching ${limit} friend suggestions`);
    const api = createAuthenticatedRequest();
    const response = await api.get('/suggestions', { params: { limit } });
    console.log(`✅ Retrieved ${response.data.data.suggestions.length} friend suggestions`);
    return response.data;
  } catch (error) {
    console.error('❌ Get friend suggestions error:', error.response?.data || error.message);
    throw error.response?.data || { error: 'Failed to get friend suggestions' };
  }
};

// LOG: Friend service loaded successfully
console.log('✅ Friend Service loaded successfully');

export default {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  blockUser,
  removeFriend,
  getFriends,
  getFriendRequests,
  getFriendSuggestions
};