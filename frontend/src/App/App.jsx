import { useSelector } from "react-redux";
import AlbumDisplay from "../AlbumDisplay/AlbumDisplay";
import LoginScreen from "../LoginScreen/LoginScreen";
import PlayerHeader from "../PlayerHeader/PlayerHeader";
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
    <div
      className={styles.container}
      style={{
        backgroundColor: artworkColor ? artworkColor + "66" : "unset",
      }}
    >
      <PlayerHeader />
      <AlbumDisplay />
    </div>
  );
};

export default App;
