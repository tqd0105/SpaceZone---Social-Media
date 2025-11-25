// ChatProvider.jsx - Context provider for chat functionality
import { createContext, useReducer, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useChatSocket } from '../hooks/useChatSocket';
import { chatService } from '../services/chatService';

const ChatContext = createContext();

// Chat actions
const CHAT_ACTIONS = {
  SET_CONVERSATIONS: 'SET_CONVERSATIONS',
  ADD_CONVERSATION: 'ADD_CONVERSATION',
  UPDATE_CONVERSATION: 'UPDATE_CONVERSATION',
  SET_ACTIVE_CONVERSATION: 'SET_ACTIVE_CONVERSATION',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
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
      return {
        ...state,
        messages: {
          ...state.messages,
          [conversationId]: [
            ...(state.messages[conversationId] || []),
            message,
          ],
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

  console.log('📌 [ChatProvider] Current state:', {
    conversations: state.conversations.length,
    activeConversationId: state.activeConversationId,
    isChatOpen: state.isChatOpen,
    socketConnected: socket.isConnected,
  });

  // Socket event handlers
  useEffect(() => {
    if (!socket.socket || !socket.isConnected) return;

    console.log('👂 [ChatProvider] Setting up socket listeners...');

    // Handle new messages
    const handleNewMessage = (message) => {
      console.log('📬 [ChatProvider] New message received:', message);
      dispatch({
        type: CHAT_ACTIONS.ADD_MESSAGE,
        payload: {
          conversationId: message.conversationId,
          message,
        },
      });

      // Update conversation last message
      dispatch({
        type: CHAT_ACTIONS.UPDATE_CONVERSATION,
        payload: {
          _id: message.conversationId,
          lastMessage: message,
          lastActivity: new Date(),
        },
      });
    };

    // Handle typing indicators
    const handleTyping = ({ conversationId, userId, isTyping, user }) => {
      console.log(`⌨️ [ChatProvider] Typing event: ${user?.name} ${isTyping ? 'started' : 'stopped'} typing`);
      
      dispatch({
        type: CHAT_ACTIONS.SET_TYPING_USERS,
        payload: {
          conversationId,
          users: isTyping ? [{ userId, user }] : [],
        },
      });
    };

    // Handle message read receipts
    const handleMessageRead = ({ messageId, userId }) => {
      console.log(`👁️ [ChatProvider] Message read: ${messageId} by ${userId}`);
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

    // Register event listeners
    socket.on('new_message', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('message_read', handleMessageRead);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    // Cleanup
    return () => {
      console.log('🧹 [ChatProvider] Cleaning up socket listeners...');
      socket.off('new_message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('message_read', handleMessageRead);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
    };
  }, [socket, state.onlineUsers]);

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
      
      // Send via Socket.IO for real-time delivery
      if (socket.isConnected) {
        await socket.sendMessage(conversationId, content, type);
      } else {
        // Fallback to REST API
        await chatService.sendMessage(conversationId, content, type);
      }
    } catch (error) {
      console.error('❌ [ChatProvider] Error sending message:', error);
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, [socket]);

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