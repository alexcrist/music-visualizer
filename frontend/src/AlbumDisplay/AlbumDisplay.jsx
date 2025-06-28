import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import mainSlice from "../mainSlice";
import { extractDominantColor } from "../utils/colorUtils";
import styles from "./AlbumDisplay.module.css";

const AlbumDisplay = () => {
  const imgRef = useRef(null);
  const dispatch = useDispatch();
  const currentTrack = useSelector((state) => state.main.currentTrack);

  const handleImageLoad = async () => {
    if (imgRef.current) {
      const color = await extractDominantColor(imgRef.current);
      if (color) {
        dispatch(mainSlice.actions.setArtworkColor(color));
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
