export const processAudioData = (audioData) => {
  if (!audioData || !audioData.frequencyData) return null;
  const volume = extractVolumeFeature(audioData.frequencyData);
  return { volume };
};

const extractVolumeFeature = (frequencyData) => {
  const sum = frequencyData.reduce((acc, val) => acc + val, 0);
  return sum / frequencyData.length / 255;
};
