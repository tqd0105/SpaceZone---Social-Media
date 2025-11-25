import { useState, useRef, useEffect } from 'react';
import styles from './MessageInput.module.scss';

const MessageInput = ({ 
  onSendMessage, 
  conversationId, 
  socket, 
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  console.log(`[MessageInput] Rendered for conversation: ${conversationId}`);

  // Focus input when conversation changes
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [conversationId, disabled]);

  // Handle typing indicators
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Clear typing timeout when component unmounts or conversation changes
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        if (isTyping) {
          socket.emit('typing:stop', { conversationId });
        }
      }
    };
  }, [socket, conversationId, isTyping]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!socket || !conversationId) return;

    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      socket.emit('typing:start', { conversationId });
      console.log(`[MessageInput] Started typing in conversation: ${conversationId}`);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket.emit('typing:stop', { conversationId });
        console.log(`[MessageInput] Stopped typing in conversation: ${conversationId}`);
      }
    }, 1000); // Stop typing after 1 second of inactivity
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage || disabled || isSending) {
      return;
    }

    try {
      setIsSending(true);
      console.log(`[MessageInput] Sending message: "${trimmedMessage.substring(0, 50)}..."`);

      // Clear typing indicator immediately
      if (isTyping && socket) {
        setIsTyping(false);
        socket.emit('typing:stop', { conversationId });
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }

      // Clear input immediately for better UX
      setMessage('');

      // Send message
      await onSendMessage(trimmedMessage);
      
      console.log('[MessageInput] Message sent successfully');

      // Focus back to input
      if (inputRef.current) {
        inputRef.current.focus();
      }

    } catch (error) {
      console.error('[MessageInput] Error sending message:', error);
      // Restore message if sending failed
      setMessage(trimmedMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const commonEmojis = ['😀', '😂', '❤️', '👍', '👏', '🎉', '🔥', '💯'];

  return (
    <div className={styles.messageInput}>
      {/* Emoji picker */}
      <div className={styles.emojiPicker}>
        {commonEmojis.map(emoji => (
          <button
            key={emoji}
            type="button"
            className={styles.emojiButton}
            onClick={() => handleEmojiClick(emoji)}
            disabled={disabled}
            aria-label={`Thêm emoji ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <textarea
            ref={inputRef}
            className={styles.textInput}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={
              disabled 
                ? "Đang kết nối lại..." 
                : "Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"
            }
            disabled={disabled || isSending}
            rows={1}
            maxLength={1000}
          />
          
          {/* Character counter */}
          {message.length > 800 && (
            <div className={styles.charCounter}>
              <span className={message.length > 950 ? styles.warning : ''}>
                {message.length}/1000
              </span>
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          type="button"
          className={`${styles.sendButton} ${
            !message.trim() || disabled || isSending ? styles.disabled : styles.active
          }`}
          onClick={handleSendMessage}
          disabled={!message.trim() || disabled || isSending}
          aria-label="Gửi tin nhắn"
        >
          {isSending ? (
            <div className={styles.sendingSpinner}></div>
          ) : (
            <svg 
              className={styles.sendIcon} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      {/* Connection status */}
      {disabled && (
        <div className={styles.statusBar}>
          <span className={styles.disconnected}>
            Mất kết nối - Đang thử kết nối lại...
          </span>
        </div>
      )}

      {/* Typing indicator for current user */}
      {isTyping && (
        <div className={styles.typingIndicator}>
          <span>Bạn đang nhập...</span>
        </div>
      )}
    </div>
  );
};

export default MessageInput;