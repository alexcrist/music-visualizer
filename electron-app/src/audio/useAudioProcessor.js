import { useCallback, useRef } from "react";

const useAudioProcessor = (
  audioData,
  { bufferCount = 10, overlapRatio = 0.5 } = {}
) => {
  const audioBufferRef = useRef([]);
  const lastProcessTimeRef = useRef(0);

  const applyHanningWindow = useCallback((data) => {
    const windowedData = new Array(data.length);
    const N = data.length;

    for (let i = 0; i < N; i++) {
      const windowValue = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
      windowedData[i] = data[i] * windowValue;
    }

    return windowedData;
  }, []);

  const extractVolumeFeature = useCallback((frequencyData) => {
    const sum = frequencyData.reduce((acc, val) => acc + val, 0);
    return sum / frequencyData.length / 255; // Normalize to 0-1
  }, []);

  const processAudioData = useCallback(
    (data) => {
      if (!data || !data.frequencyData) return null;

      // Add new audio frame to buffer
      audioBufferRef.current.push({
        frequencyData: [...data.frequencyData],
        timestamp: Date.now(),
        sampleRate: data.sampleRate,
      });

      // Keep only the last N buffers
      if (audioBufferRef.current.length > bufferCount) {
        audioBufferRef.current = audioBufferRef.current.slice(-bufferCount);
      }

      // Only process if we have enough buffers and enough time has passed
      const now = Date.now();
      const timeSinceLastProcess = now - lastProcessTimeRef.current;
      const frameInterval = 1000 / 60; // Target 60 FPS processing

      if (
        audioBufferRef.current.length >= Math.min(3, bufferCount) &&
        timeSinceLastProcess >= frameInterval
      ) {
        lastProcessTimeRef.current = now;

        // Create overlapping windows
        const features = [];
        const stepSize = Math.max(
          1,
          Math.floor(audioBufferRef.current.length * (1 - overlapRatio))
        );

        for (let i = 0; i <= audioBufferRef.current.length - 3; i += stepSize) {
          const windowBuffers = audioBufferRef.current.slice(i, i + 3);

          // Combine buffers for this window
          const combinedData = windowBuffers.flatMap(
            (buffer) => buffer.frequencyData
          );

          // Apply windowing function
          const windowedData = applyHanningWindow(combinedData);

          // Extract volume feature
          const volume = extractVolumeFeature(windowedData);

          features.push({
            volume,
            timestamp: windowBuffers[windowBuffers.length - 1].timestamp,
            windowIndex: Math.floor(i / stepSize),
          });
        }

        // Get the most recent feature
        const currentFeature = features[features.length - 1];

        if (currentFeature) {
          return {
            current: currentFeature,
            history: features,
            bufferInfo: {
              totalBuffers: audioBufferRef.current.length,
              maxBuffers: bufferCount,
              overlapRatio,
            },
          };
        }
      }

      return null;
    },
    [bufferCount, overlapRatio, applyHanningWindow, extractVolumeFeature]
  );

  const features = audioData ? processAudioData(audioData) : null;

  return features;
};

export default useAudioProcessor;
