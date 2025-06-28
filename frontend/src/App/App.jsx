import { useSelector } from "react-redux";
import AlbumBar from "../AlbumBar/AlbumBar";
import LoginScreen from "../LoginScreen/LoginScreen";
import PlayerHeader from "../PlayerHeader/PlayerHeader";
import PlaylistList from "../PlaylistList/PlaylistList";
import { useInitSpotify } from "../useInitSpotify";
import styles from "./App.module.css";

const App = () => {
  useInitSpotify();
  const artworkColor = useSelector((state) => state.main.artworkColor);
  const showLogin = useSelector((state) => state.main.showLogin);
  if (showLogin) {
    return <LoginScreen />;
  }

  return (
    <div className={styles.container}>
      <PlayerHeader />
      <AlbumBar />
      <PlaylistList />
    </div>
  );
};

export default App;
