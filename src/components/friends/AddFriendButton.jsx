import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import './AddFriendButton.module.scss';
import { sendFriendRequest } from '../../services/friendService';

const AddFriendButton = ({ 
  userId, 
  username, 
  onRequestSent = () => {},
  disabled = false,
  size = 'medium' // small, medium, large
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleSendRequest = async () => {
    if (isLoading || requestSent || disabled) return;
    console.log("clicked!!!")

    try {
      setIsLoading(true);

      await sendFriendRequest(userId);
      
      setRequestSent(true);
      onRequestSent(userId, username);
      
      
      // Show success message briefly
      setTimeout(() => {
        setRequestSent(false);
      }, 3000);

    } catch (error) {
      console.error('❌ Error sending friend request:', error);
      
      // Show error state briefly then reset
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (requestSent) return 'Đã gửi';
    if (isLoading) return 'Đang gửi...';
    return 'Kết bạn';
  };

  const getButtonClass = () => {
    let baseClass = 'add-friend-btn';
    
    if (size === 'small') baseClass += ' add-friend-btn--small';
    if (size === 'large') baseClass += ' add-friend-btn--large';
    
    if (requestSent) baseClass += ' add-friend-btn--sent';
    if (isLoading) baseClass += ' add-friend-btn--loading';
    if (disabled) baseClass += ' add-friend-btn--disabled';
    
    return baseClass;
  };

  return (
    <button
      className={getButtonClass()}
      onClick={handleSendRequest}
      disabled={disabled || isLoading || requestSent}
      title={`Gửi lời mời kết bạn cho ${username}`}
    >
      <span className="add-friend-btn__icon">
        {requestSent ? '✓' : '+'}
      </span>
      <span className="add-friend-btn__text">
        {getButtonText()}
      </span>
    </button>
  );
};

AddFriendButton.propTypes = {
  userId: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  onRequestSent: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

export default memo(AddFriendButton);