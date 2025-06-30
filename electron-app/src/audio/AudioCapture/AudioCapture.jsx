import { useEffect, useRef, useState } from "react";

const AudioCapture = ({ onAudioData }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    getAudioDevices();
    return () => {
      stopCapture();
    };
  }, []);

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

  const startCapture = async () => {
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

      setIsCapturing(true);
      processAudio();
    } catch (error) {
      console.error("Error starting audio capture:", error);
    }
  };

  const stopCapture = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsCapturing(false);
  };

  const processAudio = () => {
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
  };

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

      <button onClick={isCapturing ? stopCapture : startCapture}>
        {isCapturing ? "Stop Capture" : "Start Capture"}
      </button>

      {isCapturing && <div>🎵 Capturing audio...</div>}
    </div>
  );
};

export default AudioCapture;
