import { useState } from 'react';
import PropTypes from 'prop-types';
import './FriendRequestCard.module.scss';
import { acceptFriendRequest, rejectFriendRequest } from '../../services/friendService';

const FriendRequestCard = ({ 
  request, 
  onAccept = () => {}, 
  onReject = () => {},
  type = 'received' // received, sent
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [actionTaken, setActionTaken] = useState(null); // 'accepted', 'rejected'

  console.log(`📨 FriendRequestCard rendered:`, request);

  const handleAccept = async () => {
    if (isLoading || actionTaken) return;

    try {
      setIsLoading(true);
      console.log(`✅ Accepting friend request: ${request._id}`);

      await acceptFriendRequest(request._id);
      
      setActionTaken('accepted');
      onAccept(request);
      
      console.log(`✅ Friend request accepted: ${request._id}`);

    } catch (error) {
      console.error('❌ Error accepting friend request:', error);
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (isLoading || actionTaken) return;

    try {
      setIsLoading(true);
      console.log(`❌ Rejecting friend request: ${request._id}`);

      await rejectFriendRequest(request._id);
      
      setActionTaken('rejected');
      onReject(request);
      
      console.log(`✅ Friend request rejected: ${request._id}`);

    } catch (error) {
      console.error('❌ Error rejecting friend request:', error);
      setIsLoading(false);
    }
  };

  const getUserInfo = () => {
    if (type === 'received') {
      return {
        id: request.senderId?._id || request.senderId,
        username: request.senderId?.username || 'Unknown User',
        profilePicture: request.senderId?.profilePicture || '/images/default-avatar.png'
      };
    } else {
      return {
        id: request.receiverId?._id || request.receiverId,
        username: request.receiverId?.username || 'Unknown User', 
        profilePicture: request.receiverId?.profilePicture || '/images/default-avatar.png'
      };
    }
  };

  const userInfo = getUserInfo();

  const getCardClass = () => {
    let baseClass = 'friend-request-card';
    
    if (actionTaken) baseClass += ` friend-request-card--${actionTaken}`;
    if (type === 'sent') baseClass += ' friend-request-card--sent';
    
    return baseClass;
  };

  const getStatusText = () => {
    if (actionTaken === 'accepted') return 'Đã chấp nhận';
    if (actionTaken === 'rejected') return 'Đã từ chối';
    if (type === 'sent') return 'Đã gửi lời mời';
    return 'Lời mời kết bạn';
  };

  return (
    <div className={getCardClass()}>
      <div className="friend-request-card__avatar">
        <img 
          src={userInfo.profilePicture} 
          alt={userInfo.username}
          onError={(e) => {
            e.target.src = '/images/default-avatar.png';
          }}
        />
      </div>

      <div className="friend-request-card__content">
        <div className="friend-request-card__info">
          <h4 className="friend-request-card__username">
            {userInfo.username}
          </h4>
          <p className="friend-request-card__status">
            {getStatusText()}
          </p>
          {request.createdAt && (
            <p className="friend-request-card__time">
              {new Date(request.createdAt).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>

        {type === 'received' && !actionTaken && (
          <div className="friend-request-card__actions">
            <button
              className="friend-request-card__btn friend-request-card__btn--accept"
              onClick={handleAccept}
              disabled={isLoading}
            >
              {isLoading ? '...' : 'Chấp nhận'}
            </button>
            <button
              className="friend-request-card__btn friend-request-card__btn--reject"
              onClick={handleReject}
              disabled={isLoading}
            >
              {isLoading ? '...' : 'Từ chối'}
            </button>
          </div>
        )}

        {actionTaken && (
          <div className="friend-request-card__result">
            <span className={`friend-request-card__result-icon friend-request-card__result-icon--${actionTaken}`}>
              {actionTaken === 'accepted' ? '✓' : '✗'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

FriendRequestCard.propTypes = {
  request: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    senderId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        _id: PropTypes.string,
        username: PropTypes.string,
        profilePicture: PropTypes.string
      })
    ]),
    receiverId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        _id: PropTypes.string,
        username: PropTypes.string,
        profilePicture: PropTypes.string
      })
    ]),
    createdAt: PropTypes.string
  }).isRequired,
  onAccept: PropTypes.func,
  onReject: PropTypes.func,
  type: PropTypes.oneOf(['received', 'sent'])
};

export default FriendRequestCard;