import { useState, useRef, useEffect, useCallback } from 'react';
import { useCallContext } from '../../context/CallContext';
import styles from './MessageInput.module.scss';
import Send from '../../assets/icons/main/send.png';

const MessageInput = ({ 
  onSendMessage, 
  conversationId, 
  socket, 
  disabled = false,
  recipient // Add recipient prop for calls
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Call hook
  const callHookState = useCallContext();
  const { startCall } = callHookState;


  // Handle video call
  const handleVideoCall = useCallback(async () => {
    
    if (!recipient) {
      console.error('[MessageInput] No recipient provided for call');
      alert('Không tìm thấy người nhận cuộc gọi');
      return;
    }
    
    try {
      const result = await startCall(recipient._id, recipient, 'video');
    } catch (error) {
      console.error('[MessageInput] Error starting video call:', error);
      console.error('[MessageInput] Error stack:', error.stack);
    }
  }, [recipient, startCall]);

  // Handle audio call
  const handleAudioCall = useCallback(async () => {
    
    if (!recipient) {
      console.error('[MessageInput] No recipient provided for call');
      alert('Không tìm thấy người nhận cuộc gọi');
      return;
    }
    
    try {
      const result = await startCall(recipient._id, recipient, 'audio');
    } catch (error) {
      console.error('[MessageInput] Error starting audio call:', error);
      console.error('[MessageInput] Error stack:', error.stack);
    }
  }, [recipient, startCall]);

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

  const commonEmojis = ['😀', '😂', '❤️', '👍', '👏', '🎉', '💯', '🤡'];

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
        {/* Call buttons */}
        {recipient && (
          <div className={styles.callButtons}>
            <button
              type="button"
              className={styles.callButton}
              onClick={handleAudioCall}
              disabled={disabled}
              aria-label="Gọi điện thoại"
              title="Gọi điện thoại"
            >
              📞
            </button>
            {/* <button
              type="button"
              className={styles.callButton}
              onClick={handleVideoCall}
              disabled={disabled}
              aria-label="Gọi video"
              title="Gọi video"
            >
              📹
            </button> */}
          </div>
        )}
        
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
                : "Nhập tin nhắn..."
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
            <img src={Send} width={25} alt="" />
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
      {/* {isTyping && (
        <div className={styles.typingIndicator}>
          <span>Bạn đang nhập...</span>
        </div>
      )} */}
    </div>
  );
};

export default MessageInput;