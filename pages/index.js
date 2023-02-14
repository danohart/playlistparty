import React, { useState, useEffect } from "react";
import { Row, Col, Button, FormControl } from "react-bootstrap";
import AllPlaylists from "@/compontents/AllPlaylists";
import Meta from "@/compontents/Meta";
import { siteTitle } from "@/lib/constants";
import CreatePlaylist from "@/compontents/CreatePlaylist";
import JoinRoom from "@/compontents/JoinRoom";

export default function Home({ handleLogin, handleLoginChange }) {
  const [playlistId, setPlaylistId] = useState("Select Playlist");
  const [joinGame, setJoinGame] = useState(false);
  const [joinRoomNumber, setJoinRoomNumber] = useState("4567");

  useEffect(() => {
    if (localStorage.getItem("playlistId"))
      setPlaylistId(localStorage.getItem("playlistId"));
  }, []);

  function playlistSelect(e) {
    const selection = e.target.value;
    setPlaylistId(selection);
    localStorage.setItem("playlistId", selection);
  }

  function roomNumber(e) {
    setJoinRoomNumber(e.target.value);
  }

  return (
    <>
      <Meta />
      <h1>{siteTitle}</h1>
      {playlistId === "Select Playlist" ? (
        <>
          <CreatePlaylist playlistSelect={playlistSelect} />
          <JoinRoom />
          <FormControl
            type='text'
            className='mt-2'
            onChange={handleLoginChange}
            placeholder='Your name'
          />
          <Button
            className='mt-2'
            size='lg'
            onClick={() => handleLogin(joinRoomNumber)}
          >
            Or join a room
          </Button>
        </>
      ) : (
        <>
          <Row>
            <Col xs={12} sm={12} md={6} lg={6}>
              <h2>Playlist Selected</h2>
              <AllPlaylists
                playlistSelect={playlistSelect}
                playlistId={playlistId}
              />
            </Col>
          </Row>
          <JoinRoom />
          <Row>
            <Col className='mt-2'>
              <h2>Type a name</h2>
              <FormControl
                type='text'
                onChange={handleLoginChange}
                placeholder='Your name'
              />
              <Button
                className='mt-2'
                onClick={() => handleLogin(joinRoomNumber)}
              >
                Let&apos;s get started!
              </Button>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
