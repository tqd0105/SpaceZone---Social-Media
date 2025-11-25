import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './FriendsList.module.scss';
import { getFriends, removeFriend } from '../../services/friendService';
import SimpleSearchBar from '../common/SimpleSearchBar';

const FriendsList = ({ 
  onFriendSelect = () => {},
  showRemoveButton = true,
  searchable = true,
  limit = 20 
}) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  console.log('👥 FriendsList rendered');

  // Load friends
  const loadFriends = useCallback(async (newPage = 1, search = searchTerm, reset = false) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`📥 Loading friends - page: ${newPage}, search: "${search}"`);

      const response = await getFriends({
        page: newPage,
        limit,
        search: search.trim()
      });

      const newFriends = response.data.friends || [];
      const pagination = response.data.pagination || {};

      if (reset || newPage === 1) {
        setFriends(newFriends);
      } else {
        setFriends(prev => [...prev, ...newFriends]);
      }

      setPage(newPage);
      setHasMore(newPage < pagination.totalPages);

      console.log(`✅ Loaded ${newFriends.length} friends (page ${newPage})`);

    } catch (error) {
      console.error('❌ Error loading friends:', error);
      setError(error.error || 'Không thể tải danh sách bạn bè');
    } finally {
      setLoading(false);
    }
  }, [limit, searchTerm]);

  // Initial load
  useEffect(() => {
    loadFriends(1, '', true);
  }, [loadFriends]);

  // Handle search
  const handleSearch = (term) => {
    console.log(`🔍 Searching friends: "${term}"`);
    setSearchTerm(term);
    loadFriends(1, term, true);
  };

  // Load more friends
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadFriends(page + 1, searchTerm, false);
    }
  };

  // Remove friend
  const handleRemoveFriend = async (friendId, friendUsername) => {
    if (removingId || !window.confirm(`Bạn có chắc muốn xóa ${friendUsername} khỏi danh sách bạn bè?`)) {
      return;
    }

    try {
      setRemovingId(friendId);
      console.log(`💔 Removing friend: ${friendId}`);

      await removeFriend(friendId);

      // Remove from local state
      setFriends(prev => prev.filter(friend => friend._id !== friendId));
      
      console.log(`✅ Friend removed: ${friendUsername}`);

    } catch (error) {
      console.error('❌ Error removing friend:', error);
      alert('Không thể xóa bạn bè. Vui lòng thử lại!');
    } finally {
      setRemovingId(null);
    }
  };

  // Handle friend click
  const handleFriendClick = (friend) => {
    console.log(`👤 Friend selected:`, friend);
    onFriendSelect(friend);
  };

  if (error) {
    return (
      <div className="friends-list friends-list--error">
        <div className="friends-list__error">
          <p>❌ {error}</p>
          <button 
            className="friends-list__retry"
            onClick={() => loadFriends(1, '', true)}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="friends-list">
      {searchable && (
        <div className="friends-list__search">
          <SimpleSearchBar
            placeholder="Tìm kiếm bạn bè..."
            onSearch={handleSearch}
            value={searchTerm}
            debounceMs={500}
          />
        </div>
      )}

      <div className="friends-list__header">
        <h3>Danh sách bạn bè ({friends.length})</h3>
      </div>

      {loading && friends.length === 0 ? (
        <div className="friends-list__loading">
          <div className="friends-list__spinner"></div>
          <p>Đang tải...</p>
        </div>
      ) : (
        <>
          {friends.length === 0 ? (
            <div className="friends-list__empty">
              <p>
                {searchTerm ? 
                  `Không tìm thấy bạn bè nào với từ khóa "${searchTerm}"` :
                  'Bạn chưa có bạn bè nào'
                }
              </p>
            </div>
          ) : (
            <div className="friends-list__grid">
              {friends.map(friend => (
                <div
                  key={friend._id}
                  className="friends-list__card"
                  onClick={() => handleFriendClick(friend)}
                >
                  <div className="friends-list__avatar">
                    <img 
                      src={friend.profilePicture || '/images/default-avatar.png'}
                      alt={friend.username}
                      onError={(e) => {
                        e.target.src = '/images/default-avatar.png';
                      }}
                    />
                  </div>
                  
                  <div className="friends-list__info">
                    <h4 className="friends-list__name">
                      {friend.username}
                    </h4>
                    {friend.fullName && (
                      <p className="friends-list__full-name">
                        {friend.fullName}
                      </p>
                    )}
                  </div>

                  {showRemoveButton && (
                    <div className="friends-list__actions">
                      <button
                        className="friends-list__remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFriend(friend._id, friend.username);
                        }}
                        disabled={removingId === friend._id}
                        title={`Xóa ${friend.username}`}
                      >
                        {removingId === friend._id ? '...' : '✗'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && friends.length > 0 && (
            <div className="friends-list__load-more">
              <button
                className="friends-list__load-btn"
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
  );
};

FriendsList.propTypes = {
  onFriendSelect: PropTypes.func,
  showRemoveButton: PropTypes.bool,
  searchable: PropTypes.bool,
  limit: PropTypes.number
};

export default FriendsList;