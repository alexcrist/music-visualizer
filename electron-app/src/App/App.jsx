import { useCallback, useState } from "react";
import Card from "../Card/Card";
import AudioCapture from "../audio/AudioCapture/AudioCapture";
import AudioOutput from "../audio/AudioOutput/AudioOutput";
import { processAudioData } from "../audio/processAudioData";
import { FrequencyVisualizer } from "../visualizers/FrequencyVisualizer";
import { ThreeJSFrequencyVisualizer } from "../visualizers/ThreeJSFrequencyVisualizer";
import Visualizer from "../visualizers/Visualizer/Visualizer";
import styles from "./App.module.css";

const freqVisualizer = new FrequencyVisualizer({
  color: "#ff6b6b",
  backgroundColor: "#000",
});

const threeJSVisualizer = new ThreeJSFrequencyVisualizer({
  color: "#ff6b6b",
  backgroundColor: "#000",
});

const App = () => {
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [audioData, setAudioData] = useState(null);
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [audioStream, setAudioStream] = useState(null);

  const handleAudioData = useCallback(
    (audioData) => {
      setAudioData(audioData);
      const sampleRate = audioData?.sampleRate;
      const bufferLength = audioData?.bufferLength;
      const newDelaySeconds = bufferLength / sampleRate;
      if (delaySeconds !== newDelaySeconds) {
        setDelaySeconds(newDelaySeconds);
      }
      const features = processAudioData(audioData);
      setAudioFeatures(features);
    },
    [delaySeconds]
  );

  const handleAudioStream = useCallback((streamInfo) => {
    setAudioStream(streamInfo);
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Music Visualizer</h1>

      <Card>
        <h3 className={styles.subtitle}>Audio Devices</h3>
        <div className={styles.lineItem}>
          <AudioCapture
            onAudioData={handleAudioData}
            onAudioStream={handleAudioStream}
          />
        </div>
        <AudioOutput
          audioContext={audioStream?.audioContext}
          sourceNode={audioStream?.source}
          delaySeconds={delaySeconds}
        />
      </Card>

      {/* Audio Configuration Info */}
      {audioData && (
        <Card>
          <h3 className={styles.subtitle}>Audio Configuration</h3>
          <div>
            <p className={styles.lineItem}>
              Sample Rate: {audioData.sampleRate} Hz
            </p>
            <p className={styles.lineItem}>
              Buffer Length: {audioData.bufferLength}
            </p>
            <p className={styles.lineItem}>
              Delay: {Math.round(delaySeconds * 1000)} ms
            </p>
          </div>
        </Card>
      )}

      {/* Frequency Visualizer */}
      <Card>
        <h3 className={styles.subtitle}>Frequency Spectrum</h3>
        <Visualizer
          features={audioFeatures}
          visualizer={freqVisualizer}
          sampleRate={audioData?.sampleRate}
          bufferLength={audioData?.bufferLength}
          width={600}
          height={200}
        />
      </Card>

      {/* 3D Frequency Visualizer */}
      <Card>
        <h3 className={styles.subtitle}>3D Frequency Spectrum</h3>
        <Visualizer
          features={audioFeatures}
          visualizer={threeJSVisualizer}
          sampleRate={audioData?.sampleRate}
          bufferLength={audioData?.bufferLength}
          width={600}
          height={400}
        />
      </Card>
    </div>
  );
};

export default App;
