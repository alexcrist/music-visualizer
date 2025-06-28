import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { config } from "../config/environment";
import mainSlice from "../mainSlice";
import styles from "./PlaylistList.module.css";

const PlaylistList = () => {
  const dispatch = useDispatch();
  const tokens = useSelector((state) => state.main.tokens);
  const playlists = useSelector((state) => state.main.playlists);

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!tokens?.accessToken) return;

      try {
        const response = await fetch(`${config.apiBase}/spotify/playlists`, {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });
        const data = await response.json();
        dispatch(mainSlice.actions.setPlaylists(data.items || []));
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
      }
    };

    fetchPlaylists();
  }, [tokens?.accessToken, dispatch]);

  const handlePlaylistClick = async (playlist) => {
    if (!tokens?.accessToken) return;

    try {
      dispatch(mainSlice.actions.setSelectedPlaylist(playlist));
      
      const response = await fetch(`${config.apiBase}/spotify/play`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playlistUri: playlist.uri,
        }),
      });

      if (!response.ok) {
        console.error("Failed to start playback");
      }
    } catch (error) {
      console.error("Failed to play playlist:", error);
    }
  };

  if (!playlists.length) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Your Playlists</h2>
        <p className={styles.noPlaylists}>No playlists found</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Your Playlists</h2>
      <div className={styles.playlistGrid}>
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className={styles.playlistCard}
            onClick={() => handlePlaylistClick(playlist)}
          >
            {playlist.images?.[0]?.url && (
              <img
                src={playlist.images[0].url}
                alt={playlist.name}
                className={styles.playlistImage}
              />
            )}
            <div className={styles.playlistInfo}>
              <h3 className={styles.playlistName}>{playlist.name}</h3>
              <p className={styles.playlistTracks}>
                {playlist.tracks.total} tracks
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistList;