// IncomingCallModal.jsx - Modal for incoming calls
import PropTypes from 'prop-types';
import styles from './IncomingCallModal.module.scss';

const API_URL = import.meta.env.VITE_API_URL;

const IncomingCallModal = ({
  isOpen,
  caller,
  callType,
  onAccept,
  onDecline
}) => {
  if (!isOpen) return null;

  const callerAvatar = caller?.avatar 
    ? (caller.avatar.startsWith('http') ? caller.avatar : `${API_URL}${caller.avatar}`)
    : `${API_URL}/uploads/avatar/default.png`;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.incomingCallModal}>
        {/* Caller Info */}
        <div className={styles.callerInfo}>
          <div className={styles.callerAvatar}>
            <img 
              src={callerAvatar} 
              alt={caller?.name || 'Unknown'}
              onError={(e) => {
                e.target.src = `${API_URL}/uploads/avatar/default.png`;
              }}
            />
            <div className={styles.pulseRing}></div>
          </div>
          
          <div className={styles.callerDetails}>
            <h3>{caller?.name || 'Unknown'}</h3>
            <p>
              Cuộc gọi {callType === 'video' ? 'video' : 'thoại'} đến
            </p>
          </div>
        </div>

        {/* Call Actions */}
        <div className={styles.callActions}>
          <button 
            className={`${styles.actionButton} ${styles.declineButton}`}
            onClick={onDecline}
            aria-label="Từ chối cuộc gọi"
          >
            <span className={styles.icon}>📞</span>
          </button>
          
          <button 
            className={`${styles.actionButton} ${styles.acceptButton}`}
            onClick={onAccept}
            aria-label="Chấp nhận cuộc gọi"
          >
            <span className={styles.icon}>📞</span>
          </button>
        </div>
      </div>
    </div>
  );
};

IncomingCallModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  caller: PropTypes.object,
  callType: PropTypes.oneOf(['video', 'audio']).isRequired,
  onAccept: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
};

export default IncomingCallModal;