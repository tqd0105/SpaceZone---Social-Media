// useCall.js - Custom hook for managing video/audio calls
import { useState, useCallback, useEffect } from 'react';
import { useChatSocket } from './useChatSocket';

export const useCall = () => {
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callState, setCallState] = useState('idle'); // 'idle', 'calling', 'ringing', 'connected', 'ended'
  const socket = useChatSocket();
  
  const generateCallId = () => {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Start a new call
  const startCall = useCallback(async (recipientId, recipient, callType = 'video') => {
    
    if (!socket.isConnected) {
      console.error('[useCall] Socket not connected! Cannot start call.');
      alert('Lỗi: Không kết nối được với server. Vui lòng tải lại trang.');
      throw new Error('Socket not connected');
    }

    // Prevent multiple calls
    if (activeCall || callState !== 'idle') {
      alert('Cuộc gọi đang diễn ra');
      return activeCall;
    }

    const callId = generateCallId();
    
    const call = {
      id: callId,
      type: callType,
      recipientId,
      recipient,
      isOutgoing: true,
      startTime: new Date(),
      status: 'calling'
    };
    
    try {
      // Create WebRTC peer connection and offer
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket.isConnected) {
          socket.socket.emit('call:ice-candidate', {
            callId,
            candidate: event.candidate,
            recipientId
          });
        }
      };
      
      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'connected') {
          setCallState('connected');
        } else if (peerConnection.connectionState === 'failed') {
          console.error('[useCall] Connection failed, ending call');
          setActiveCall(null);
          setCallState('ended');
          setTimeout(() => {
            setCallState('idle');
          }, 2000);
        }
      };
      
      // Handle remote stream
      peerConnection.ontrack = (event) => {
        // Remote stream will be handled in CallWindow
      };
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true
      });
      
      // Add stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      
      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      // Update call with WebRTC objects
      const callWithWebRTC = {
        ...call,
        peerConnection,
        localStream: stream
      };
      
      setCallState('calling');
      setActiveCall(callWithWebRTC);
      
      // Send call offer to backend with WebRTC offer
      socket.socket.emit('call:offer', {
        callId,
        recipientId,
        callType,
        offer: offer,
        hasOffer: true,
        caller: {
          id: socket.socket.userId || 'unknown',
          name: 'You',
          avatar: null
        }
      });
      
      return callWithWebRTC;
      
    } catch (error) {
      console.error('[useCall] ===== ERROR STARTING CALL =====');
      console.error('[useCall] Error type:', error.name);
      console.error('[useCall] Error message:', error.message);
      console.error('[useCall] Full error:', error);
      
      // Show user-friendly error
      if (error.name === 'NotAllowedError') {
        alert('Bạn cần cho phép truy cập camera/microphone để thực hiện cuộc gọi.');
      } else if (error.name === 'NotFoundError') {
        alert('Không tìm thấy camera/microphone. Vui lòng kiểm tra thiết bị.');
      } else {
        alert('Lỗi khi bắt đầu cuộc gọi: ' + error.message);
      }
      
      setActiveCall(null);
      setCallState('idle');
      throw error;
    }
  }, [socket, activeCall, callState]);

  // Accept incoming call
  const acceptCall = useCallback(async (call) => {
        
    try {
      // Create WebRTC peer connection for incoming call
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket.isConnected) {
          console.log('[useCall] Sending ICE candidate (accept):', event.candidate);
          socket.socket.emit('call:ice-candidate', {
            callId: call.id,
            candidate: event.candidate,
            recipientId: call.caller?.id
          });
        }
      };
      
      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'connected') {
          setCallState('connected');
        } else if (peerConnection.connectionState === 'failed') {
          console.error('[useCall] Connection failed (accept), ending call');
          setActiveCall(null);
          setCallState('ended');
          setTimeout(() => {
            setCallState('idle');
          }, 2000);
        }
      };
      
        // Handle remote stream
        peerConnection.ontrack = (event) => {
          // Remote stream will be handled in CallWindow
        };      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: call.type === 'video',
        audio: true
      });
      
      // Add stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      
      // Set remote description (offer)
      if (call.offer) {
        await peerConnection.setRemoteDescription(call.offer);
      }
      
      // Create answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      // Send answer to backend
      socket.socket.emit('call:answer', {
        callId: call.id,
        answer: answer,
        recipientId: call.caller?.id
      });
      
      setActiveCall({
        ...call,
        isOutgoing: false,
        status: 'connecting',
        peerConnection,
        localStream: stream,
        // For incoming calls, the recipient is the caller
        recipientId: call.caller?.id,
        recipient: call.caller
      });
      
        } catch (error) {
          console.error('[useCall] Error accepting call:', error);
          // Decline call on error - handle this internally
          if (socket.isConnected) {
            socket.socket.emit('call:decline', {
              callId: call.id,
              recipientId: call.caller?.id
            });
          }
          setIncomingCall(null);
          setCallState('idle');
          return;
        }    setIncomingCall(null);
    setCallState('connecting'); // Set to connecting first, will change to connected when WebRTC connects
  }, [socket]);

  // Decline incoming call
  const declineCall = useCallback((call) => {
    if (!call || !socket.isConnected) return;
    
    console.log('[useCall] Declining call:', call);
    
    // If there's an active call with streams, stop them
    if (activeCall?.localStream) {
      console.log('[useCall] Stopping media tracks when declining...');
      activeCall.localStream.getTracks().forEach(track => {
        track.stop();
        console.log('[useCall] Stopped track:', track.kind, track.label);
      });
    }
    
    if (activeCall?.peerConnection) {
      activeCall.peerConnection.close();
    }
    
    socket.socket.emit('call:decline', {
      callId: call.id,
      recipientId: call.caller?.id
    });
    
    setIncomingCall(null);
    setActiveCall(null);
    setCallState('idle');
  }, [socket, activeCall]);

  // End active call
  const endCall = useCallback(() => {
    if (!activeCall) return;
    
    console.log('[useCall] Ending call:', activeCall);
    
    // Stop all media tracks (camera/microphone)
    if (activeCall.localStream) {
      console.log('[useCall] Stopping local media tracks...');
      activeCall.localStream.getTracks().forEach(track => {
        track.stop();
        console.log('[useCall] Stopped track:', track.kind, track.label);
      });
    }
    
    // Close peer connection
    if (activeCall.peerConnection) {
      activeCall.peerConnection.close();
    }
    
    // Notify server
    if (socket.isConnected) {
      socket.socket.emit('call:end', {
        callId: activeCall.id,
        recipientId: activeCall.recipientId
      });
    }
    
    setActiveCall(null);
    setCallState('ended');
    
    // Reset to idle after a delay
    setTimeout(() => {
      setCallState('idle');
    }, 2000);
  }, [activeCall, socket]);

  // Socket event handlers
  useEffect(() => {
    if (!socket.socket || !socket.isConnected) return;

    const handleIncomingCall = (data) => {
      const incomingCallData = {
        id: data.callId,
        type: data.callType,
        caller: data.caller,
        offer: data.offer,
        isOutgoing: false,
        receivedAt: new Date()
      };
      
      setIncomingCall(incomingCallData);
      setCallState('ringing');
    };

    const handleCallAnswer = async (data) => {
      if (activeCall && activeCall.id === data.callId) {
        try {
          // Set remote description (answer) for the outgoing call
          if (activeCall.peerConnection && data.answer) {
            await activeCall.peerConnection.setRemoteDescription(data.answer);
          }
          
          setActiveCall(prev => ({
            ...prev,
            status: 'connected',
            answer: data.answer
          }));
          setCallState('connected');
        } catch (error) {
          console.error('[useCall] Error handling call answer:', error);
          setActiveCall(null);
          setCallState('ended');
          setTimeout(() => {
            setCallState('idle');
          }, 2000);
        }
      }
    };
    
    const handleIceCandidate = async (data) => {
      console.log('[DEBUG] handleIceCandidate received:', {
        hasActiveCall: !!activeCall,
        activeCallId: activeCall?.id,
        receivedCallId: data.callId,
        idsMatch: activeCall?.id === data.callId,
        hasPeerConnection: !!activeCall?.peerConnection
      });
      
      if (activeCall && activeCall.id === data.callId && activeCall.peerConnection) {
        try {
          await activeCall.peerConnection.addIceCandidate(data.candidate);
          console.log('[useCall] ICE candidate added successfully');
        } catch (error) {
          console.error('[useCall] Error adding ICE candidate:', error);
        }
      }
    };

    const handleCallDecline = (data) => {
      console.log('[useCall] Call declined:', data);
      
      if (activeCall && activeCall.id === data.callId) {
        // Stop media tracks when call is declined
        if (activeCall.localStream) {
          console.log('[useCall] Stopping media tracks - call declined by other party');
          activeCall.localStream.getTracks().forEach(track => {
            track.stop();
            console.log('[useCall] Stopped track:', track.kind, track.label);
          });
        }
        
        if (activeCall.peerConnection) {
          activeCall.peerConnection.close();
        }
        
        // Force close UI immediately
        setActiveCall(null);
        setCallState('idle'); // Set to idle immediately
      }
    };

    const handleCallEnd = (data) => {
      if (activeCall && activeCall.id === data.callId) {
        // Stop media tracks when call is ended by other party
        if (activeCall.localStream) {
          activeCall.localStream.getTracks().forEach(track => {
            track.stop();
          });
        }
        
        if (activeCall.peerConnection) {
          activeCall.peerConnection.close();
        }
        
        // Force close UI immediately  
        setActiveCall(null);
        setCallState('idle'); // Set to idle immediately, not 'ended'
      }
      
      if (incomingCall && incomingCall.id === data.callId) {
        setIncomingCall(null);
        setCallState('idle');
      }
    };

    const handleCallError = (data) => {
      console.error('[useCall] Call error:', data);
      
      if (activeCall && activeCall.id === data.callId) {
        // Stop media tracks when there's an error
        if (activeCall.localStream) {
          activeCall.localStream.getTracks().forEach(track => {
            track.stop();
          });
        }
        
        if (activeCall.peerConnection) {
          activeCall.peerConnection.close();
        }
        
        setActiveCall(null);
      }
      
      if (incomingCall && incomingCall.id === data.callId) {
        setIncomingCall(null);
      }
      
      setCallState('idle');
    };

    // Register event listeners
    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:answer', handleCallAnswer);
    socket.on('call:decline', handleCallDecline);
    socket.on('call:end', handleCallEnd);
    socket.on('call:error', handleCallError);
    socket.on('call:ice-candidate', handleIceCandidate);

    // Cleanup
    return () => {
      socket.off('call:incoming', handleIncomingCall);
      socket.off('call:answer', handleCallAnswer);
      socket.off('call:decline', handleCallDecline);
      socket.off('call:end', handleCallEnd);
      socket.off('call:error', handleCallError);
      socket.off('call:ice-candidate', handleIceCandidate);
    };
  }, [socket, activeCall, incomingCall, endCall]);

  // Debug log whenever isCallActive changes
  const isCallActiveValue = callState !== 'idle' && !!activeCall;

  return {
    // State
    activeCall,
    incomingCall,
    callState,
    
    // Actions
    startCall,
    acceptCall,
    declineCall,
    endCall,
    
    // Utils
    isCallActive: callState !== 'idle' && !!activeCall,
    hasIncomingCall: !!incomingCall && callState === 'ringing',
    isConnected: socket.isConnected,
    isOutgoingCall: callState === 'calling' && activeCall?.isOutgoing,
    
    // Debug
    debug: {
      callState,
      hasActiveCall: !!activeCall,
      isCallActive: callState !== 'idle' && !!activeCall,
      activeCallId: activeCall?.id,
      activeCallStatus: activeCall?.status,
      isOutgoingCall: callState === 'calling' && activeCall?.isOutgoing
    }
  };
};