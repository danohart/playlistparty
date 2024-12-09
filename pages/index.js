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
      <Meta description='PlaylistParty is a social music challenge where you can test your knowledge and share your favorite tunes with friends.' />
      <h1 className='logo'>{siteTitle}</h1>
      <Row>
        <Col xs={12} lg={{ span: 8, offset: 2 }} className='mb-4 text-center'>
          A music-based social challenge where players anonymously add songs to
          a collaborative playlist, while other players have to guess who added
          each song. Sharpen your music knowledge and compete to see who can
          guess the most songs correctly.
        </Col>
      </Row>
      {!joinGame ? (
        <>
          {!spotifyPlaylist ? (
            <>
              <h2>Create a new playlist</h2>
              <Row>
                <Col className='mb-3'>
                  To start, create a playlist first. If you&apos;re just joining
                  an already existing playlist, click &quot;Join Room&quot;
                  below.
                </Col>
              </Row>
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
