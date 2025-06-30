import { useCallback, useEffect, useRef, useState } from "react";

const AudioCapture = ({ onAudioData, onAudioStream }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  const getAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(
        (device) => device.kind === "audioinput"
      );
      setDevices(audioInputs);

      const blackHole = audioInputs.find((device) =>
        device.label.toLowerCase().includes("blackhole")
      );
      if (blackHole) {
        setSelectedDevice(blackHole.deviceId);
      }
    } catch (error) {
      console.error("Error getting audio devices:", error);
    }
  };

  const processAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      analyserRef.current.getByteFrequencyData(dataArray);

      if (onAudioData) {
        onAudioData({
          frequencyData: Array.from(dataArray),
          sampleRate: audioContextRef.current.sampleRate,
          bufferLength,
        });
      }

      animationRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  }, [onAudioData]);

  const startCapture = useCallback(async () => {
    try {
      const constraints = {
        audio: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Notify parent component about audio stream and context
      if (onAudioStream) {
        onAudioStream({
          stream,
          audioContext,
          source,
          analyser,
        });
      }

      setIsCapturing(true);
      processAudio();
    } catch (error) {
      console.error("Error starting audio capture:", error);
    }
  }, [onAudioStream, processAudio, selectedDevice]);

  const stopCapture = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    // Notify parent that stream is no longer available
    if (onAudioStream) {
      onAudioStream(null);
    }

    setIsCapturing(false);
  }, [onAudioStream]);

  useEffect(() => {
    getAudioDevices();
  }, []);

  useEffect(() => {
    startCapture();
    return () => stopCapture();
  }, [startCapture, stopCapture]);

  return (
    <div>
      <div>
        <label>Audio Device (BlackHole for system audio): </label>
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          disabled={isCapturing}
        >
          <option value="">Default</option>
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Device ${device.deviceId.substring(0, 8)}`}
            </option>
          ))}
        </select>
      </div>

      {isCapturing && <div>🎵 Capturing audio...</div>}
    </div>
  );
};

export default AudioCapture;
