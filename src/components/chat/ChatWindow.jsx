import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { useChat } from '../../hooks/useChat';
import { useChatSocket } from '../../hooks/useChatSocket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ConversationList from './ConversationList';
import ChatBubble from '../../assets/icons/main/chat-bubble.png';

const API_URL = import.meta.env.VITE_API_URL;
const defaultAvatar = `${API_URL}/uploads/avatar/default.png`;

const ChatWindow = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const socket = useChatSocket();
  const { 
    conversations,
    activeConversationId,
    messages,
    loading,
    error,
    onlineUsers,
    socketConnected,
    loadConversations: loadConversationsFromProvider,
    loadMessages: loadMessagesFromProvider,
    setActiveConversation,
    sendMessage
  } = useChat();
  
  const [showConversations, setShowConversations] = useState(true);
  
  const activeConversation = conversations.find(conv => conv._id === activeConversationId);

  

  // Ensure socket connection when chat opens
  useEffect(() => {
    if (isOpen && user && !socket.isConnected) {
      socket.connect().catch(err => {
        console.error('[ChatWindow] Failed to connect socket:', err);
      });
    }
  }, [isOpen, user, socket]);

  // Load conversations on mount
  useEffect(() => {
    if (isOpen && user) {
      loadConversationsFromProvider();
    }
  }, [isOpen, user, loadConversationsFromProvider]);

  // Handle conversation selection
  const handleConversationSelect = (conversation) => {
    setActiveConversation(conversation._id);
    loadMessagesFromProvider(conversation._id);
    setShowConversations(false);
    
    // Ensure socket joins the room
    if (socket && socket.isConnected) {
      setTimeout(() => {
        socket.joinConversation(conversation._id);
      }, 200);
    }
  };

  // Handle new conversation created
  const handleCreateConversation = (newConversation) => {
    
    // Reload conversations to ensure the new one is in the list
    loadConversationsFromProvider();
    
    // Select the new conversation immediately
    setActiveConversation(newConversation._id);
    loadMessagesFromProvider(newConversation._id);
    setShowConversations(false);
  };

  // Send message
  const handleSendMessage = async (content, type = 'text') => {
    if (!activeConversation || !content.trim()) return;

    try {
      await sendMessage(activeConversation._id, content.trim(), type);
    } catch (err) {
      console.error('[ChatWindow] Error sending message:', err);
    }
  };

  // Handle back to conversations list
  const handleBackToConversations = () => {
    setShowConversations(true);
  };

  // Handle clear all messages
  const handleClearAllMessages = async () => {
    if (!activeConversation) return;
    
    const confirmDelete = window.confirm(
      '🗑️ Bạn có chắc chắn muốn xóa tất cả tin nhắn trong cuộc trò chuyện này?\n\n⚠️ Hành động này không thể hoàn tác!'
    );
    
    if (!confirmDelete) return;
    
    try {
      console.log('Clearing all messages for conversation:', activeConversationId);
      
      // Call API to clear messages
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/chat/conversations/${activeConversationId}/messages`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể xóa tin nhắn');
      }
      
      const result = await response.json();
      console.log('✅ Messages cleared successfully:', result);
      
      // Reload messages to reflect the cleared state
      loadMessagesFromProvider(activeConversationId);
      
      // Also reload conversations to update lastMessage
      loadConversationsFromProvider();
      
    } catch (error) {
      console.error('[ChatWindow] Error clearing messages:', error);
      alert(`Có lỗi xảy ra khi xóa tin nhắn: ${error.message}`);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-16 z-50 flex flex-col">
      <div className="w-96 h-96 bg-white dark:bg-gray-900 rounded-t-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white text-black border-b-2 border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {activeConversation && !showConversations ? (
              <>
                <button 
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200"
                  onClick={handleBackToConversations}
                >
                  <span className="text-sm">←</span>
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                    {(() => {
                      const otherUser = activeConversation.participants?.find(p => p._id !== (user?._id || user?.id));
                      const avatarUrl = otherUser?.avatar 
                        ? (otherUser.avatar.startsWith('http') 
                            ? otherUser.avatar 
                            : `${API_URL}${otherUser.avatar}`)
                        : defaultAvatar;
                      
                      return (
                        <img 
                          src={avatarUrl}
                          alt={otherUser?.name || 'User Avatar'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = defaultAvatar;
                          }}
                        />
                      );
                    })()} 
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm truncate max-w-32">
                      {activeConversation.participants?.find(p => p._id !== (user?._id || user?.id))?.name || 'Unknown'}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {socket.isConnected ? (
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      ) : (
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
                      )}
                      <span className="text-xs opacity-75">
                        {socket.isConnected ? 'Online' : 'Connecting...'}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Clear messages button */}
                {messages[activeConversationId]?.length > 0 && (
                  <button
                    onClick={handleClearAllMessages}
                    className="p-1 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-full transition-colors duration-200 ml-2"
                    title="Xóa tất cả tin nhắn"
                  >
                    <span className="text-sm">🗑️</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <img src={ChatBubble} alt="Chat Bubble" />
                </div>
                <h3 className="font-semibold text-sm uppercase">Messages</h3>
              </>
            )}
          </div>
          
          <button 
            className="px-3 py-1 hover:bg-white bg-gray-300 text-black hover:bg-opacity-20 rounded-full transition-colors duration-200"
            onClick={onClose}
          >
            <span className="text-lg font-bold">×</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Connection Status */}
          {!socket.isConnected && (
            <div className="bg-yellow-50 dark:bg-yellow-900 border-b border-yellow-200 dark:border-yellow-700 px-3 py-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm animate-pulse">📶</span>
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  Đang kết nối...
                </p>
                {socket.error && (
                  <button 
                    onClick={() => socket.connect()}
                    className="ml-auto px-2 py-1 bg-yellow-200 dark:bg-yellow-800 hover:bg-yellow-300 dark:hover:bg-yellow-700 rounded text-xs transition-colors duration-200"
                  >
                    <span className="text-xs">🔄</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900 border-b border-red-200 dark:border-red-700 px-3 py-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm">❌</span>
                <p className="text-xs text-red-800 dark:text-red-200 truncate">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-xs">Đang tải...</span>
              </div>
            </div>
          )}

          {/* Chat Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {showConversations || !activeConversation ? (
              <div className="flex-1 overflow-hidden">
                <ConversationList
                  conversations={conversations}
                  activeConversation={activeConversation}
                  onSelectConversation={handleConversationSelect}
                  onCreateConversation={handleCreateConversation}
                  onlineUsers={onlineUsers || new Set()}
                  loading={loading}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-800">
                {/* Messages */}
                <div className="flex-1 overflow-hidden">
                  <MessageList
                    messages={messages[activeConversationId] || []}
                    currentUserId={user?._id || user?.id}
                    loading={loading}
                    typingUsers={new Set()} // TODO: Implement typing indicators
                    onlineUsers={onlineUsers || new Map()}
                  />
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    conversationId={activeConversationId}
                    socket={socket.socket}
                    disabled={!socket.isConnected}
                    recipient={activeConversation?.participants?.find(p => p._id !== (user?._id || user?.id))}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;