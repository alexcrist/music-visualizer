import { useRef } from "react";
import { extractDominantColor } from "../utils/colorUtils";
import styles from "./AlbumDisplay.module.css";

const AlbumDisplay = ({ currentTrack, onColorExtracted }) => {
  const imgRef = useRef(null);

  const handleImageLoad = async () => {
    if (imgRef.current && onColorExtracted) {
      const color = await extractDominantColor(imgRef.current);
      if (color) {
        onColorExtracted(color);
      }
    }
  };

  const albumImageUrl = currentTrack?.album?.images?.[2]?.url || "";

  return (
    <div className={styles.bodyContainer}>
      <canvas width="500" height="500" className={styles.canvas} />
      {albumImageUrl && (
        <img
          ref={imgRef}
          className={styles.albumArt}
          src={albumImageUrl}
          crossOrigin="anonymous"
          onLoad={handleImageLoad}
          alt="Album artwork"
        />
      )}
    </div>
  );
};

export default AlbumDisplay;
