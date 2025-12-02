// Integration utilities for Friend system with Chat system

import { chatService } from '../services/chatService';

/**
 * Start a chat with a friend
 * @param {Object} friend - Friend object from friends list
 * @param {Function} onSuccess - Callback when chat is successfully created
 * @param {Function} onError - Callback when error occurs
 * @param {Object} chatContext - Optional chat context with setActiveConversation
 */
export const startChatWithFriend = async (friend, onSuccess, onError, chatContext = null) => {
  try {
    console.log(`💬 [friendChatIntegration] Starting chat with friend: ${friend.username} (ID: ${friend._id})`);

    // Create or get conversation with the friend
    const response = await chatService.createConversation(friend._id);
    console.log('🚀 [friendChatIntegration] Chat service response:', response);
    
    if (response.success || response.conversation) {
      console.log(`✅ [friendChatIntegration] Chat conversation ready:`, response.conversation);
      
      // If chat context provided, set the active conversation
      if (chatContext && chatContext.setActiveConversation) {
        console.log('🎯 [friendChatIntegration] Setting active conversation:', response.conversation._id);
        chatContext.setActiveConversation(response.conversation._id);
        
        // Load messages for the conversation
        if (chatContext.loadMessages) {
          console.log('📋 [friendChatIntegration] Loading messages for conversation');
          chatContext.loadMessages(response.conversation._id);
        }
      }
      
      // Call success callback with conversation data
      if (onSuccess) {
        console.log('🎯 [friendChatIntegration] Calling onSuccess callback...');
        onSuccess(response.conversation, friend);
      }
      
      return response.conversation;
    } else {
      throw new Error(response.error || 'Failed to create conversation');
    }
    
  } catch (error) {
    console.error('❌ [friendChatIntegration] Error starting chat with friend:', error);
    
    // Handle specific friendship errors
    if (error.message?.includes('bạn bè') || error.message?.includes('friends')) {
      console.log('🚫 [friendChatIntegration] Friendship required for chat');
      
      if (onError) {
        onError({
          type: 'friendship_required',
          message: 'Bạn cần phải là bạn bè để có thể nhắn tin với nhau.',
          friend
        });
      }
    } else {
      if (onError) {
        onError({
          type: 'general_error',
          message: error.message || 'Không thể tạo cuộc trò chuyện.',
          friend
        });
      }
    }
    
    throw error;
  }
};

/**
 * Check if two users can chat (are friends)
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<boolean>} Whether users can chat
 */
export const canUsersChat = async (userId1, userId2) => {
  try {
    console.log(`🔐 Checking if users can chat: ${userId1} <-> ${userId2}`);
    
    // Try to create a conversation (this will check friendship)
    const response = await chatService.createConversation(userId2);
    
    return response.success || !!response.conversation;
    
  } catch (error) {
    console.log(`❌ Users cannot chat: ${error.message}`);
    return false;
  }
};

/**
 * Get friendship status from conversation
 * @param {Object} conversation - Conversation object
 * @returns {string} Friendship status
 */
export const getFriendshipStatusFromConversation = (conversation) => {
  return conversation?.friendshipStatus || 'unknown';
};

/**
 * Check if conversation is active (users are still friends)
 * @param {Object} conversation - Conversation object
 * @returns {boolean} Whether conversation is active
 */
export const isConversationActive = (conversation) => {
  const status = getFriendshipStatusFromConversation(conversation);
  return status === 'accepted';
};

/**
 * Get conversation warning message based on friendship status
 * @param {string} friendshipStatus - Friendship status
 * @returns {string|null} Warning message or null
 */
export const getConversationWarning = (friendshipStatus) => {
  switch (friendshipStatus) {
    case 'pending':
      return 'Lời mời kết bạn đang chờ phản hồi. Không thể nhắn tin.';
    case 'blocked':
      return 'Người dùng này đã bị chặn. Không thể nhắn tin.';
    case 'none':
      return 'Bạn cần kết bạn để có thể nhắn tin.';
    case 'rejected':
      return 'Lời mời kết bạn đã bị từ chối. Không thể nhắn tin.';
    case 'accepted':
      return null; // No warning, can chat freely
    default:
      return 'Trạng thái kết bạn không xác định.';
  }
};

export default {
  startChatWithFriend,
  canUsersChat,
  getFriendshipStatusFromConversation,
  isConversationActive,
  getConversationWarning
};