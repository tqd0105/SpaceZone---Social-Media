import { useState, memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import './AddFriendButton.module.scss';
import { sendFriendRequest, getFriends, getFriendRequests } from '../../services/friendService';

const AddFriendButton = ({ 
  userId, 
  username, 
  onRequestSent = () => {},
  disabled = false,
  size = 'medium', // small, medium, large
  initialStatus = 'none', // none, pending, friends
  refreshTrigger = 0 // Increment this to force refresh
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState(initialStatus);

  // Load friendship status on mount
  useEffect(() => {
    const checkFriendshipStatus = async () => {
      if (initialStatus !== 'none' && refreshTrigger === 0) {
        setFriendshipStatus(initialStatus);
        return;
      }

      try {
        
        // Check if already friends
        const friendsResponse = await getFriends();
        const isFriend = friendsResponse.data?.friends?.some(friend => friend._id === userId);
        
        if (isFriend) {
          setFriendshipStatus('friends');
          return;
        }
        
        // Check if request is pending
        const requestsResponse = await getFriendRequests({ type: 'sent' });
        const hasPendingRequest = requestsResponse.data?.requests?.some(request => request.receiver?._id === userId);
        
        if (hasPendingRequest) {
          setFriendshipStatus('pending');
        } else {
          setFriendshipStatus('none');
        }
      } catch (error) {
        console.error('❌ Error checking friendship status:', error);
        // Set to none on error to allow retry
        setFriendshipStatus('none');
      }
    };

    checkFriendshipStatus();
  }, [userId, initialStatus, refreshTrigger]);

  const handleSendRequest = async () => {
    if (isLoading || friendshipStatus !== 'none' || disabled) return;

    try {
      setIsLoading(true);

      const response = await sendFriendRequest(userId);
      
      // Update status based on response
      if (response.success) {
        setFriendshipStatus('pending');
        onRequestSent(userId, username);
      }

    } catch (error) {
      console.error('❌ Error sending friend request:', error);
      
      // Handle specific error cases
      if (error.error) {
        const errorMessage = error.error.toLowerCase();
        
        // Handle duplicate key error or existing relationship
        if (errorMessage.includes('duplicate key') || 
            errorMessage.includes('e11000') ||
            errorMessage.includes('existing relationship') ||
            errorMessage.includes('rejected')) {
          
          // If relationship was rejected, allow retry by keeping status as 'none'
          if (errorMessage.includes('rejected')) {
            console.log('🔄 Previous request was rejected, allowing new attempt');
            setFriendshipStatus('none');
            return;
          }
          
          // For other duplicate cases, re-check status
          setTimeout(async () => {
            try {
              const friendsResponse = await getFriends();
              const isFriend = friendsResponse.data?.friends?.some(friend => friend._id === userId);
              
              if (isFriend) {
                setFriendshipStatus('friends');
              } else {
                const requestsResponse = await getFriendRequests({ type: 'sent' });
                const hasPendingRequest = requestsResponse.data?.requests?.some(request => request.receiver?._id === userId);
                
                setFriendshipStatus(hasPendingRequest ? 'pending' : 'none');
              }
            } catch (recheckError) {
              console.error('❌ Error rechecking status:', recheckError);
              setFriendshipStatus('none');
            }
          }, 1000);
        }
        
        // Handle already sent or already friends cases
        else if (errorMessage.includes('already sent') || errorMessage.includes('already friends')) {
          setTimeout(async () => {
            try {
              const friendsResponse = await getFriends();
              const isFriend = friendsResponse.data?.friends?.some(friend => friend._id === userId);
              
              if (isFriend) {
                setFriendshipStatus('friends');
              } else {
                const requestsResponse = await getFriendRequests({ type: 'sent' });
                const hasPendingRequest = requestsResponse.data?.requests?.some(request => request.receiver?._id === userId);
                
                if (hasPendingRequest) {
                  setFriendshipStatus('pending');
                }
              }
            } catch (recheckError) {
              console.error('❌ Error rechecking status:', recheckError);
            }
          }, 1000);
        }
        
        // Handle other errors
        else {
          console.error('❌ Unhandled friend request error:', error);
          alert('Có lỗi xảy ra khi gửi lời mời kết bạn. Vui lòng thử lại.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (friendshipStatus === 'friends') return 'Bạn bè';
    if (friendshipStatus === 'pending') return 'Đã gửi yêu cầu';
    if (isLoading) return 'Đang gửi...';
    return 'Kết bạn';
  };

  const getButtonClass = () => {
    let baseClass = 'add-friend-btn';
    
    if (size === 'small') baseClass += ' add-friend-btn--small';
    if (size === 'large') baseClass += ' add-friend-btn--large';
    
    if (friendshipStatus === 'friends') baseClass += ' add-friend-btn--friends';
    if (friendshipStatus === 'pending') baseClass += ' add-friend-btn--pending';
    if (isLoading) baseClass += ' add-friend-btn--loading';
    if (disabled) baseClass += ' add-friend-btn--disabled';
    
    return baseClass;
  };

  const getIcon = () => {
    if (friendshipStatus === 'friends') return '🧑‍🤝‍🧑';
    if (friendshipStatus === 'pending') return '⏳';
    if (isLoading) return '⏳';
    return '+';
  };

  const getTitle = () => {
    if (friendshipStatus === 'friends') return `Đã là bạn bè với ${username}`;
    if (friendshipStatus === 'pending') return `Đã gửi lời mời kết bạn cho ${username}`;
    return `Gửi lời mời kết bạn cho ${username}`;
  };

  return (
    <button
      // className={getButtonClass()}
      className="bg-blue-600 text-white hover:bg-blue-500"
      onClick={handleSendRequest}
      disabled={disabled || isLoading || friendshipStatus !== 'none'}
      title={getTitle()}
    >
      <span className="add-friend-btn__icon">
        {getIcon()}
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
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  initialStatus: PropTypes.oneOf(['none', 'pending', 'friends']),
  refreshTrigger: PropTypes.number
};

export default memo(AddFriendButton);