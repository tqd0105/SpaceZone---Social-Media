// useChatSocket.js - Custom hook for Socket.IO chat functionality
import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

// Fix: Remove /api from URL for Socket.IO connection
const getSocketURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return apiUrl.replace('/api', ''); // Remove /api suffix if present
};

const SOCKET_URL = getSocketURL();

export const useChatSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Connection management
  const connect = useCallback(() => {
    console.log('🔌 [Socket] Attempting to connect to:', SOCKET_URL);
    console.log('🔌 [Socket] Environment check:', {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      SOCKET_URL: SOCKET_URL,
      NODE_ENV: import.meta.env.NODE_ENV,
    });
    
    const token = sessionStorage.getItem('token');
    
    if (!token) {
      console.warn('⚠️ [Socket] No token found, cannot connect');
      setError('Authentication token not found');
      return;
    }

    try {
      socketRef.current = io(SOCKET_URL, {
        auth: {
          token: token.replace('Bearer ', ''), // Remove Bearer prefix if exists
        },
        transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        maxReconnectionAttempts: 5,
        autoConnect: true,
      });

      // Connection events
      socketRef.current.on('connect', () => {
        console.log('✅ [Socket] Connected successfully');
        setIsConnected(true);
        setError(null);
        setReconnectAttempts(0);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.warn('🔌 [Socket] Disconnected:', reason);
        setIsConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server disconnected, need to reconnect manually
          socketRef.current.connect();
        }
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('❌ [Socket] Connection error:', err.message);
        setError(err.message);
        setIsConnected(false);
      });

      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log(`🔄 [Socket] Reconnected after ${attemptNumber} attempts`);
        setIsConnected(true);
        setError(null);
        setReconnectAttempts(attemptNumber);
      });

      socketRef.current.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 [Socket] Reconnect attempt ${attemptNumber}`);
        setReconnectAttempts(attemptNumber);
      });

      socketRef.current.on('reconnect_failed', () => {
        console.error('❌ [Socket] Reconnection failed');
        setError('Failed to reconnect to server');
      });

    } catch (err) {
      console.error('❌ [Socket] Failed to initialize:', err);
      setError('Failed to initialize socket connection');
    }
  }, []);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 [Socket] Disconnecting...');
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setError(null);
    }
  }, []);

  // Join conversation room
  const joinConversation = useCallback((conversationId) => {
    if (!socketRef.current || !isConnected) {
      console.warn('⚠️ [Socket] Cannot join room - not connected');
      return;
    }
    
    console.log(`🏠 [Socket] Joining conversation room: ${conversationId}`);
    socketRef.current.emit('join_conversation', conversationId);
  }, [isConnected]);

  // Leave conversation room
  const leaveConversation = useCallback((conversationId) => {
    if (!socketRef.current || !isConnected) {
      console.warn('⚠️ [Socket] Cannot leave room - not connected');
      return;
    }
    
    console.log(`🏠 [Socket] Leaving conversation room: ${conversationId}`);
    socketRef.current.emit('leave_conversation', conversationId);
  }, [isConnected]);

  // Send message via Socket.IO
  const sendMessage = useCallback((conversationId, content, type = 'text') => {
    if (!socketRef.current || !isConnected) {
      console.warn('⚠️ [Socket] Cannot send message - not connected');
      return Promise.reject(new Error('Socket not connected'));
    }

    console.log(`💬 [Socket] Sending message to conversation: ${conversationId}`);
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Message send timeout'));
      }, 10000);

      socketRef.current.emit('send_message', {
        conversationId,
        content,
        type,
      }, (response) => {
        clearTimeout(timeout);
        
        if (response.error) {
          console.error('❌ [Socket] Message send failed:', response.error);
          reject(new Error(response.error));
        } else {
          console.log('✅ [Socket] Message sent successfully:', response.messageId);
          resolve(response);
        }
      });
    });
  }, [isConnected]);

  // Send typing indicator
  const sendTyping = useCallback((conversationId, isTyping) => {
    if (!socketRef.current || !isConnected) {
      return;
    }

    console.log(`⌨️ [Socket] Sending typing indicator: ${isTyping} for conversation: ${conversationId}`);
    socketRef.current.emit('typing', { conversationId, isTyping });
  }, [isConnected]);

  // Mark message as read
  const markMessageAsRead = useCallback((messageId) => {
    if (!socketRef.current || !isConnected) {
      return;
    }

    console.log(`👁️ [Socket] Marking message as read: ${messageId}`);
    socketRef.current.emit('message_read', messageId);
  }, [isConnected]);

  // Event listeners helper
  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      console.log(`👂 [Socket] Registering listener for: ${event}`);
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      console.log(`👂 [Socket] Removing listener for: ${event}`);
      socketRef.current.off(event, callback);
    }
  }, []);

  // Initialize connection on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Reconnect when token changes (e.g., user logs in/out)
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    
    if (token && !isConnected && !socketRef.current) {
      connect();
    } else if (!token && isConnected) {
      disconnect();
    }
  }, [connect, disconnect, isConnected]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    reconnectAttempts,
    
    // Connection methods
    connect,
    disconnect,
    
    // Room methods
    joinConversation,
    leaveConversation,
    
    // Message methods
    sendMessage,
    sendTyping,
    markMessageAsRead,
    
    // Event listeners
    on,
    off,
  };
};