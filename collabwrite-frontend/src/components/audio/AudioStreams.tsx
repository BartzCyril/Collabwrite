import { useEffect, useRef } from 'react';

interface PeerConnection {
  peerId: string;
  stream?: MediaStream;
}

interface AudioStreamsProps {
  localStream: MediaStream | null;
  peers: Map<string, PeerConnection>;
}

export const AudioStreams: React.FC<AudioStreamsProps> = ({
  localStream,
  peers,
}) => {
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    if (localAudioRef.current && localStream) {
      localAudioRef.current.srcObject = localStream;
      localAudioRef.current.muted = true;
    }
  }, [localStream]);

  useEffect(() => {
    peers.forEach((peerConnection, peerId) => {
      if (peerConnection.stream) {
        const audioElement = remoteAudioRefs.current.get(peerId);
        if (audioElement) {
          audioElement.srcObject = peerConnection.stream;
        }
      }
    });
  }, [peers]);

  return (
    <div className="hidden">
      <audio ref={localAudioRef} autoPlay muted />

      {Array.from(peers.entries()).map(([peerId]) => (
        <audio
          key={peerId}
          ref={(el) => {
            if (el) {
              remoteAudioRefs.current.set(peerId, el);
            }
          }}
          autoPlay
        />
      ))}
    </div>
  );
};
