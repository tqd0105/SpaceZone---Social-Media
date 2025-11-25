// chatService.js - Chat API service
const API_URL = import.meta.env.VITE_API_URL;
const CHAT_API_URL = `${API_URL}/chat`;

console.log('📌 [ChatService] API_URL:', API_URL);

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.error || data.message || 'API request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
};

// Helper function for retry logic
const withRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      console.warn(`🔄 [ChatService] API call failed (attempt ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt === maxRetries || error.status === 401 || error.status === 403) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
};

export const chatService = {
  // Get all conversations for current user
  getConversations: async () => {
    console.log('📋 [ChatService] Fetching conversations...');
    
    return withRetry(async () => {
      const response = await fetch(`${CHAT_API_URL}/conversations`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      const data = await handleResponse(response);
      console.log(`✅ [ChatService] Fetched ${data.conversations?.length || 0} conversations`);
      return data;
    });
  },

  // Create or get existing conversation between users
  createConversation: async (recipientId) => {
    console.log(`📋 [ChatService] Creating conversation with user: ${recipientId}`);
    
    return withRetry(async () => {
      const response = await fetch(`${CHAT_API_URL}/conversations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ recipientId }),
      });
      
      const data = await handleResponse(response);
      console.log(`✅ [ChatService] ${data.isNew ? 'Created' : 'Found'} conversation: ${data.conversation?._id}`);
      return data;
    });
  },

  // Get messages in a conversation
  getMessages: async (conversationId, page = 1, limit = 50) => {
    console.log(`📋 [ChatService] Fetching messages for conversation: ${conversationId} (page: ${page})`);
    
    return withRetry(async () => {
      const url = new URL(`${CHAT_API_URL}/conversations/${conversationId}/messages`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', limit.toString());
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      const data = await handleResponse(response);
      console.log(`✅ [ChatService] Fetched ${data.messages?.length || 0} messages`);
      return data;
    });
  },

  // Send a new message (REST API - will also be sent via Socket.IO)
  sendMessage: async (conversationId, content, type = 'text') => {
    console.log(`📋 [ChatService] Sending message to conversation: ${conversationId}`);
    
    return withRetry(async () => {
      const response = await fetch(`${CHAT_API_URL}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content, type }),
      });
      
      const data = await handleResponse(response);
      console.log(`✅ [ChatService] Message sent: ${data.message?._id}`);
      return data;
    });
  },

  // Mark message as read
  markMessageAsRead: async (messageId) => {
    console.log(`📋 [ChatService] Marking message as read: ${messageId}`);
    
    return withRetry(async () => {
      const response = await fetch(`${CHAT_API_URL}/messages/${messageId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      
      const data = await handleResponse(response);
      console.log(`✅ [ChatService] Message marked as read: ${messageId}`);
      return data;
    });
  },

  // Get unread count for conversation
  getUnreadCount: async (conversationId) => {
    console.log(`📋 [ChatService] Getting unread count for conversation: ${conversationId}`);
    
    return withRetry(async () => {
      const response = await fetch(`${CHAT_API_URL}/conversations/${conversationId}/unread-count`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      const data = await handleResponse(response);
      console.log(`✅ [ChatService] Unread count: ${data.unreadCount} for conversation: ${conversationId}`);
      return data;
    });
  },

  // Search users (for creating new conversations)
  searchUsers: async (query) => {
    console.log(`📋 [ChatService] Searching users with query: "${query}"`);
    
    return withRetry(async () => {
      const url = new URL(`${API_URL}/users/search`);
      url.searchParams.append('q', query);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      const data = await handleResponse(response);
      console.log(`✅ [ChatService] Found ${data.users?.length || 0} users`);
      return data;
    });
  },

  // Get user profile (for chat participant info)
  getUserProfile: async (userId) => {
    console.log(`📋 [ChatService] Getting user profile: ${userId}`);
    
    return withRetry(async () => {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      const data = await handleResponse(response);
      console.log(`✅ [ChatService] Got user profile: ${data.user?.name}`);
      return data;
    });
  },
};

// Export individual functions for backward compatibility
export const {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markMessageAsRead,
  getUnreadCount,
  searchUsers,
  getUserProfile,
} = chatService;

export default chatService;