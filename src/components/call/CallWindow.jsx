import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthProvider';
import styles from './CallWindow.module.scss';

const CallWindow = ({ 
  isOpen, 
  onClose, 
  callType = 'video', 
  recipientId,
  recipient,
  isIncoming = false,
  callId,
  activeCall 
}) => {
  const { user } = useAuth();
  
  // Call states
  const [callStatus, setCallStatus] = useState('connecting');
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  // WebRTC refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callStartTimeRef = useRef(null);
  
  // Initialize media streams from activeCall
  useEffect(() => {
    
    if (activeCall?.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = activeCall.localStream;
      
      // Debug local stream tracks
      activeCall.localStream.getTracks().forEach(track => {
        // Track debugging (removed logs)
      });
    }
    
    if (activeCall?.peerConnection) {
      // Handle remote stream from existing peer connection
      activeCall.peerConnection.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        
        // Debug remote stream tracks
        event.streams[0].getTracks().forEach(track => {
          // Track debugging (removed logs)
        });
        
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          
          // Ensure audio plays - CRITICAL for hearing audio
          remoteVideoRef.current.muted = false;
          remoteVideoRef.current.volume = 1.0;
          
          // Try to play (handle autoplay policy)
          const playPromise = remoteVideoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              // Remote audio playing
            }).catch(err => {
              console.warn('[CallWindow] ❌ Autoplay blocked - need user interaction:', err);
              // Add click to play handler
              const clickToPlay = () => {
                remoteVideoRef.current.play();
                remoteVideoRef.current.removeEventListener('click', clickToPlay);
              };
              remoteVideoRef.current.addEventListener('click', clickToPlay);
            });
          }
        }
        setCallStatus('connected');
        callStartTimeRef.current = Date.now();
      };
      
      // Monitor connection state
      activeCall.peerConnection.onconnectionstatechange = () => {
        const state = activeCall.peerConnection.connectionState;
        if (state === 'connected') {
          setCallStatus('connected');
          callStartTimeRef.current = Date.now();
        } else if (state === 'failed' || state === 'disconnected') {
          setCallStatus('ended');
        }
      };
    }
  }, [activeCall]);

  // Call duration timer
  useEffect(() => {
    let interval;
    if (callStatus === 'connected' && callStartTimeRef.current) {
      interval = setInterval(() => {
        const duration = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        setCallDuration(duration);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [callStatus]);

  // Handle call status display
  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting':
        return `Đang kết nối với ${recipient?.name || 'Unknown'}...`;
      case 'connected':
        return formatDuration(callDuration);
      case 'ended':
        return 'Cuộc gọi đã kết thúc';
      default:
        return 'Chuẩn bị cuộc gọi...';
    }
  };

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle video
  const toggleVideo = () => {
    if (activeCall?.localStream) {
      const videoTrack = activeCall.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (activeCall?.localStream) {
      const audioTrack = activeCall.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  // End call
  const endCall = () => {
    setCallStatus('ended');
    onClose();
  };

  if (!isOpen) return null;

  const API_URL = import.meta.env.VITE_API_URL;
  const recipientAvatar = recipient?.avatar 
    ? (recipient.avatar.startsWith('http') ? recipient.avatar : `${API_URL}${recipient.avatar}`)
    : `${API_URL}/uploads/avatar/default.png`;

  return (
    <div className={styles.callWindow} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.9)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Call Header */}
      <div className={styles.callHeader}>
        <div className={styles.callInfo}>
          <img 
            src={recipientAvatar} 
            alt={recipient?.name || 'Unknown'}
            className={styles.recipientAvatar}
            onError={(e) => {
              e.target.src = `${API_URL}/uploads/avatar/default.png`;
            }}
          />
          <div className={styles.callDetails}>
            <h3 style={{color: 'white'}}>{recipient?.name || 'Unknown'}</h3>
            <p className={styles.callStatus} style={{color: 'white'}}>{getStatusText()}</p>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className={styles.videoContainer}>
        {/* Remote Video */}
        {/* <div className={styles.remoteVideo}>
          {callType === 'video' ? (
            <video 
              ref={remoteVideoRef}
              autoPlay 
              playsInline
              className={styles.remoteVideoElement}
            />
          ) : (
            <div className={styles.audioCall}>
              <img 
                src={recipientAvatar} 
                alt={recipient?.name || 'Unknown'}
                className={styles.audioCallAvatar}
              />
            </div>
          )}
        </div> */}

        {/* Local Video */}
        {callType === 'video' && (
          <div className={styles.localVideo}>
            <video 
              ref={localVideoRef}
              autoPlay 
              playsInline
              muted
              className={styles.localVideoElement}
            />
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className={styles.callControls}>
        {/* Mute Button */}
        <button 
          className={`${styles.controlButton} ${isMuted ? styles.active : ''}`}
          onClick={toggleMute}
          aria-label={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
        >
          <span className={styles.icon}>
            {isMuted ? '🔇' : '🔊'}
          </span>
        </button>

        {/* Video Toggle (only for video calls) */}
        {callType === 'video' && (
          <button 
            className={`${styles.controlButton} ${!isVideoEnabled ? styles.active : ''}`}
            onClick={toggleVideo}
            aria-label={isVideoEnabled ? 'Tắt camera' : 'Bật camera'}
          >
            <span className={styles.icon}>
              {isVideoEnabled ? '📹' : '📷'}
            </span>
          </button>
        )}

        {/* End Call Button */}
        <button 
          className={`${styles.controlButton} ${styles.endCallButton}`}
          onClick={endCall}
          aria-label="Kết thúc cuộc gọi"
        >
          <span className={styles.icon}>📞</span>
        </button>
      </div>
    </div>
  );
};

CallWindow.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  callType: PropTypes.oneOf(['video', 'audio']),
  recipientId: PropTypes.string,
  recipient: PropTypes.object,
  isIncoming: PropTypes.bool,
  callId: PropTypes.string,
  activeCall: PropTypes.object
};

export default CallWindow;