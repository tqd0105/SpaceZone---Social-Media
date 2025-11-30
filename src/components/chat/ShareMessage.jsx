import PropTypes from 'prop-types';
import styles from './ShareMessage.module.scss';

const ShareMessage = ({ sharedPost, onOpenPost }) => {
  if (!sharedPost) {
    return null;
  }

  const handleClick = () => {
    // Navigate to post URL directly
    if (sharedPost.url) {
      window.location.href = sharedPost.url;
    } else if (sharedPost.id) {
      window.location.href = `/post/${sharedPost.id}`;
    }
  };

  return (
    <div className={styles.shareMessage} onClick={handleClick}>
      <div className={styles.shareHeader}>
        <span className={styles.shareIcon}>🔗</span>
        <span className={styles.shareLabel}>Bài viết được chia sẻ</span>
      </div>
      
      <div className={styles.shareContent}>
        {sharedPost.title && (
          <h4 className={styles.shareTitle}>{sharedPost.title}</h4>
        )}
        
        {sharedPost.content && (
          <p className={styles.shareDescription}>
            {sharedPost.content.length > 100 
              ? `${sharedPost.content.substring(0, 100)}...` 
              : sharedPost.content
            }
          </p>
        )}
        
        {sharedPost.author && (
          <div className={styles.shareAuthor}>
            <span>Tác giả: {sharedPost.author}</span>
          </div>
        )}
        
        {sharedPost.image && (
          <div className={styles.shareImage}>
            <img 
              src={`${import.meta.env.VITE_API_URL}${sharedPost.image}`} 
              alt="Post image" 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      
      <div className={styles.shareFooter}>
        <span className={styles.clickToView}>Nhấn để xem bài viết</span>
      </div>
    </div>
  );
};

ShareMessage.propTypes = {
  sharedPost: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
    author: PropTypes.string,
    url: PropTypes.string,
    image: PropTypes.string,
  }),
  onOpenPost: PropTypes.func,
};

export default ShareMessage;