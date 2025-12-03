import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import styles from './MessageList.module.scss';
import ShareMessage from './ShareMessage';
import ChatBubble from '../../assets/icons/main/chat-bubble.png';

const API_URL = import.meta.env.VITE_API_URL;
const defaultAvatar = `${API_URL}/uploads/avatar/default.png`;

const MessageList = ({ 
  messages = [], 
  currentUserId, 
  loading = false, 
  typingUsers = new Set(), 
  onlineUsers = new Map() 
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: vi 
      });
    } catch {
      return 'Vừa xong';
    }
  };

  const isMessageFromCurrentUser = (message) => {
    return message?.sender?._id === currentUserId;
  };

  const renderMessage = (message, index) => {
    // Validate message structure
    if (!message || !message.sender || !message.content) {
      console.warn('[MessageList] Invalid message:', message);
      return null;
    }

    const isOwn = isMessageFromCurrentUser(message);
    const prevMessage = index > 0 ? messages[index - 1] : null;
    
    // Check if this message is from different sender than previous
    const isFirstInGroup = !prevMessage || prevMessage.sender?._id !== message.sender._id;

    return (
      <div
        key={message._id}
        className={`${styles.messageWrapper} ${isOwn ? styles.own : styles.other}`}
      >
        {/* Avatar (only show for first message in group from others) */}
        {!isOwn && isFirstInGroup && (
          <div className={styles.messageAvatar}>
            <img 
              src={message.sender.avatar 
                ? (message.sender.avatar.startsWith('http') 
                    ? message.sender.avatar 
                    : `${API_URL}${message.sender.avatar}`)
                : defaultAvatar
              } 
              alt={message.sender.name}
              className={styles.avatar}
              onError={(e) => {
                e.target.src = defaultAvatar;
              }}
            />
          </div>
        )}
        
        
        {/* Message content */}
        <div 
          className={`${styles.messageContent} ${
            !isOwn && !isFirstInGroup ? styles.withoutAvatar : ''
          }`}
        >
          {/* Sender name (only for first message in group from others) */}
          {!isOwn && isFirstInGroup && (
            <div className={`${styles.senderName} text-gray-900 dark:text-gray-300`}>
              {message.sender.name}
              {onlineUsers?.has && onlineUsers.has(message.sender._id) && (
                <span className={`${styles.onlineIndicator} text-green-500`}>•</span>
              )}
            </div>
          )}
          
          {/* Message bubble */}
          <div className={`${styles.messageBubble} ${isOwn ? styles.ownBubble : styles.otherBubble} ${
            isOwn 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
          }`}>
            {/* Render different content based on message type */}
            {message.type === 'share' && message.sharedPost ? (
              <ShareMessage 
                sharedPost={message.sharedPost}
                onOpenPost={(postId) => {
                  // Handle opening the shared post
                  console.log('Opening shared post:', postId);
                }}
              />
            ) : (
              <div className={styles.messageText}>
                {message.content}
              </div>
            )}
            
            {/* Message status and time */}
            <div className={styles.messageFooter}>
              <span className={`${styles.messageTime} ${
                isOwn ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {formatTime(message.createdAt)}
              </span>
              
              {/* Message status indicator */}
              {isOwn && (
                <>
                  {/* Show custom status if available (optimistic updates) */}
                  {message.status && (message.status === 'sending' || message.status === 'failed') && (
                    <span className={styles.messageStatus}>
                      {message.status === 'sending' && '⏳'}
                      {message.status === 'failed' && '❌'}
                    </span>
                  )}
                  
                  {/* Show read status for normal messages (no custom status) */}
                  {(!message.status || message.status === 'sent') && (
                    <div className={styles.readStatus}>
                      {message.readBy && message.readBy.length > 0 ? (
                        <span className={styles.read}>✓✓</span>
                      ) : (
                        <span className={styles.sent}>✓</span>
                      )}
                    </div>
                  )}
                </>
              )}
              
              {/* Edited indicator */}
              {message.isEdited && (
                <span className={styles.edited}>đã chỉnh sửa</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTypingIndicator = () => {
    if (!typingUsers?.size || typingUsers.size === 0) return null;

    const typingUsersList = Array.from(typingUsers)
      .map(userId => {
        const user = onlineUsers?.get ? onlineUsers.get(userId) : null;
        return user?.name || 'Ai đó';
      })
      .filter(Boolean);

    if (typingUsersList.length === 0) return null;

    return (
      <div className={`${styles.typingIndicator} animate-pulse`}>
        <div className={styles.typingAvatar}>
          <div className={`${styles.typingDots} bg-gray-600 dark:bg-gray-400`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div className={`${styles.typingText} text-gray-600 dark:text-gray-400`}>
          <span>
            {typingUsersList.length === 1 
              ? `${typingUsersList[0]} đang nhập...`
              : `${typingUsersList.slice(0, 2).join(', ')}${
                  typingUsersList.length > 2 ? ` và ${typingUsersList.length - 2} người khác` : ''
                } đang nhập...`
            }
          </span>
        </div>
      </div>
    );
  };

  if (loading && messages.length === 0) {
    return (
      <div className={`${styles.messageList} bg-white dark:bg-gray-800`}>
        <div className={`${styles.loadingState} text-gray-600 dark:text-gray-400`}>
          <div className={`${styles.loadingSpinner} border-gray-200 dark:border-gray-600 border-t-blue-500`}></div>
          <span>Đang tải tin nhắn...</span>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={`${styles.messageList} bg-white dark:bg-gray-800`}>
        <div className={`${styles.emptyState} text-gray-600 dark:text-gray-400`}>
          <img src={ChatBubble} width={50} alt="" className="opacity-50" />
          <h4 className="text-gray-900 dark:text-gray-100">Chưa có tin nhắn nào</h4>
          <p>Hãy bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.messageList} bg-white dark:bg-gray-800`} ref={messagesContainerRef}>
      <div className={`${styles.messagesContainer} scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent`}>
        {/* Load more button (for pagination in future) */}
        {messages.length >= 50 && (
          <div className={styles.loadMoreContainer}>
            <button className={`${styles.loadMoreButton} bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600`}>
              Tải thêm tin nhắn cũ
            </button>
          </div>
        )}

        {/* Messages */}
        {messages.map((message, index) => {
          // Skip invalid messages
          if (!message || !message._id) {
            console.warn(`[MessageList] Skipping invalid message at index ${index}:`, message);
            return null;
          }
          
          return renderMessage(message, index);
        }).filter(Boolean)}

        {/* Typing indicator */}
        {renderTypingIndicator()}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

MessageList.propTypes = {
  messages: PropTypes.array,
  currentUserId: PropTypes.string,
  loading: PropTypes.bool,
  typingUsers: PropTypes.object,
  onlineUsers: PropTypes.object
};

export default MessageList;