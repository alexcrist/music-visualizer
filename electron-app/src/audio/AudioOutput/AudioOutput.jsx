import { useCallback, useEffect, useRef, useState } from "react";

const VISUAL_DELAY_SECONDS = 0.0;

const AudioOutput = ({ audioContext, sourceNode, delaySeconds }) => {
  const [isForwarding, setIsForwarding] = useState(false);
  const [outputDevices, setOutputDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const delayNodeRef = useRef(null);
  const destinationRef = useRef(null);
  const audioElementRef = useRef(null);

  const getOutputDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputs = devices.filter(
        (device) => device.kind === "audiooutput"
      );
      setOutputDevices(audioOutputs);

      // Set default device if available
      const defaultDevice = audioOutputs.find((device) => {
        return device.label.toLowerCase().includes("external headphones");
      });
      if (defaultDevice?.deviceId) {
        setSelectedDevice(defaultDevice.deviceId);
      }
    } catch (error) {
      console.error("Error getting output devices:", error);
    }
  }, []);

  useEffect(() => {
    getOutputDevices();
  }, [getOutputDevices]);

  const startForwarding = useCallback(async () => {
    if (!sourceNode || !audioContext) {
      return;
    }

    try {
      // Stop any existing forwarding first
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.srcObject = null;
        audioElementRef.current = null;
      }
      if (delayNodeRef.current && audioContext.state !== "closed") {
        delayNodeRef.current.disconnect();
        if (sourceNode) {
          sourceNode.disconnect(delayNodeRef.current);
        }
      }
      delayNodeRef.current = null;
      destinationRef.current = null;

      // Create audio nodes
      const delayNode = audioContext.createDelay();
      delayNode.delayTime.value = delaySeconds + VISUAL_DELAY_SECONDS;

      // Create a destination that we can control the output device for
      const destination = audioContext.createMediaStreamDestination();

      // Connect the audio graph: source -> delay -> destination
      sourceNode.connect(delayNode);
      delayNode.connect(destination);

      // Create an audio element to play the stream with specific output device
      const audioElement = new Audio();
      audioElement.srcObject = destination.stream;

      // Set the output device
      if (audioElement.setSinkId && selectedDevice) {
        try {
          await audioElement.setSinkId(selectedDevice);
          console.info(`Audio output set to device: ${selectedDevice}`);
        } catch (err) {
          console.error("Error setting output device:", err);
          // Continue anyway with default device
        }
      } else if (!audioElement.setSinkId) {
        console.warn("setSinkId not supported - using default output device");
      }

      // Play the audio
      await audioElement.play();

      // Store references for cleanup
      delayNodeRef.current = delayNode;
      destinationRef.current = destination;
      audioElementRef.current = audioElement;

      setIsForwarding(true);
    } catch (error) {
      console.error("Error starting audio forwarding:", error);
    }
  }, [sourceNode, audioContext, delaySeconds, selectedDevice]);

  // Update delay node's delay
  useEffect(() => {
    const delayNode = delayNodeRef.current;
    if (!delayNode) {
      return;
    }
    delayNode.delayTime.value = delaySeconds + VISUAL_DELAY_SECONDS;
  }, [delaySeconds]);

  const stopForwarding = useCallback(() => {
    try {
      // Stop and cleanup audio element
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.srcObject = null;
        audioElementRef.current = null;
      }

      // Disconnect audio nodes
      if (
        delayNodeRef.current &&
        audioContext &&
        audioContext.state !== "closed"
      ) {
        delayNodeRef.current.disconnect();
        if (sourceNode) {
          sourceNode.disconnect(delayNodeRef.current);
        }
      }

      // Clear references
      delayNodeRef.current = null;
      destinationRef.current = null;

      setIsForwarding(false);
    } catch (error) {
      console.error("Error stopping audio forwarding:", error);
      // Force reset state even if cleanup fails
      delayNodeRef.current = null;
      destinationRef.current = null;
      audioElementRef.current = null;
      setIsForwarding(false);
    }
  }, [sourceNode, audioContext]);

  const handleOutputDeviceChange = async (e) => {
    const deviceId = e.target.value;
    setSelectedDevice(deviceId);

    // If audio is active, update the output device
    if (
      isForwarding &&
      audioElementRef.current &&
      audioElementRef.current.setSinkId
    ) {
      try {
        await audioElementRef.current.setSinkId(deviceId);
        console.info(`Changed output device to: ${deviceId}`);
      } catch (err) {
        console.error("Error changing output device:", err);
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    startForwarding();
    return () => {
      stopForwarding();
    };
  }, [startForwarding, stopForwarding]);

  return (
    <div>
      <div>
        <label>Output Device: </label>
        <select value={selectedDevice} onChange={handleOutputDeviceChange}>
          <option value="">System Default</option>
          {outputDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Device ${device.deviceId.substring(0, 8)}`}
            </option>
          ))}
        </select>
      </div>

      {/* Device Support Info */}
      {!window.Audio?.prototype?.setSinkId && (
        <div style={{ marginTop: "10px", color: "#ff8800", fontSize: "12px" }}>
          ⚠️ Your browser doesn&apos;t support output device selection. Audio
          will play on the default device.
        </div>
      )}
    </div>
  );
};

export default AudioOutput;
