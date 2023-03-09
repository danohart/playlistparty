import React, { useState } from "react";
import { Row, Col, Button } from "react-bootstrap";
import Meta from "@/compontents/Meta";
import { siteTitle } from "@/lib/constants";
import CreatePlaylist from "@/compontents/CreatePlaylist";
import JoinRoom from "@/compontents/JoinRoom";
import SetUsername from "@/compontents/SetUsername";

export default function Home({
  handleLogin,
  handleLoginChange,
  handleRoomChange,
  handlePlaylistChange,
  spotifyPlaylist,
}) {
  const [joinGame, setJoinGame] = useState(false);

  return (
    <>
      <Meta />
      <h1 className='logo'>{siteTitle}</h1>
      {!joinGame ? (
        <>
          {!spotifyPlaylist ? (
            <>
              <h2>Create a new playlist</h2>
              <CreatePlaylist playlistSelect={handlePlaylistChange} />
              <Row className='mt-4'>
                <Col>
                  <Button
                    size='lg'
                    onClick={() => setJoinGame(true)}
                    className='w-100'
                  >
                    Join Room
                  </Button>
                </Col>
              </Row>
            </>
          ) : (
            <>
              <h2>Playlist created!</h2>
              <SetUsername
                handleLoginChange={handleLoginChange}
                handleLogin={handleLogin}
                createRoom
              />
            </>
          )}
        </>
      ) : (
        <>
          <Button onClick={() => setJoinGame(!joinGame)}>&larr; Go back</Button>
          <JoinRoom handleRoomChange={handleRoomChange} />
          <SetUsername
            handleLoginChange={handleLoginChange}
            handleLogin={handleLogin}
          />
        </>
      )}
    </>
  );
}
