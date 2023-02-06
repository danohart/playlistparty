import React, { useState } from "react";
import Head from "next/head";
import { Row, Col, Button, FormControl } from "react-bootstrap";
import AllPlaylists from "@/compontents/AllPlaylists";

export default function Home() {
  const [playlistId, setPlaylistId] = useState("Select Playlist");
  const [songsToAdd, setSongsToAdd] = useState("");

  function addToPlaylist(songs) {
    const songId = songs.split("/", 10)[4].split("?", 1);

    const songUri = "spotify:track:" + songId;

    fetch("/api/add-to-playlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: [songUri], playlistId }),
    });
  }

  function handleChange(e) {
    e.preventDefault;
    const formData = e.target.value;

    setSongsToAdd(formData);
  }

  function playlistSelect(e) {
    const selection = e.target.value;
    setPlaylistId(selection);
  }

  return (
    <>
      <Head>
        <title>Playlist Shuffle</title>
        <meta
          name='description'
          content='Have your group add songs to a playlist, play the playlist, then guess who added it.'
        />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main>
        <h1 className='main-title'>Spotify</h1>
        <Row>
          <Col xs={12} sm={12} md={6} lg={6}>
            <h2>Pick a playlist</h2>
            <AllPlaylists playlistSelect={playlistSelect} />
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <Row>
              <Col xs={12} sm={12} md={12} lg={12}>
                <h2>Song to add</h2>
              </Col>
              <Col xs={12} sm={12} md={12} lg={12}>
                <FormControl
                  placeholder='Enter song id'
                  value={songsToAdd}
                  onChange={handleChange}
                />
              </Col>
            </Row>
            <Row className='mt-2'>
              <Col>
                <Button
                  disabled={
                    process.env.NODE_ENV !== "development" ||
                    playlistId === "Select Playlist" ||
                    songsToAdd === ""
                  }
                  onClick={() => addToPlaylist(songsToAdd)}
                  size='lg'
                >
                  Add to playlist
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </main>
    </>
  );
}
