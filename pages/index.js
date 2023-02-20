import React, { useState, useEffect } from "react";
import { Row, Col, Button, FormControl } from "react-bootstrap";
import AllPlaylists from "@/compontents/AllPlaylists";
import Meta from "@/compontents/Meta";
import { siteTitle } from "@/lib/constants";
import CreatePlaylist from "@/compontents/CreatePlaylist";
import JoinRoom from "@/compontents/JoinRoom";

export default function Home({
  handleLogin,
  handleLoginChange,
  handleRoomChange,
  handlePlaylistChange,
}) {
  const [playlistId, setPlaylistId] = useState("Select Playlist");
  const [joinGame, setJoinGame] = useState(false);

  return (
    <>
      <Meta />
      <h1>{siteTitle}</h1>
      {playlistId === "Select Playlist" ? (
        <>
          <h2>Create a new playlist</h2>
          <CreatePlaylist playlistSelect={handlePlaylistChange} />
        </>
      ) : (
        <>
          <Row>
            <Col xs={12} sm={12} md={6} lg={6}>
              <h2>Playlist Selected</h2>
              <AllPlaylists
                playlistSelect={handlePlaylistChange}
                playlistId={playlistId}
              />
            </Col>
          </Row>
        </>
      )}
      {playlistId === "Select Playlist" ? <h1>OR</h1> : null}
      <Row className='mt-4'>
        <Col>
          <h2>Join a room</h2>
        </Col>
      </Row>
      <hr />
      <JoinRoom handleRoomChange={handleRoomChange} />
      <Row className='mt-2'>
        <Col>
          <h2>Pick a name</h2>
          <FormControl
            type='text'
            className='mt-2'
            onChange={handleLoginChange}
            placeholder='Your name'
            required
          />
          <Button className='mt-2' size='lg' onClick={handleLogin}>
            Join room
          </Button>
        </Col>
      </Row>
    </>
  );
}
