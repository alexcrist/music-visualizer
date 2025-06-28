import styles from "./LoginScreen.module.css";

const LoginScreen = () => {
  return (
    <div className={styles.loginContainer}>
      <a
        href="http://localhost:3000/spotify/login"
        className={styles.loginLink}
      >
        Login to Spotify
      </a>
    </div>
  );
};

export default LoginScreen;
