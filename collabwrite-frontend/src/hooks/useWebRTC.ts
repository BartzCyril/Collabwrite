import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'simple-peer';
import { io, Socket } from 'socket.io-client';

interface UseWebRTCProps {
  roomId: string;
  userId: string;
  userName: string;
}

interface PeerConnection {
  peerId: string;
  peer: Peer.Instance;
  stream?: MediaStream;
  userName?: string;
}

export const useWebRTC = ({ roomId, userId, userName }: UseWebRTCProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map());
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const mySocketIdRef = useRef<string | null>(null);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    const socket = io('http://localhost:3001', {
      autoConnect: false,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to signaling server, socket ID:', socket.id);
      mySocketIdRef.current = socket.id || null;
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      setConnectionStatus('disconnected');
    });

    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    return () => {
      socket.disconnect();
    };
  }, []);

  const createPeer = useCallback((peerId: string, initiator: boolean, peerUserName?: string) => {
    const stream = localStreamRef.current;
    if (!stream) {
      console.warn('Cannot create peer: no local stream');
      return;
    }

    const peer = new Peer({
      initiator,
      trickle: true,
      stream: stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    peer.on('signal', (signal: Peer.SignalData) => {
      if (signal.type === 'offer') {
        socketRef.current?.emit('offer', { to: peerId, from: userId, signal });
      } else if (signal.type === 'answer') {
        socketRef.current?.emit('answer', { to: peerId, from: userId, signal });
      } else {
        socketRef.current?.emit('ice-candidate', { to: peerId, from: userId, candidate: signal });
      }
    });

    peer.on('stream', (remoteStream: MediaStream) => {
      console.log('Received remote stream from', peerId);
      const peerConnection = peersRef.current.get(peerId);
      if (peerConnection) {
        peerConnection.stream = remoteStream;
        setPeers(new Map(peersRef.current));
      }
    });

    peer.on('error', (err: Error) => {
      console.error('Peer error:', err);

      const isNormalDisconnect =
        err.message.includes('User-Initiated Abort') ||
        err.message.includes('Connection failed') ||
        err.message.includes('close called');

      if (!isNormalDisconnect) {
        setError(`Peer error: ${err.message}`);
      }
    });

    peer.on('close', () => {
      console.log('Peer connection closed:', peerId);
      peersRef.current.delete(peerId);
      setPeers(new Map(peersRef.current));
    });

    const peerConnection: PeerConnection = {
      peerId,
      peer,
      userName: peerUserName,
    };

    peersRef.current.set(peerId, peerConnection);
    setPeers(new Map(peersRef.current));

    return peer;
  }, [userId]);

  const handleUserJoined = useCallback((data: { userId: string; userName: string }) => {
    console.log('User joined:', data.userName, `(${data.userId})`);

    const myId = mySocketIdRef.current;
    const shouldInitiate = myId && myId < data.userId;

    console.log(`Should initiate with ${data.userName}? ${shouldInitiate} (my ID: ${myId})`);

    if (!shouldInitiate) {
      console.log(`Waiting for ${data.userName} to initiate`);
      return;
    }

    if (localStreamRef.current) {
      createPeer(data.userId, true, data.userName);
    } else {
      console.warn('Local stream not available when user joined');
    }
  }, [createPeer]);

  const handleUserLeft = useCallback((data: { userId: string }) => {
    console.log('User left:', data.userId);
    const peer = peersRef.current.get(data.userId);
    if (peer) {
      peer.peer.destroy();
      peersRef.current.delete(data.userId);
      setPeers(new Map(peersRef.current));
    }
  }, []);

  const handleOffer = useCallback((data: { from: string; signal: Peer.SignalData }) => {
    console.log('Received offer from', data.from);
    const peer = createPeer(data.from, false);
    if (peer) {
      peer.signal(data.signal);
    }
  }, [createPeer]);

  const handleAnswer = useCallback((data: { from: string; signal: Peer.SignalData }) => {
    console.log('Received answer from', data.from);
    const peerConnection = peersRef.current.get(data.from);
    if (peerConnection) {
      peerConnection.peer.signal(data.signal);
    }
  }, []);

  const handleIceCandidate = useCallback((data: { from: string; candidate: Peer.SignalData }) => {
    console.log('Received ICE candidate from', data.from);
    const peerConnection = peersRef.current.get(data.from);
    if (peerConnection) {
      peerConnection.peer.signal(data.candidate);
    }
  }, []);

  const startCall = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      setLocalStream(stream);
      setIsCallActive(true);

      socketRef.current?.connect();
      socketRef.current?.emit('join-room', { roomId, userId, userName });

      setConnectionStatus('connected');
    } catch (err) {
      console.error('Error starting call:', err);
      setError('Failed to access microphone. Please check your permissions.');
      setConnectionStatus('disconnected');
    }
  }, [roomId, userId, userName]);

  const endCall = useCallback(() => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
      localStreamRef.current = null;
    }

    peersRef.current.forEach((peerConnection) => {
      peerConnection.peer.destroy();
    });
    peersRef.current.clear();
    setPeers(new Map());

    socketRef.current?.emit('leave-room', { roomId, userId });
    socketRef.current?.disconnect();

    setIsCallActive(false);
    setConnectionStatus('disconnected');
    setError(null);
  }, [roomId, userId]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  return {
    localStream,
    peers,
    isCallActive,
    isMuted,
    connectionStatus,
    error,
    startCall,
    endCall,
    toggleMute,
  };
};
