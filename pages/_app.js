import React, { useState, useEffect } from "react";
import "@/styles/style.scss";
import Layout from "@/compontents/Layout";
import { useRouter } from "next/router";

export default function App({ Component, pageProps: { ...pageProps } }) {
  const router = useRouter();
  const [username, setUsername] = useState(null);
  const [roomNumber, setRoomNumber] = useState(null);
  const [spotifyPlaylist, setSpotifyPlaylist] = useState(null);

  // Load data from localStorage on initial mount
  useEffect(() => {
    const storedRoom = window.localStorage.getItem("roomNumber");
    const storedUsername = window.localStorage.getItem("chatName");
    const storedPlaylist = window.localStorage.getItem("spotifyPlaylist");

    if (storedRoom) setRoomNumber(JSON.parse(storedRoom));
    if (storedUsername) setUsername(JSON.parse(storedUsername));
    if (storedPlaylist) setSpotifyPlaylist(JSON.parse(storedPlaylist));
  }, []);

  // Update localStorage whenever states change
  useEffect(() => {
    if (roomNumber) {
      window.localStorage.setItem("roomNumber", JSON.stringify(roomNumber));
    }
  }, [roomNumber]);

  useEffect(() => {
    if (username) {
      window.localStorage.setItem("chatName", JSON.stringify(username));
    }
  }, [username]);

  useEffect(() => {
    if (spotifyPlaylist) {
      window.localStorage.setItem(
        "spotifyPlaylist",
        JSON.stringify(spotifyPlaylist)
      );
    }
  }, [spotifyPlaylist]);

  const handleLogin = () => {
    if (!roomNumber) {
      const newRoom = Math.floor(Math.random() * 90000) + 10000;
      setRoomNumber(newRoom);
      router.push(`/select?roomNumber=${newRoom}`);
    } else {
      router.push(`/select?roomNumber=${roomNumber}`);
    }
  };

  const clearSession = () => {
    window.localStorage.removeItem("roomNumber");
    window.localStorage.removeItem("chatName");
    window.localStorage.removeItem("spotifyPlaylist");
    window.localStorage.removeItem("playlistId");

    if (roomNumber) {
      window.localStorage.removeItem(`revealed-${roomNumber}`);
      window.localStorage.removeItem(`songAdders-${roomNumber}`);
    }

    setRoomNumber(null);
    setUsername(null);
    setSpotifyPlaylist(null);
  };

  return (
    <Layout>
      <Component
        username={username}
        room={roomNumber}
        spotifyPlaylist={spotifyPlaylist}
        handleLoginChange={(e) => setUsername(e.target.value)}
        handleRoomChange={(e) => setRoomNumber(parseInt(e.target.value))}
        handlePlaylistChange={(e) => setSpotifyPlaylist(e.target.value)}
        handleLogin={handleLogin}
        clearSession={clearSession}
        {...pageProps}
      />
    </Layout>
  );
}
