// CallManager.jsx - Component to manage call UI and states
import { useEffect, useState } from 'react';
import { useCallContext } from '../../context/CallContext';
import CallWindow from './CallWindow';
import IncomingCallModal from './IncomingCallModal';
import OutgoingCallModal from './OutgoingCallModal';

const CallManager = () => {
  const callHookState = useCallContext();
  const { 
    activeCall, 
    incomingCall, 
    callState,
    acceptCall, 
    declineCall, 
    endCall,
    isCallActive,
    hasIncomingCall 
  } = callHookState;

  // Force re-render when callState changes
  useEffect(() => {
    // State changed
  }, [callState]);

  // Force re-render when activeCall changes  
  useEffect(() => {
    // Active call changed
  }, [activeCall]);

  // Handle browser notifications for incoming calls
  useEffect(() => {
    if (hasIncomingCall && incomingCall) {
      // Request notification permission if not granted
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // Show notification
      if (Notification.permission === 'granted') {
        new Notification(`Cuộc gọi ${incomingCall.type === 'video' ? 'video' : ''} từ ${incomingCall.caller?.name || 'Unknown'}`, {
          icon: '/favicon.ico',
          tag: `call-${incomingCall.id}`
        });
      }
      
      // Play ringtone sound (you can add a sound file)
      // const audio = new Audio('/sounds/ringtone.mp3');
      // audio.loop = true;
      // audio.play().catch(err => console.log('Cannot play ringtone:', err));
    }
  }, [hasIncomingCall, incomingCall]);

  return (
    <>
      {/* Outgoing Call Modal - Hiển thị khi người gọi đang chờ */}
      {callState === 'calling' && activeCall?.isOutgoing && (
        <OutgoingCallModal
          isOpen={true}
          recipient={activeCall.recipient}
          callType={activeCall.type}
          onEndCall={endCall}
          callDuration={0}
        />
      )}

      {/* Active Call Window - Chỉ hiển thị khi đã kết nối hoặc đang kết nối */}
      { activeCall && (callState === 'connected' || callState === 'connecting') && (
        <CallWindow
          isOpen={true}
          onClose={endCall}
          callType={activeCall.type}
          recipientId={activeCall.recipientId}
          recipient={activeCall.recipient}
          isIncoming={!activeCall.isOutgoing}
          callId={activeCall.id}
          activeCall={activeCall}
        />
      )}

      {/* Incoming Call Modal */}
      {hasIncomingCall && incomingCall && !isCallActive && (
        <IncomingCallModal
          isOpen={true}
          caller={incomingCall.caller}
          callType={incomingCall.type}
          onAccept={() => acceptCall(incomingCall)}
          onDecline={() => declineCall(incomingCall)}
        />
      )}
    </>
  );
};

export default CallManager;