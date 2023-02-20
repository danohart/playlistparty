import React, { useState } from "react";
import "@/styles/style.scss";
import Layout from "@/compontents/Layout";
import { useRouter } from "next/router";

export default function App({ Component, pageProps: { ...pageProps } }) {
  const [username, setUsername] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [spotifyPlaylist, setSpotifyPlaylist] = useState(null);
  const router = useRouter();

  const handleLogin = () => {
    router.push(`/select?roomNumber=${roomNumber}`);
  };

  return (
    <Layout>
      <Component
        username={username}
        roomNumber={roomNumber}
        spotifyPlaylist={spotifyPlaylist}
        handleLoginChange={(e) => setUsername(e.target.value)}
        handleRoomChange={(e) => setRoomNumber(e.target.value)}
        handlePlaylistChange={(e) => setSpotifyPlaylist(e.target.value)}
        handleLogin={handleLogin}
        {...pageProps}
      />
    </Layout>
  );
}
