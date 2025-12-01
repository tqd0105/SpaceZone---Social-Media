// useChatSocket.js - Custom hook for Socket.IO chat functionality
import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

// Fix: Remove /api from URL for Socket.IO connection
const getSocketURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return apiUrl.replace('/api', ''); // Remove /api suffix if present
};

const SOCKET_URL = getSocketURL();

// Singleton socket instance to prevent multiple connections
let globalSocket = null;
let connectionPromise = null;

export const useChatSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const mountedRef = useRef(true);

  // Connection management
  const connect = useCallback(() => {
    if (connectionPromise) {
      return connectionPromise;
    }
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('⚠️ [Socket] No token found, cannot connect');
      setError('Authentication token not found');
      return Promise.reject(new Error('No token'));
    }

    // If socket exists and is connected, reuse it
    if (globalSocket && globalSocket.connected) {
      console.log('🔌 [Socket] Reusing existing connection');
      setIsConnected(true);
      setError(null);
      return Promise.resolve(globalSocket);
    }

    // Disconnect existing socket if any
    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
    }

    connectionPromise = new Promise((resolve, reject) => {
      try {
        globalSocket = io(SOCKET_URL, {
          auth: {
            token: token.replace('Bearer ', ''), // Remove Bearer prefix if exists
          },
          transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
          timeout: 20000,
          forceNew: false, // Don't force new connection
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          autoConnect: true,
        });

        // Connection events
        globalSocket.on('connect', () => {
          if (mountedRef.current) {
            setIsConnected(true);
            setError(null);
            setReconnectAttempts(0);
          }
          connectionPromise = null;
          resolve(globalSocket);
        });

        globalSocket.on('disconnect', (reason) => {
          console.warn('🔌 [Socket] Disconnected:', reason);
          if (mountedRef.current) {
            setIsConnected(false);
          }
          
          if (reason === 'io server disconnect') {
            // Server disconnected, need to reconnect manually
            setTimeout(() => {
              if (globalSocket && mountedRef.current) {
                globalSocket.connect();
              }
            }, 1000);
          }
        });

        globalSocket.on('connect_error', (err) => {
          console.error('❌ [Socket] Connection error:', err.message);
          if (mountedRef.current) {
            setError(err.message);
            setIsConnected(false);
          }
          connectionPromise = null;
          reject(err);
        });

        globalSocket.on('reconnect', (attemptNumber) => {
          console.log(`🔄 [Socket] Reconnected after ${attemptNumber} attempts`);
          if (mountedRef.current) {
            setIsConnected(true);
            setError(null);
            setReconnectAttempts(attemptNumber);
          }
        });

        globalSocket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`🔄 [Socket] Reconnect attempt ${attemptNumber}`);
          if (mountedRef.current) {
            setReconnectAttempts(attemptNumber);
          }
        });

        globalSocket.on('reconnect_failed', () => {
          console.error('❌ [Socket] Reconnection failed');
          if (mountedRef.current) {
            setError('Failed to reconnect to server');
          }
          connectionPromise = null;
        });

        // Handle authentication errors
        globalSocket.on('error', (err) => {
          console.error('❌ [Socket] Socket error:', err);
          if (err.message?.includes('Authentication')) {
            if (mountedRef.current) {
              setError('Authentication failed - please refresh page');
            }
          }
        });

      } catch (err) {
        console.error('❌ [Socket] Failed to initialize:', err);
        if (mountedRef.current) {
          setError('Failed to initialize socket connection');
        }
        connectionPromise = null;
        reject(err);
      }
    });

    return connectionPromise;
  }, []);

  // Disconnect function
  const disconnect = useCallback(() => {
    console.log('🔌 [Socket] Disconnecting...');
    if (globalSocket) {
      globalSocket.disconnect();
    }
    // Don't set globalSocket to null here - let other instances decide
    if (mountedRef.current) {
      setIsConnected(false);
      setError(null);
    }
  }, []);

  // Join conversation room
  const joinConversation = useCallback((conversationId) => {
    if (!globalSocket || !globalSocket.connected) {
      console.warn('⚠️ [Socket] Cannot join room - not connected');
      return;
    }
    
    globalSocket.emit('conversation:join', { conversationId });
  }, [isConnected]);

  // Leave conversation room
  const leaveConversation = useCallback((conversationId) => {
    if (!globalSocket || !globalSocket.connected) {
      console.warn('⚠️ [Socket] Cannot leave room - not connected');
      return;
    }
    
    globalSocket.emit('conversation:leave', { conversationId });
  }, [isConnected]);

  // Send message via Socket.IO
  const sendMessage = useCallback((conversationId, content, type = 'text') => {
    if (!globalSocket || !globalSocket.connected) {
      console.warn('⚠️ [Socket] Cannot send message - not connected');
      return Promise.reject(new Error('Socket not connected'));
    }

    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Message send timeout'));
      }, 10000);

      globalSocket.emit('message:send', {
        conversationId,
        content,
        type,
      }, (response) => {
        clearTimeout(timeout);
        
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }, [isConnected]);

  // Send typing indicator
  const sendTyping = useCallback((conversationId, isTyping) => {
    if (!globalSocket || !globalSocket.connected) {
      return;
    }

    const eventName = isTyping ? 'typing:start' : 'typing:stop';
    globalSocket.emit(eventName, { conversationId });
  }, [isConnected]);

  // Mark message as read
  const markMessageAsRead = useCallback((messageId) => {
    if (!globalSocket || !globalSocket.connected) {
      return;
    }

    globalSocket.emit('message:read', { messageId });
  }, [isConnected]);

  // Event listeners helper
  const on = useCallback((event, callback) => {
    if (globalSocket) {
      globalSocket.on(event, callback);
    }
  }, []);

  const off = useCallback((event, callback) => {
    if (globalSocket) {
      globalSocket.off(event, callback);
    }
  }, []);

  // Initialize connection on mount and check existing state
  useEffect(() => {
    mountedRef.current = true;
    
    // Check if globalSocket already exists and connected
    if (globalSocket && globalSocket.connected) {
      setIsConnected(true);
      setError(null);
    } else {
      // Connect if no existing connection
      connect().catch(err => {
        console.error('Failed to connect:', err);
      });
    }

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      // Don't disconnect globalSocket here as other instances may be using it
    };
  }, [connect]);

  // Monitor globalSocket state changes
  useEffect(() => {
    if (!globalSocket) return;

    const checkConnection = () => {
      if (mountedRef.current) {
        setIsConnected(globalSocket.connected);
      }
    };

    // Check connection status periodically
    const interval = setInterval(checkConnection, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    socket: globalSocket,
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