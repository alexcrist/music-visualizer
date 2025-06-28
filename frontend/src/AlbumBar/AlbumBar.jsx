import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import mainSlice from "../mainSlice";
import { extractDominantColor } from "../utils/colorUtils";
import styles from "./AlbumBar.module.css";

const AlbumBar = () => {
  const imgRef = useRef(null);
  const dispatch = useDispatch();
  const currentTrack = useSelector((state) => state.main.currentTrack);
  const artworkColor = useSelector((state) => state.main.artworkColor);

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
    <div 
      className={styles.albumBar}
      style={{
        backgroundColor: artworkColor || "#1a1a1a",
      }}
    >
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
      <div className={styles.albumInfo}>
        <span className={styles.albumName}>
          {currentTrack?.album?.name || "No album"}
        </span>
      </div>
    </div>
  );
};

export default AlbumBar;