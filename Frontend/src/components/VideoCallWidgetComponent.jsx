import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { 
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiMaximize2, FiMinimize2 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const VideoCallWidget = ({ appointment, onClose }) => {
  const { user } = useAuth();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStatus, setCallStatus] = useState('Initializing...'); 
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const socket = useRef(null);

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    const initCall = async () => {
      try {
        // A. Media Access
        let stream = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (err) {
          console.warn("Camera blocked/not found. Trying Audio only...", err);
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            setIsCameraOn(false);
          } catch (audioErr) {
            alert("No media devices accessible.");
          }
        }

        setLocalStream(stream);
        if (localVideoRef.current && stream) {
          localVideoRef.current.srcObject = stream;
        }

        // B. Socket Connection
        const backendUrl = import.meta.env.VITE_API_BASE_URL 
          ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
          : 'http://localhost:8080';

        socket.current = io(backendUrl, {
          auth: { token: localStorage.getItem('token') },
        });

        // C. Event Listeners
        socket.current.on('connect', () => {
          socket.current.emit('join-room', { appointmentId: appointment._id });
          setCallStatus('Waiting for other party...');
        });

        socket.current.on('user-connected', () => {
          setCallStatus('Connecting...');
          createOffer();
        });

        socket.current.on('offer', handleReceiveOffer);
        socket.current.on('answer', handleReceiveAnswer);
        socket.current.on('ice-candidate', handleReceiveIceCandidate);

      } catch (error) {
        console.error("Init Error:", error);
        onClose();
      }
    };

    initCall();

    return () => leaveCall();
  }, [appointment._id]);

  // --- 2. WEBRTC FUNCTIONS ---
  const createPeerConnection = () => {
    if (peerConnection.current) return peerConnection.current;
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnection.current = pc;

    if (localStream) {
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit('ice-candidate', {
          roomId: appointment._id, candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      setCallStatus('Connected');
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    return pc;
  };

  const createOffer = async () => {
    const pc = createPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.current.emit('offer', { roomId: appointment._id, offer });
  };

  const handleReceiveOffer = async ({ offer }) => {
    const pc = createPeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.current.emit('answer', { roomId: appointment._id, answer });
  };

  const handleReceiveAnswer = async ({ answer }) => {
    const pc = peerConnection.current;
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleReceiveIceCandidate = async ({ candidate }) => {
    const pc = peerConnection.current;
    if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
  };

  // --- 3. CONTROLS ---
  const toggleMic = () => {
    if (localStream) {
      const track = localStream.getAudioTracks()[0];
      if (track) { track.enabled = !track.enabled; setIsMicOn(track.enabled); }
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const track = localStream.getVideoTracks()[0];
      if (track) { track.enabled = !track.enabled; setIsCameraOn(track.enabled); }
    }
  };

  const leaveCall = () => {
    if (localStream) localStream.getTracks().forEach((t) => t.stop());
    if (peerConnection.current) peerConnection.current.close();
    if (socket.current) socket.current.disconnect();
    if (onClose) onClose();
  };

  // --- 4. RENDER ---
  if (isMinimized) {
    return (
      <div className="video-widget-minimized" onClick={() => setIsMinimized(false)}>
        <span className="animate-pulse-green"></span>
        <span className="min-text">Call Active</span>
        <FiMaximize2 />
        {/* Minimized Styles */}
        <style>{`
          .video-widget-minimized {
            position: fixed; bottom: 20px; right: 20px;
            background: #1e293b; color: white;
            padding: 10px 16px; border-radius: 50px;
            display: flex; align-items: center; gap: 10px;
            cursor: pointer; z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-size: 0.85rem;
            transform: scale(0.8); /* 80% Scale for minimized too */
            transform-origin: bottom right;
          }
          .animate-pulse-green {
            width: 8px; height: 8px; background: #22c55e;
            border-radius: 50%;
            animation: pulse-green 2s infinite;
          }
          @keyframes pulse-green {
            0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
            70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
            100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="video-widget-overlay">
      <div className="scale-wrapper">
        <div className="video-widget-card">
          
          {/* HEADER */}
          <div className="widget-header">
            <div className="header-info">
              <span className="live-badge">LIVE</span>
              <div className="patient-info">
                <h4>{appointment.patientId.name || 'Patient'}</h4>
                <span className="timer-text">{callStatus}</span>
              </div>
            </div>
            <button className="minimize-btn" onClick={() => setIsMinimized(true)}>
              <FiMinimize2 />
            </button>
          </div>

          {/* VIDEO AREA */}
          <div className="video-area">
            {/* Remote Video */}
            <div className="remote-video-container">
              <video 
                ref={remoteVideoRef} 
                autoPlay playsInline 
                className="remote-video"
              />
              {!remoteStream && (
                <div className="waiting-placeholder">
                  <div className="spinner-ring"></div>
                  <p>Connecting...</p>
                </div>
              )}
            </div>

            {/* Local Video PIP */}
            <div className="local-video-container">
              <video 
                ref={localVideoRef} 
                autoPlay playsInline muted 
                className={`local-video ${!isCameraOn ? 'hidden-video' : ''}`}
              />
              {!isCameraOn && <div className="camera-off-placeholder"><FiVideoOff /></div>}
            </div>
          </div>

          {/* CONTROLS */}
          <div className="controls-bar">
            <button onClick={toggleMic} className={`control-btn ${!isMicOn ? 'off' : ''}`}>
              {isMicOn ? <FiMic /> : <FiMicOff />}
            </button>
            <button onClick={toggleCamera} className={`control-btn ${!isCameraOn ? 'off' : ''}`}>
              {isCameraOn ? <FiVideo /> : <FiVideoOff />}
            </button>
            <button onClick={leaveCall} className="control-btn end-call">
              <FiPhoneOff />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        /* OVERLAY & SCALING */
        .video-widget-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(5px);
          z-index: 9999;
          display: flex; align-items: center; justify-content: center;
        }

        /* This wrapper applies the 80% visual reduction requested. 
           It scales the entire card down while keeping it centered.
        */
        .scale-wrapper {
          transform: scale(0.8);
          transform-origin: center;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .video-widget-card {
          width: 900px;
          height: 600px; /* Fixed height for desktop to ensure aspect ratio */
          max-width: 95vw;
          max-height: 90vh;
          background: #0f172a;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          display: flex; flex-direction: column;
          border: 1px solid rgba(255,255,255,0.1);
        }

        /* HEADER */
        .widget-header {
          padding: 15px 25px;
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(15, 23, 42, 0.95);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          height: 70px;
          flex-shrink: 0;
        }
        .header-info { display: flex; align-items: center; gap: 15px; }
        .patient-info { display: flex; flex-direction: column; }
        .patient-info h4 { margin: 0; color: #f8fafc; font-size: 1.1rem; font-weight: 600; }
        .timer-text { font-size: 0.8rem; color: #94a3b8; }
        .live-badge {
          background: #ef4444; color: white;
          font-size: 0.7rem; font-weight: 800;
          padding: 4px 8px; border-radius: 4px;
          letter-spacing: 0.5px;
        }
        .minimize-btn {
          background: transparent; border: none; color: #94a3b8;
          font-size: 1.4rem; cursor: pointer;
        }

        /* VIDEO AREA - FLEXIBLE */
        .video-area {
          position: relative;
          flex: 1; /* Takes remaining height */
          background: #000;
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        
        .remote-video-container { width: 100%; height: 100%; }
        
        /* Object-fit contain ensures we see whole video on desktop, 
           Switch to cover on mobile for immersion */
        .remote-video { 
          width: 100%; height: 100%; 
          object-fit: contain; 
          background: #000;
        }

        .waiting-placeholder {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          color: #94a3b8; gap: 15px; background: #0f172a;
        }
        .spinner-ring {
          width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.1);
          border-top-color: #3b82f6; border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* PIP LOCAL VIDEO */
        .local-video-container {
          position: absolute; bottom: 20px; right: 20px;
          width: 200px; height: 150px; /* Fixed size for consistency */
          background: #334155;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.4);
          border: 2px solid rgba(255,255,255,0.1);
          z-index: 10;
          transition: all 0.3s ease;
        }
        .local-video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
        .hidden-video { opacity: 0; }
        .camera-off-placeholder {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          color: #64748b; font-size: 1.5rem; background: #1e293b;
        }

        /* CONTROLS */
        .controls-bar {
          padding: 20px;
          display: flex; justify-content: center; gap: 20px;
          background: #0f172a;
          height: 90px;
          flex-shrink: 0;
        }
        .control-btn {
          width: 55px; height: 55px;
          border-radius: 50%; border: none;
          background: #334155; color: white;
          font-size: 1.4rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .control-btn:hover { background: #475569; }
        .control-btn.off { background: #ef4444; color: white; }
        .control-btn.end-call { background: #ef4444; }
        .control-btn.end-call:hover { background: #dc2626; }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* --- MOBILE RESPONSIVENESS --- */
        @media (max-width: 768px) {
          .video-widget-card {
            width: 100vw;
            height: 100vh; /* Fill screen logic, then scaled down by wrapper */
            max-width: none;
            max-height: none;
            border-radius: 16px; /* slightly rounded corners at 80% scale look better */
          }

          /* On mobile, make video cover the screen for immersion */
          .remote-video { object-fit: cover; }
          
          /* Adjust PIP size for mobile */
          .local-video-container {
            width: 120px; height: 160px; /* Portrait aspect ratio for user */
            bottom: 110px; right: 15px; /* Moved up to avoid controls */
          }

          .widget-header { padding: 10px 15px; height: 60px; }
          .controls-bar { height: 80px; padding: 15px; }
          
          /* Since we scale the whole card to 0.8, these elements 
             don't need to be drastically smaller, the scale wrapper handles it. */
        }
      `}</style>
    </div>
  );
};

export default VideoCallWidget;