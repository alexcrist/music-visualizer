import { useState } from "react";
import { FaEllipsisV, FaSignOutAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import mainSlice from "../mainSlice";
import styles from "./OverflowMenu.module.css";

const OverflowMenu = ({ contrastColor = "#ffffff" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    
    // Reset Redux state
    dispatch(mainSlice.actions.setTokens(null));
    dispatch(mainSlice.actions.setCurrentTrack(null));
    dispatch(mainSlice.actions.setIsPlayerReady(false));
    dispatch(mainSlice.actions.setDeviceId(null));
    dispatch(mainSlice.actions.setPlaylists([]));
    dispatch(mainSlice.actions.setSelectedPlaylist(null));
    dispatch(mainSlice.actions.setArtworkColor(null));
    dispatch(mainSlice.actions.setIsPaused(true));
    dispatch(mainSlice.actions.setShowLogin(true));
    
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className={styles.menuContainer}>
      <button 
        className={styles.menuButton} 
        onClick={toggleMenu}
        aria-label="More options"
        style={{ color: contrastColor }}
      >
        <FaEllipsisV size="16" />
      </button>
      
      {isMenuOpen && (
        <>
          <div className={styles.overlay} onClick={closeMenu} />
          <div className={styles.dropdown}>
            <button className={styles.menuItem} onClick={handleLogout}>
              <FaSignOutAlt className={styles.menuIcon} />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OverflowMenu;