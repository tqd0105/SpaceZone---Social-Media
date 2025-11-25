import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { useChat } from '../../hooks/useChat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ConversationList from './ConversationList';
import styles from './ChatWindow.module.scss';

const ChatWindow = ({ isOpen, onClose }) => {
  const { user } = useAuth();
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

  console.log(`[ChatWindow] Rendered - isOpen: ${isOpen}, activeConversation: ${activeConversation?._id}`);

  // Load conversations on mount
  useEffect(() => {
    if (isOpen && user) {
      loadConversationsFromProvider();
    }
  }, [isOpen, user, loadConversationsFromProvider]);

  // Handle conversation selection
  const handleConversationSelect = (conversation) => {
    console.log(`[ChatWindow] Selecting conversation: ${conversation._id}`);
    setActiveConversation(conversation._id);
    loadMessagesFromProvider(conversation._id);
    setShowConversations(false);
  };

  // Send message
  const handleSendMessage = async (content, type = 'text') => {
    if (!activeConversation || !content.trim()) return;

    try {
      console.log(`[ChatWindow] Sending message to conversation: ${activeConversation._id}`);
      await sendMessage(activeConversation._id, content.trim(), type);
      console.log('[ChatWindow] Message sent successfully');
    } catch (err) {
      console.error('[ChatWindow] Error sending message:', err);
    }
  };

  // Handle back to conversations list
  const handleBackToConversations = () => {
    setShowConversations(true);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderContent}>
          {activeConversation && !showConversations ? (
            <>
              <button 
                className={styles.backButton}
                onClick={handleBackToConversations}
              >
                ←
              </button>
              <div className={styles.conversationInfo}>
                <h3>{activeConversation.participants?.find(p => p._id !== user?.id)?.name || 'Unknown'}</h3>
                <span className={styles.status}>
                  {socketConnected ? 'Đang hoạt động' : 'Không hoạt động'}
                </span>
              </div>
            </>
          ) : (
            <h3>Chat</h3>
          )}
          
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      <div className={styles.chatBody}>
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className={styles.loading}>
            <p>Đang tải...</p>
          </div>
        )}

        {showConversations || !activeConversation ? (
          <ConversationList
            conversations={conversations}
            onSelectConversation={handleConversationSelect}
            onlineUsers={onlineUsers || new Set()}
            loading={loading}
          />
        ) : (
          <div className={styles.conversationView}>
            {/* Messages */}
            <MessageList
              messages={messages[activeConversationId] || []}
              currentUserId={user?.id}
              loading={loading}
            />

            {/* Message Input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              conversationId={activeConversation._id}
              disabled={!socketConnected}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;