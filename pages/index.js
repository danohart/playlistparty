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
  clearSession,
}) {
  const [gameChoice, setGameChoice] = useState(null);

  const handleJoinChoice = () => {
    clearSession();
    setGameChoice("join");
  };

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
      {!gameChoice ? (
        <Row className='mt-4'>
          <Col xs={12} md={6} className='text-center mb-3'>
            <Button
              size='lg'
              className='w-75'
              onClick={() => setGameChoice("create")}
            >
              Create New Room
            </Button>
          </Col>
          <Col xs={12} md={6} className='text-center mb-3'>
            <Button
              size='lg'
              variant='primary'
              className='w-75'
              onClick={handleJoinChoice}
            >
              Join Existing Room
            </Button>
          </Col>
        </Row>
      ) : gameChoice === "create" ? (
        <>
          {!spotifyPlaylist ? (
            <>
              <Button
                variant='primary'
                className='mb-3'
                onClick={() => setGameChoice(null)}
              >
                ← Back
              </Button>
              <CreatePlaylist playlistSelect={handlePlaylistChange} />
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
          <Button
            variant='primary'
            className='mb-3'
            onClick={() => {
              clearSession();
              setGameChoice(null);
            }}
          >
            ← Back
          </Button>
          <h2>Join a room</h2>
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
