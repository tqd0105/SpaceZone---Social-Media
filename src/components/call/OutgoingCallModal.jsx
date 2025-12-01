import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './OutgoingCallModal.module.scss';

const OutgoingCallModal = ({ 
  isOpen, 
  recipient, 
  callType = 'video', 
  onEndCall,
  callDuration = 0 
}) => {
  const [dots, setDots] = useState('');
  
  // Animate dots for "Đang gọi..." text
  useEffect(() => {
    if (!isOpen) return;
    
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [isOpen]);
  
  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (!isOpen) {
    return null;
  }
  const API_URL = import.meta.env.VITE_API_URL;
  const recipientAvatar = recipient?.avatar 
    ? (recipient.avatar.startsWith('http') ? recipient.avatar : `${API_URL}${recipient.avatar}`)
    : `${API_URL}/uploads/avatar/default.png`;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        {/* Recipient Avatar */}
        <div className={styles.avatarContainer}>
          <img 
            src={recipientAvatar} 
            alt={recipient?.name || 'Unknown'}
            className={styles.recipientAvatar}
            onError={(e) => {
              e.target.src = `${API_URL}/uploads/avatar/default.png`;
            }}
          />
          <div className={styles.callTypeIcon}>
            {callType === 'video' ? '📹' : '📞'}
          </div>
        </div>

        {/* Call Info */}
        <div className={styles.callInfo}>
          <h2 className={styles.recipientName}>
            {recipient?.name || 'Unknown'}
          </h2>
          <p className={styles.callStatus}>
            {callDuration > 0 ? formatDuration(callDuration) : `Đang gọi${dots}`}
          </p>
          <p className={styles.callType}>
            {callType === 'video' ? 'Cuộc gọi video' : 'Cuộc gọi thoại'}
          </p>
        </div>

        {/* Call Actions */}
        <div className={styles.actions}>
          {/* End Call Button */}
          <button 
            className={styles.endButton}
            onClick={onEndCall}
            aria-label="Kết thúc cuộc gọi"
          >
            <span className={styles.icon}>📞</span>
          </button>
        </div>

        {/* Connection Status Indicator */}
        <div className={styles.connectionStatus}>
          <div className={styles.pulseIndicator}></div>
          <span>Đang kết nối...</span>
        </div>
      </div>
    </div>
  );
};

OutgoingCallModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  recipient: PropTypes.object,
  callType: PropTypes.oneOf(['video', 'audio']),
  onEndCall: PropTypes.func.isRequired,
  callDuration: PropTypes.number
};

export default OutgoingCallModal;