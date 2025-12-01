import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './FriendRequests.module.scss';
import { getFriendRequests } from '../../services/friendService';
import FriendRequestCard from './FriendRequestCard';

const FriendRequests = ({ 
  initialType = 'received', // received, sent, both
  onRequestUpdate = () => {}
}) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialType);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);


  // Load friend requests
  const loadRequests = useCallback(async (type = activeTab, newPage = 1, reset = false) => {
    try {
      setLoading(true);
      setError(null);


      const response = await getFriendRequests({
        type,
        page: newPage,
        limit: 20
      });

      const newRequests = response.data.requests || [];

      if (reset || newPage === 1) {
        setRequests(newRequests);
      } else {
        setRequests(prev => [...prev, ...newRequests]);
      }

      setPage(newPage);
      setHasMore(newRequests.length === 20); // Assume more if we got full page


    } catch (error) {
      console.error('❌ Error loading friend requests:', error);
      setError(error.error || 'Không thể tải lời mời kết bạn');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Initial load
  useEffect(() => {
    loadRequests(activeTab, 1, true);
  }, [activeTab, loadRequests]);

  // Handle tab change
  const handleTabChange = (type) => {
    setActiveTab(type);
    setPage(1);
    setHasMore(true);
  };

  // Handle request accepted
  const handleRequestAccepted = (request) => {
    
    // Remove from requests list since it's now accepted
    setRequests(prev => prev.filter(req => req._id !== request._id));
    
    // Notify parent component
    onRequestUpdate('accepted', request);
  };

  // Handle request rejected
  const handleRequestRejected = (request) => {
    
    // Remove from requests list since it's now rejected
    setRequests(prev => prev.filter(req => req._id !== request._id));
    
    // Notify parent component
    onRequestUpdate('rejected', request);
  };

  // Load more requests
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadRequests(activeTab, page + 1, false);
    }
  };

  // Filter requests by type for display
  const getFilteredRequests = () => {
    if (activeTab === 'both') {
      return requests;
    }
    return requests.filter(req => 
      req.type === activeTab || 
      (activeTab === 'received' && !req.type) // fallback for old data
    );
  };

  const filteredRequests = getFilteredRequests();

  if (error) {
    return (
      <div className="friend-requests friend-requests--error">
        <div className="friend-requests__error">
          <p>❌ {error}</p>
          <button 
            className="friend-requests__retry"
            onClick={() => loadRequests(activeTab, 1, true)}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="friend-requests">
      <div className="friend-requests__header">
        <h3>Lời mời kết bạn</h3>
        
        <div className="friend-requests__tabs">
          <button
            className={`friend-requests__tab ${activeTab === 'received' ? 'friend-requests__tab--active' : ''}`}
            onClick={() => handleTabChange('received')}
          >
            Đã nhận ({requests.filter(r => r.type === 'received' || !r.type).length})
          </button>
          <button
            className={`friend-requests__tab ${activeTab === 'sent' ? 'friend-requests__tab--active' : ''}`}
            onClick={() => handleTabChange('sent')}
          >
            Đã gửi ({requests.filter(r => r.type === 'sent').length})
          </button>
          <button
            className={`friend-requests__tab ${activeTab === 'both' ? 'friend-requests__tab--active' : ''}`}
            onClick={() => handleTabChange('both')}
          >
            Tất cả ({requests.length})
          </button>
        </div>
      </div>

      <div className="friend-requests__content">
        {loading && filteredRequests.length === 0 ? (
          <div className="friend-requests__loading">
            <div className="friend-requests__spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : (
          <>
            {filteredRequests.length === 0 ? (
              <div className="friend-requests__empty">
                <p>
                  {activeTab === 'received' && 'Không có lời mời nào'}
                  {activeTab === 'sent' && 'Bạn chưa gửi lời mời nào'}
                  {activeTab === 'both' && 'Không có lời mời kết bạn nào'}
                </p>
              </div>
            ) : (
              <div className="friend-requests__list">
                {filteredRequests.map(request => (
                  <FriendRequestCard
                    key={request._id}
                    request={request}
                    type={request.type || (activeTab === 'sent' ? 'sent' : 'received')}
                    onAccept={handleRequestAccepted}
                    onReject={handleRequestRejected}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && filteredRequests.length > 0 && (
              <div className="friend-requests__load-more">
                <button
                  className="friend-requests__load-btn"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Đang tải...' : 'Xem thêm'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

FriendRequests.propTypes = {
  initialType: PropTypes.oneOf(['received', 'sent', 'both']),
  onRequestUpdate: PropTypes.func
};

export default FriendRequests;