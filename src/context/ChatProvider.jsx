// ChatProvider.jsx - Context provider for chat functionality
import { createContext, useReducer, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useChatSocket } from '../hooks/useChatSocket';
import { chatService } from '../services/chatService';
import { useAuth } from './AuthProvider';

const ChatContext = createContext();

// Chat actions
const CHAT_ACTIONS = {
  SET_CONVERSATIONS: 'SET_CONVERSATIONS',
  ADD_CONVERSATION: 'ADD_CONVERSATION',
  UPDATE_CONVERSATION: 'UPDATE_CONVERSATION',
  SET_ACTIVE_CONVERSATION: 'SET_ACTIVE_CONVERSATION',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  REMOVE_MESSAGE: 'REMOVE_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  SET_TYPING_USERS: 'SET_TYPING_USERS',
  SET_ONLINE_USERS: 'SET_ONLINE_USERS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CHAT_OPEN: 'SET_CHAT_OPEN',
  MARK_MESSAGE_READ: 'MARK_MESSAGE_READ',
  UPDATE_UNREAD_COUNT: 'UPDATE_UNREAD_COUNT',
};

// Initial state
const initialState = {
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingUsers: {},
  onlineUsers: new Set(),
  loading: false,
  error: null,
  isChatOpen: false,
  unreadCounts: {},
};

// Chat reducer
const chatReducer = (state, action) => {
  console.log(`🔄 [ChatProvider] Action: ${action.type}`, action.payload);
  
  switch (action.type) {
    case CHAT_ACTIONS.SET_CONVERSATIONS:
      return {
        ...state,
        conversations: action.payload,
        loading: false,
      };

    case CHAT_ACTIONS.ADD_CONVERSATION:
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      };

    case CHAT_ACTIONS.UPDATE_CONVERSATION:
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv._id === action.payload._id ? { ...conv, ...action.payload } : conv
        ),
      };

    case CHAT_ACTIONS.SET_ACTIVE_CONVERSATION:
      return {
        ...state,
        activeConversationId: action.payload,
      };

    case CHAT_ACTIONS.SET_MESSAGES:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: action.payload.messages,
        },
        loading: false,
      };

    case CHAT_ACTIONS.ADD_MESSAGE: {
      const { conversationId, message } = action.payload;
      console.log(`📋 [Reducer] ADD_MESSAGE - ConversationId: ${conversationId}, Message:`, message);
      console.log(`📋 [Reducer] Current messages for ${conversationId}:`, state.messages[conversationId]?.length || 0);
      
      const updatedState = {
        ...state,
        messages: {
          ...state.messages,
          [conversationId]: [
            ...(state.messages[conversationId] || []),
            message,
          ],
        },
      };
      
      console.log(`📋 [Reducer] Updated messages for ${conversationId}:`, updatedState.messages[conversationId]?.length || 0);
      return updatedState;
    }

    case CHAT_ACTIONS.REMOVE_MESSAGE: {
      const messageId = action.payload;
      const conversationId = state.activeConversationId;
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId]?.filter(msg => msg._id !== messageId) || [],
        },
      };
    }

    case CHAT_ACTIONS.UPDATE_MESSAGE: {
      const { conversationId: convId, messageId, updates } = action.payload;
      return {
        ...state,
        messages: {
          ...state.messages,
          [convId]: state.messages[convId]?.map(msg =>
            msg._id === messageId ? { ...msg, ...updates } : msg
          ) || [],
        },
      };
    }

    case CHAT_ACTIONS.SET_TYPING_USERS:
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.conversationId]: action.payload.users,
        },
      };

    case CHAT_ACTIONS.SET_ONLINE_USERS:
      return {
        ...state,
        onlineUsers: new Set(action.payload),
      };

    case CHAT_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case CHAT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case CHAT_ACTIONS.SET_CHAT_OPEN:
      return {
        ...state,
        isChatOpen: action.payload,
      };

    case CHAT_ACTIONS.MARK_MESSAGE_READ: {
      const { messageId: msgId } = action.payload;
      return {
        ...state,
        messages: Object.keys(state.messages).reduce((acc, convId) => {
          acc[convId] = state.messages[convId].map(msg =>
            msg._id === msgId ? { ...msg, isRead: true } : msg
          );
          return acc;
        }, {}),
      };
    }

    case CHAT_ACTIONS.UPDATE_UNREAD_COUNT:
      return {
        ...state,
        unreadCounts: {
          ...state.unreadCounts,
          [action.payload.conversationId]: action.payload.count,
        },
      };

    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const socket = useChatSocket();
  const { user } = useAuth();

  // Socket event handlers
  useEffect(() => {
    if (!socket.socket || !socket.isConnected) return;


    // Handle new messages
    const handleNewMessage = (message) => {
      
      const currentUserId = user?.id || user?._id;
      const conversationId = message.conversation || message.conversationId;
      const conversationMessages = state.messages[conversationId] || [];
      
      // Check if this message already exists (to prevent duplicates)
      const existingMessage = conversationMessages.find(msg => 
        msg._id === message._id || 
        (msg.content === message.content && 
         msg.sender?._id === message.sender?._id &&
         Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 5000) // Within 5 seconds
      );
      
      if (existingMessage && !existingMessage._id.startsWith('temp-')) {
        console.log('⚠️ [ChatProvider] Duplicate message detected, ignoring:', message._id);
        return;
      }
      
      // Check if this is a message from current user (to replace optimistic message)
      if (message.sender._id === currentUserId) {
                
        const optimisticMsg = conversationMessages.find(msg => {
          const isTemp = msg._id.startsWith('temp-');
          const sameContent = msg.content === message.content;
          const sameTime = Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 10000; // Within 10 seconds
          return isTemp && sameContent && sameTime;
        });
        
        if (optimisticMsg) {
          console.log('🗑️ [ChatProvider] Removing optimistic message:', optimisticMsg._id);
          dispatch({ 
            type: CHAT_ACTIONS.REMOVE_MESSAGE, 
            payload: optimisticMsg._id 
          });
        } else {
          console.log('⚠️ [ChatProvider] No matching optimistic message found, but this is our message - skip adding');
          return; // Don't add our own message if no optimistic message to replace
        }
      } else {
        console.log('📬 [ChatProvider] This is a message from another user - showing immediately');
      }
      
      console.log('📝 [ChatProvider] Adding real message to state');
      dispatch({
        type: CHAT_ACTIONS.ADD_MESSAGE,
        payload: {
          conversationId,
          message,
        },
      });

      // Update conversation last message
      dispatch({
        type: CHAT_ACTIONS.UPDATE_CONVERSATION,
        payload: {
          _id: conversationId,
          lastMessage: message,
          lastActivity: new Date(),
        },
      });
      
      // Force re-render by updating message count
      console.log('📬 [ChatProvider] Message added, triggering UI update');
    };

    // Handle user typing (server sends separate events)
    const handleUserTyping = ({ conversationId, userId, user }) => {
      console.log(`⌨️ [ChatProvider] User started typing: ${user?.name || userId} in conversation ${conversationId}`);
      
      dispatch({
        type: CHAT_ACTIONS.SET_TYPING_USERS,
        payload: {
          conversationId,
          users: [{ userId, user }],
        },
      });
    };

    const handleUserStopTyping = ({ conversationId, userId, user }) => {
      
      dispatch({
        type: CHAT_ACTIONS.SET_TYPING_USERS,
        payload: {
          conversationId,
          users: [],
        },
      });
    };

    // Handle message read receipts
    const handleMessageRead = ({ messageId, userId }) => {
      dispatch({
        type: CHAT_ACTIONS.MARK_MESSAGE_READ,
        payload: { messageId },
      });
    };

    // Handle online status
    const handleUserOnline = ({ userId }) => {
      console.log(`🟢 [ChatProvider] User online: ${userId}`);
      dispatch({
        type: CHAT_ACTIONS.SET_ONLINE_USERS,
        payload: [...state.onlineUsers, userId],
      });
    };

    const handleUserOffline = ({ userId }) => {
      console.log(`🔴 [ChatProvider] User offline: ${userId}`);
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.delete(userId);
      dispatch({
        type: CHAT_ACTIONS.SET_ONLINE_USERS,
        payload: Array.from(newOnlineUsers),
      });
    };

    // Register event listeners với đúng event names từ server
    socket.on('message:new', handleNewMessage);
    socket.on('user:typing', handleUserTyping);
    socket.on('user:stop_typing', handleUserStopTyping);
    socket.on('message:read', handleMessageRead);
    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);

    // Cleanup
    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('user:typing', handleUserTyping);
      socket.off('user:stop_typing', handleUserStopTyping);
      socket.off('message:read', handleMessageRead);
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
    };
  }, [socket, state.onlineUsers, state.messages, user]);

  // API functions
  const loadConversations = useCallback(async () => {
    try {
      console.log('📋 [ChatProvider] Loading conversations...');
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
      
      const data = await chatService.getConversations();
      dispatch({
        type: CHAT_ACTIONS.SET_CONVERSATIONS,
        payload: data.conversations || [],
      });
    } catch (error) {
      console.error('❌ [ChatProvider] Error loading conversations:', error);
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
    }
  }, []);

  const createConversation = useCallback(async (recipientId) => {
    try {
      console.log(`📋 [ChatProvider] Creating conversation with: ${recipientId}`);
      const data = await chatService.createConversation(recipientId);
      
      if (data.isNew) {
        dispatch({
          type: CHAT_ACTIONS.ADD_CONVERSATION,
          payload: data.conversation,
        });
      }
      
      return data.conversation;
    } catch (error) {
      console.error('❌ [ChatProvider] Error creating conversation:', error);
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  const loadMessages = useCallback(async (conversationId, page = 1) => {
    try {
      console.log(`📋 [ChatProvider] Loading messages for: ${conversationId}`);
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
      
      const data = await chatService.getMessages(conversationId, page);
      dispatch({
        type: CHAT_ACTIONS.SET_MESSAGES,
        payload: {
          conversationId,
          messages: data.messages || [],
        },
      });
    } catch (error) {
      console.error('❌ [ChatProvider] Error loading messages:', error);
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
    }
  }, []);

  const sendMessage = useCallback(async (conversationId, content, type = 'text') => {
    try {
      console.log(`📋 [ChatProvider] Sending message to: ${conversationId}`);
      console.log('📋 [ChatProvider] Current messages state:', state.messages[conversationId]?.length || 0);
      
      // Optimistic update - add message immediately to UI
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const optimisticMessage = {
        _id: tempId,
        conversationId,
        content,
        type,
        sender: {
          _id: user?.id || user?._id,
          name: user?.name,
          username: user?.username,
          avatar: user?.avatar
        },
        createdAt: new Date().toISOString(),
        status: 'sending' // Mark as sending
      };
      
      console.log('📋 [ChatProvider] Adding optimistic message:', optimisticMessage);
      
      // Add to local state immediately
      dispatch({ 
        type: CHAT_ACTIONS.ADD_MESSAGE, 
        payload: {
          conversationId,
          message: optimisticMessage
        }
      });
      
      try {
        console.log('📋 [ChatProvider] Attempting to send message...');
        
        // Send via Socket.IO for real-time delivery
        if (socket.isConnected) {
          await socket.sendMessage(conversationId, content, type);
          console.log('✅ [ChatProvider] Message sent via Socket.IO');
        } else {
          // Fallback to REST API
          await chatService.sendMessage(conversationId, content, type);
          console.log('✅ [ChatProvider] Message sent via REST API');
        }
        
        // Message sent successfully - update status but don't remove
        // Real message will come via socket and replace this one
        dispatch({ 
          type: CHAT_ACTIONS.UPDATE_MESSAGE, 
          payload: { 
            conversationId, 
            messageId: tempId, 
            updates: { status: 'sent' } 
          } 
        });
        
      } catch (sendError) {
        console.error('❌ [ChatProvider] Send failed:', sendError);
        
        // Only remove optimistic message for actual send failures, not timeouts
        if (sendError.message !== 'Message send timeout') {
          dispatch({ 
            type: CHAT_ACTIONS.REMOVE_MESSAGE, 
            payload: tempId 
          });
        } else {
          // For timeouts, just mark as failed but keep visible
          dispatch({ 
            type: CHAT_ACTIONS.UPDATE_MESSAGE, 
            payload: { 
              conversationId, 
              messageId: tempId, 
              updates: { status: 'failed' } 
            } 
          });
        }
        
        throw sendError;
      }
      
    } catch (error) {
      console.error('❌ [ChatProvider] Error sending message:', error);
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, [socket, user, dispatch]);

  const setActiveConversation = useCallback((conversationId) => {
    console.log(`📋 [ChatProvider] Setting active conversation: ${conversationId}`);
    
    // Leave previous room
    if (state.activeConversationId) {
      socket.leaveConversation(state.activeConversationId);
    }
    
    // Join new room
    if (conversationId) {
      socket.joinConversation(conversationId);
    }
    
    dispatch({
      type: CHAT_ACTIONS.SET_ACTIVE_CONVERSATION,
      payload: conversationId,
    });
  }, [state.activeConversationId, socket]);

  const toggleChat = useCallback(() => {
    dispatch({
      type: CHAT_ACTIONS.SET_CHAT_OPEN,
      payload: !state.isChatOpen,
    });
  }, [state.isChatOpen]);

  const sendTyping = useCallback((conversationId, isTyping) => {
    if (socket.isConnected) {
      socket.sendTyping(conversationId, isTyping);
    }
  }, [socket]);

  const markMessageAsRead = useCallback(async (messageId) => {
    try {
      if (socket.isConnected) {
        socket.markMessageAsRead(messageId);
      }
      await chatService.markMessageAsRead(messageId);
    } catch (error) {
      console.error('❌ [ChatProvider] Error marking message as read:', error);
    }
  }, [socket]);

  const value = {
    // State
    ...state,
    socket: socket.socket,
    socketConnected: socket.isConnected,
    socketError: socket.error,
    
    // Actions
    loadConversations,
    createConversation,
    loadMessages,
    sendMessage,
    setActiveConversation,
    toggleChat,
    sendTyping,
    markMessageAsRead,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { ChatContext };
export default ChatProvider;