import styles from "./LoginScreen.module.css";
import { config } from "../config/environment";

const LoginScreen = () => {
  return (
    <div className={styles.loginContainer}>
      <a
        href={`${config.apiBase}/spotify/login`}
        className={styles.loginLink}
      >
        Login to Spotify
      </a>
    </div>
  );
};

export default LoginScreen;
