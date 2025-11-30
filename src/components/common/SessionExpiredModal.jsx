import PropTypes from 'prop-types';
import styles from './SessionExpiredModal.module.scss';

const SessionExpiredModal = ({ isOpen, onConfirm }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Không cho phép đóng modal bằng cách click backdrop
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.sessionExpiredModal} onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div className={styles.iconContainer}>
          <div className={styles.warningIcon}>
            ⚠️
          </div>
        </div>

        {/* Content */}
        <div className={styles.modalContent}>
          <h2 className={styles.title}>Phiên đăng nhập đã hết hạn</h2>
          
          <div className={styles.message}>
            <p>
              Để đảm bảo tính bảo mật, phiên đăng nhập của bạn đã hết hạn.
            </p>
            <p>
              Vui lòng đăng nhập lại để tiếp tục sử dụng Space Zone.
            </p>
          </div>

          {/* Security Info */}
          <div className={styles.securityInfo}>
            <div className={styles.securityItem}>
              <span className={styles.securityIcon}>🔒</span>
              <span>Dữ liệu của bạn được bảo vệ an toàn</span>
            </div>
            <div className={styles.securityItem}>
              <span className={styles.securityIcon}>⚡</span>
              <span>Quá trình đăng nhập nhanh chóng</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.modalActions}>
          <button 
            className={styles.confirmButton}
            onClick={handleConfirm}
            autoFocus
          >
            <span className={styles.buttonIcon}>🚪</span>
            Đăng nhập lại
          </button>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <span>Space Zone - Mạng xã hội an toàn</span>
        </div>
      </div>
    </div>
  );
};

SessionExpiredModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default SessionExpiredModal;