import { FaBackward, FaForward, FaPause, FaPlay } from "react-icons/fa";
import { useSelector } from "react-redux";
import OverflowMenu from "../OverflowMenu/OverflowMenu";
import { getPlayer } from "../useInitSpotify";
import { formatArtists } from "../utils/colorUtils";
import styles from "./PlayerHeader.module.css";

const PlayerHeader = () => {
  const currentTrack = useSelector((state) => state.main.currentTrack);
  const isPaused = useSelector((state) => state.main.isPaused);
  const isPlayerReady = useSelector((state) => state.main.isPlayerReady);

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

  return (
    <div className={styles.header}>
      <div className={styles.headerSection}>
        <div className={styles.songInfo}>
          <div>
            <span className={styles.songTitle}>
              {currentTrack?.name || "song"}
            </span>{" "}
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
      <div className={styles.headerSection}>
        <FaBackward
          className={styles.button}
          onClick={handlePrevious}
          size="22"
        />
        {isPaused ? (
          <FaPlay
            className={styles.button}
            onClick={handlePlayPause}
            size="22"
          />
        ) : (
          <FaPause
            className={styles.button}
            onClick={handlePlayPause}
            size="22"
          />
        )}
        <FaForward className={styles.button} onClick={handleNext} size="22" />
      </div>
      <div className={styles.headerSection}>
        <OverflowMenu />
      </div>
    </div>
  );
};

export default PlayerHeader;
