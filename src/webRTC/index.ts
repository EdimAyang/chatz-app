type MediaCallType = "audio" | "video";

type WebRTCServiceCallbacks = {
  onLocalStream?: (stream: MediaStream | null) => void;
  onRemoteStream?: (stream: MediaStream | null) => void;
  onIceCandidate?: (candidate: RTCIceCandidateInit) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onError?: (error: Error) => void;
};

// Store the current connection and streams.
let peerConnection: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let remoteStream = new MediaStream();
let mediaGeneration = 0;

let callbacks: WebRTCServiceCallbacks = {};
let pendingCandidates: RTCIceCandidateInit[] = [];

function cancelledMediaRequest(): Error {
  const error = new Error("The call ended before media could be started.");
  error.name = "AbortError";
  return error;
}

// Register callbacks for stream updates and connection events.
export function configureWebRTC(newCallbacks: WebRTCServiceCallbacks) {
  callbacks = newCallbacks;
}

export const logSelectedCandidatePair = async () => {
  if (!peerConnection) return;

  const stats = await peerConnection.getStats();

  stats.forEach((report) => {
    if (
      report.type === "candidate-pair" &&
      report.state === "succeeded" &&
      report.nominated
    ) {
      const localCandidate = stats.get(report.localCandidateId);
      const remoteCandidate = stats.get(report.remoteCandidateId);

      console.log("SELECTED ICE CONNECTION:", {
        localType: localCandidate?.candidateType,
        remoteType: remoteCandidate?.candidateType,
        protocol: localCandidate?.protocol,
      });
    }
  });
};

// Create the WebRTC peer connection.
function createPeerConnection(): RTCPeerConnection {
  if (peerConnection) {
    return peerConnection;
  }

  peerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
      {
        urls: "stun:stun.relay.metered.ca:80",
      },

      {
        urls: "turn:global.relay.metered.ca:80",
        username: import.meta.env.VITE_TURN_USERNAME,
        credential: import.meta.env.VITE_TURN_CREDENTIALS,
      },
      {
        urls: "turn:global.relay.metered.ca:80?transport=tcp",
        username: import.meta.env.VITE_TURN_USERNAME,
        credential: import.meta.env.VITE_TURN_CREDENTIALS,
      },
      {
        urls: "turn:global.relay.metered.ca:443",
        username: import.meta.env.VITE_TURN_USERNAME,
        credential: import.meta.env.VITE_TURN_CREDENTIALS,
      },
      {
        urls: "turns:global.relay.metered.ca:443?transport=tcp",
        username: import.meta.env.VITE_TURN_USERNAME,
        credential: import.meta.env.VITE_TURN_CREDENTIALS,
      },
    ],
    //  iceTransportPolicy: "relay",
  });

  peerConnection.ontrack = (event) => {
    console.log("REMOTE TRACK RECEIVED:", {
      kind: event.track.kind,
      enabled: event.track.enabled,
      muted: event.track.muted,
      readyState: event.track.readyState,
    });
    const incomingStream = event.streams[0];

    if (incomingStream) {
      remoteStream = incomingStream;
    } else {
      const alreadyAdded = remoteStream
        .getTracks()
        .some((track) => track.id === event.track.id);

      if (!alreadyAdded) {
        remoteStream.addTrack(event.track);
      }
    }

    callbacks.onRemoteStream?.(remoteStream);
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      callbacks.onIceCandidate?.(event.candidate.toJSON());
    }
  };

  peerConnection.onicecandidateerror = (event) => {
    console.error("ICE candidate error:", {
      url: event.url,
      errorCode: event.errorCode,
      errorText: event.errorText,
    });
  };

  peerConnection.onconnectionstatechange = () => {
    if (!peerConnection) return;

    console.log("PEER CONNECTION STATE:", peerConnection.connectionState);

    if (peerConnection.connectionState === "connected") {
      logSelectedCandidatePair();
    }
    callbacks.onConnectionStateChange?.(peerConnection.connectionState);
  };

  peerConnection.oniceconnectionstatechange = () => {
    if (!peerConnection) return;

    console.log("ICE CONNECTION STATE:", peerConnection.iceConnectionState);
  };

  peerConnection.onicegatheringstatechange = () => {
    if (!peerConnection) return;

    console.log("ICE GATHERING STATE:", peerConnection.iceGatheringState);
  };

  return peerConnection;
}

// Request access to the microphone and, for video calls, camera.
export async function startLocalMedia(
  callType: MediaCallType,
): Promise<MediaStream> {
  const generation = mediaGeneration;

  try {
    if (localStream) {
      return localStream;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === "video",
    });

    if (generation !== mediaGeneration) {
      stream.getTracks().forEach((track) => track.stop());
      throw cancelledMediaRequest();
    }

    localStream = stream;

    console.log(
      "LOCAL MEDIA TRACKS:",
      localStream.getTracks().map((track) => ({
        kind: track.kind,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState,
      })),
    );

    callbacks.onLocalStream?.(localStream);

    return localStream;
  } catch {
    if (generation !== mediaGeneration) {
      throw cancelledMediaRequest();
    }

    const error = new Error(
      "Could not access your microphone or camera. Check browser permissions.",
    );

    callbacks.onError?.(error);
    throw error;
  }
}

// Add the local microphone and camera tracks to the connection.
async function addLocalTracks(
  peer: RTCPeerConnection,
  callType: MediaCallType,
): Promise<void> {
  const stream = await startLocalMedia(callType);

  if (peer !== peerConnection) {
    throw cancelledMediaRequest();
  }

  for (const track of stream.getTracks()) {
    const alreadyAdded = peer
      .getSenders()
      .some((sender) => sender.track?.id === track.id);

    if (!alreadyAdded) {
      peer.addTrack(track, stream);
    }
  }
}

// Caller: create an offer to send to the receiver.
export async function createOffer(
  callType: MediaCallType,
): Promise<RTCSessionDescriptionInit> {
  const peer = createPeerConnection();

  await addLocalTracks(peer, callType);
  if (peer !== peerConnection) {
    throw cancelledMediaRequest();
  }

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);

  return {
    type: "offer",
    sdp: offer.sdp!,
  };
}

// Receiver: apply the caller's offer and create an answer.
export async function acceptOffer(
  offer: RTCSessionDescriptionInit,
  callType: MediaCallType,
): Promise<RTCSessionDescriptionInit> {
  const peer = createPeerConnection();

  await addLocalTracks(peer, callType);
  if (peer !== peerConnection) {
    throw cancelledMediaRequest();
  }

  await peer.setRemoteDescription(new RTCSessionDescription(offer));
  if (peer !== peerConnection) {
    throw cancelledMediaRequest();
  }

  await flushPendingCandidates();

  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);

  return {
    type: "answer",
    sdp: answer.sdp!,
  };
}

// Caller: apply the answer received from the receiver.
export async function acceptAnswer(
  answer: RTCSessionDescriptionInit,
): Promise<void> {
  if (!peerConnection) {
    throw new Error("Cannot accept an answer before creating an offer.");
  }

  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

  await flushPendingCandidates();
}

// Add an ICE candidate received from the other participant.
export async function addIceCandidate(
  candidate: RTCIceCandidateInit,
): Promise<void> {
  if (!peerConnection || !peerConnection.remoteDescription) {
    pendingCandidates.push(candidate);
    return;
  }

  await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

// Apply candidates that arrived before the remote description.
async function flushPendingCandidates(): Promise<void> {
  if (!peerConnection?.remoteDescription) {
    return;
  }

  const candidates = pendingCandidates;
  pendingCandidates = [];

  for (const candidate of candidates) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
}

// Turn the microphone on or off.
export function toggleMicrophone(enabled: boolean): void {
  localStream?.getAudioTracks().forEach((track) => {
    track.enabled = enabled;
  });
}

// Turn the camera on or off.
export function toggleCamera(enabled: boolean): void {
  localStream?.getVideoTracks().forEach((track) => {
    track.enabled = enabled;
  });
}

// Get the current local and remote streams.
export function getLocalStream(): MediaStream | null {
  return localStream;
}

export function getRemoteStream(): MediaStream {
  return remoteStream;
}

// End the WebRTC connection and release the camera/microphone.
export function closeWebRTC(): void {
  mediaGeneration += 1;
  const peer = peerConnection;
  peerConnection = null;

  if (peer) {
    peer.ontrack = null;
    peer.onicecandidate = null;
    peer.onconnectionstatechange = null;
    peer.oniceconnectionstatechange = null;
    peer.onicegatheringstatechange = null;
    peer.close();
  }

  localStream?.getTracks().forEach((track) => {
    track.stop();
  });
  localStream = null;

  remoteStream.getTracks().forEach((track) => {
    track.stop();
    remoteStream.removeTrack(track);
  });
  remoteStream = new MediaStream();

  pendingCandidates = [];
  callbacks.onLocalStream?.(null);
  callbacks.onRemoteStream?.(null);
}
