import { useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import styles from './MessageList.module.scss';

const MessageList = ({ 
  messages, 
  currentUserId, 
  loading, 
  typingUsers, 
  onlineUsers 
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  console.log(`[MessageList] Rendering ${messages.length} messages, typing: ${typingUsers.size}`);

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
    return message.sender._id === currentUserId;
  };

  const renderMessage = (message, index) => {
    const isOwn = isMessageFromCurrentUser(message);
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
    
    // Check if this message is from different sender than previous
    const isFirstInGroup = !prevMessage || prevMessage.sender._id !== message.sender._id;
    const isLastInGroup = !nextMessage || nextMessage.sender._id !== message.sender._id;

    return (
      <div
        key={message._id}
        className={`${styles.messageWrapper} ${isOwn ? styles.own : styles.other}`}
      >
        {/* Avatar (only show for first message in group from others) */}
        {!isOwn && isFirstInGroup && (
          <div className={styles.messageAvatar}>
            <img 
              src={message.sender.avatar || '/default-avatar.png'} 
              alt={message.sender.name}
              className={styles.avatar}
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
            <div className={styles.senderName}>
              {message.sender.name}
              {onlineUsers.has(message.sender._id) && (
                <span className={styles.onlineIndicator}>•</span>
              )}
            </div>
          )}
          
          {/* Message bubble */}
          <div className={`${styles.messageBubble} ${isOwn ? styles.ownBubble : styles.otherBubble}`}>
            <div className={styles.messageText}>
              {message.content}
            </div>
            
            {/* Message status and time */}
            <div className={styles.messageFooter}>
              <span className={styles.messageTime}>
                {formatTime(message.createdAt)}
              </span>
              
              {/* Read status for own messages */}
              {isOwn && (
                <div className={styles.readStatus}>
                  {message.readBy && message.readBy.length > 0 ? (
                    <span className={styles.read}>✓✓</span>
                  ) : (
                    <span className={styles.sent}>✓</span>
                  )}
                </div>
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
    if (typingUsers.size === 0) return null;

    const typingUsersList = Array.from(typingUsers)
      .map(userId => {
        const user = onlineUsers.get(userId);
        return user?.name || 'Ai đó';
      })
      .filter(Boolean);

    if (typingUsersList.length === 0) return null;

    return (
      <div className={styles.typingIndicator}>
        <div className={styles.typingAvatar}>
          <div className={styles.typingDots}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div className={styles.typingText}>
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
      <div className={styles.messageList}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <span>Đang tải tin nhắn...</span>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={styles.messageList}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💬</div>
          <h4>Chưa có tin nhắn nào</h4>
          <p>Hãy bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.messageList} ref={messagesContainerRef}>
      <div className={styles.messagesContainer}>
        {/* Load more button (for pagination in future) */}
        {messages.length >= 50 && (
          <div className={styles.loadMoreContainer}>
            <button className={styles.loadMoreButton}>
              Tải thêm tin nhắn cũ
            </button>
          </div>
        )}

        {/* Messages */}
        {messages.map((message, index) => renderMessage(message, index))}

        {/* Typing indicator */}
        {renderTypingIndicator()}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;