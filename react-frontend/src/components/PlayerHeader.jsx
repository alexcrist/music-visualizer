import { FaBackward, FaPlay, FaPause, FaForward } from 'react-icons/fa';
import { formatArtists } from '../utils/colorUtils';
import styles from './PlayerHeader.module.css';

const PlayerHeader = ({ currentTrack, isPaused, player, isPlayerReady }) => {
  const handlePlayPause = () => {
    if (player && isPlayerReady) {
      player.togglePlay();
    }
  };

  const handlePrevious = () => {
    if (player && isPlayerReady) {
      player.previousTrack();
    }
  };

  const handleNext = () => {
    if (player && isPlayerReady) {
      player.nextTrack();
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.headerSection}>
        <div className={styles.songInfo}>
          <div>
            <span className={styles.songTitle}>
              {currentTrack?.name || 'song'}
            </span>
            <span className={styles.albumTitle}>
              {currentTrack?.album?.name || 'album'}
            </span>
          </div>
          <div className={styles.artistName}>
            {currentTrack?.artists ? formatArtists(currentTrack.artists) : 'artist'}
          </div>
        </div>
      </div>
      <div className={styles.headerSection}>
        <FaBackward 
          className={styles.button} 
          onClick={handlePrevious}
          size="1.5em"
        />
        {isPaused ? (
          <FaPlay 
            className={styles.button} 
            onClick={handlePlayPause}
            size="1.5em"
          />
        ) : (
          <FaPause 
            className={styles.button} 
            onClick={handlePlayPause}
            size="1.5em"
          />
        )}
        <FaForward 
          className={styles.button} 
          onClick={handleNext}
          size="1.5em"
        />
      </div>
    </div>
  );
};

export default PlayerHeader;