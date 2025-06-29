import { useState } from "react";
import styles from "./App.module.css";
import AudioCapture from "../AudioCapture/AudioCapture";

const App = () => {
    const [audioData, setAudioData] = useState(null);

    const handleAudioData = (data) => {
        setAudioData(data);
    };

    return (
        <div className={styles.container}>
            <h1>Music Visualizer</h1>
            <AudioCapture onAudioData={handleAudioData} />
            
            {audioData && (
                <div>
                    <h3>Audio Data Preview:</h3>
                    <p>Sample Rate: {audioData.sampleRate} Hz</p>
                    <p>Buffer Length: {audioData.bufferLength}</p>
                    <p>Frequency Data (first 10): {audioData.frequencyData.slice(0, 10).join(', ')}</p>
                </div>
            )}
        </div>
    );
};

export default App;
