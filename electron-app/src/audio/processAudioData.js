export const processAudioData = (audioData) => {
  if (!audioData || !audioData.frequencyData) return null;
  const volume = extractVolumeFeature(audioData.frequencyData);
  return {
    volume,
    frequencyData: audioData.frequencyData,
  };
};

const extractVolumeFeature = (frequencyData) => {
  const sum = frequencyData.reduce((acc, val) => acc + val, 0);
  let volume = sum / frequencyData.length / 255;
  volume = Math.sqrt(volume);
  return volume;
};
