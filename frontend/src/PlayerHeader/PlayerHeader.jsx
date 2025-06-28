import { useRef } from "react";
import { FaBackward, FaForward, FaPause, FaPlay } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import mainSlice from "../mainSlice";
import OverflowMenu from "../OverflowMenu/OverflowMenu";
import { getPlayer } from "../useInitSpotify";
import { extractDominantColor, getContrastColor } from "../utils/colorUtils";
import styles from "./PlayerHeader.module.css";

const formatArtists = (artists) => {
  return artists
    .map((artist) => artist.name)
    .reduce((names, name) => names + ", " + name, "")
    .substring(2);
};

const PlayerHeader = () => {
  const imgRef = useRef(null);
  const dispatch = useDispatch();
  const currentTrack = useSelector((state) => state.main.currentTrack);
  const isPaused = useSelector((state) => state.main.isPaused);
  const isPlayerReady = useSelector((state) => state.main.isPlayerReady);
  const artworkColor = useSelector((state) => state.main.artworkColor);

  const handlePlayPause = () => {
    if (isPlayerReady) {
      getPlayer().togglePlay();
    }
  };

  const handlePrevious = () => {
    if (isPlayerReady) {
      getPlayer().previousTrack();
    }
  };

  const handleNext = () => {
    if (isPlayerReady) {
      getPlayer().nextTrack();
    }
  };

  const handleImageLoad = async () => {
    if (imgRef.current) {
      const color = await extractDominantColor(imgRef.current);
      if (color) {
        dispatch(mainSlice.actions.setArtworkColor(color));
      }
    }
  };

  const albumImageUrl = currentTrack?.album?.images?.[2]?.url || "";
  const contrastColor = getContrastColor(artworkColor);

  return (
    <div
      className={styles.header}
      style={{
        backgroundColor: artworkColor || "#000000",
        color: contrastColor,
      }}
    >
      <div className={styles.albumSection}>
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

      <div className={styles.songSection}>
        <div className={styles.songInfo}>
          <div className={styles.titleRow}>
            <span className={styles.songTitle}>
              {currentTrack?.name || "song"}
            </span>
            <span className={styles.albumTitle}>
              {currentTrack?.album?.name || "album"}
            </span>
          </div>
          <div className={styles.artistName}>
            {currentTrack?.artists
              ? formatArtists(currentTrack.artists)
              : "artist"}
          </div>
        </div>
      </div>

      <div className={styles.controlsSection}>
        <FaBackward
          className={styles.button}
          onClick={handlePrevious}
          size="22"
          style={{ color: contrastColor }}
        />
        {isPaused ? (
          <FaPlay
            className={styles.button}
            onClick={handlePlayPause}
            size="22"
            style={{ color: contrastColor }}
          />
        ) : (
          <FaPause
            className={styles.button}
            onClick={handlePlayPause}
            size="22"
            style={{ color: contrastColor }}
          />
        )}
        <FaForward
          className={styles.button}
          onClick={handleNext}
          size="22"
          style={{ color: contrastColor }}
        />
        <OverflowMenu contrastColor={contrastColor} />
      </div>
    </div>
  );
};

export default PlayerHeader;
