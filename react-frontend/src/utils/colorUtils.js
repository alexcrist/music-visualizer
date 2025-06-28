export const extractDominantColor = (imageElement) => {
  return new Promise((resolve) => {
    if (!window.ColorThief) {
      resolve(null);
      return;
    }
    
    const colorThief = new window.ColorThief();
    try {
      const [r, g, b] = colorThief.getColor(imageElement);
      resolve(`rgb(${r}, ${g}, ${b})`);
    } catch (error) {
      console.error('Failed to extract color:', error);
      resolve(null);
    }
  });
};

export const formatArtists = (artists) => {
  return artists 
    .map((artist) => artist.name)
    .reduce((names, name) => names + ', ' + name, '')
    .substring(2);
};