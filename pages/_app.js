import React, { useState, useEffect } from "react";
import "@/styles/style.scss";
import Layout from "@/compontents/Layout";
import { useRouter } from "next/router";

export default function App({ Component, pageProps: { ...pageProps } }) {
  const router = useRouter();
  const [username, setUsername] = useState(null);
  const [roomNumber, setRoomNumber] = useState(null);
  const [playlistId, setPlaylistId] = useState(null);

  // Load data from localStorage on initial mount
  useEffect(() => {
    try {
      const storedRoom = window.localStorage.getItem("roomNumber");
      const storedUsername = window.localStorage.getItem("chatName");
      const storedPlaylist = window.localStorage.getItem("playlistId");

      if (storedRoom) setRoomNumber(JSON.parse(storedRoom));
      if (storedUsername) setUsername(JSON.parse(storedUsername));
      if (storedPlaylist) {
        // Handle both cases: stored object or direct string
        const parsedPlaylist = JSON.parse(storedPlaylist);
        setPlaylistId(parsedPlaylist.value || parsedPlaylist);
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      clearSession();
    }
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
    if (playlistId) {
      // Store just the ID string
      window.localStorage.setItem("playlistId", JSON.stringify(playlistId));
    }
  }, [playlistId]);

  const handleLogin = () => {
    if (!roomNumber) {
      const newRoom = Math.floor(Math.random() * 90000) + 10000;
      setRoomNumber(newRoom);
      router.push(`/select?roomNumber=${newRoom}`);
    } else {
      router.push(`/select?roomNumber=${roomNumber}`);
    }
  };

  const handlePlaylistChange = (newPlaylistId) => {
    const actualId =
      typeof newPlaylistId === "object"
        ? newPlaylistId.target.value
        : newPlaylistId;
    setPlaylistId(actualId);
  };

  const clearSession = () => {
    const keysToRemove = ["roomNumber", "chatName", "playlistId"];

    keysToRemove.forEach((key) => window.localStorage.removeItem(key));

    if (roomNumber) {
      window.localStorage.removeItem(`revealed-${roomNumber}`);
      window.localStorage.removeItem(`songAdders-${roomNumber}`);
    }

    setRoomNumber(null);
    setUsername(null);
    setPlaylistId(null);
  };

  return (
    <Layout>
      <Component
        username={username}
        room={roomNumber}
        spotifyPlaylist={playlistId}
        handleLoginChange={(e) => setUsername(e.target.value)}
        handleRoomChange={(e) => setRoomNumber(parseInt(e.target.value))}
        handlePlaylistChange={handlePlaylistChange}
        handleLogin={handleLogin}
        clearSession={clearSession}
        {...pageProps}
      />
    </Layout>
  );
}
