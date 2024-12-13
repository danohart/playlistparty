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
          Build the perfect playlist together. Create a room, drop in your
          favorite tracks, chat about music, and discover new songs through
          friends. Your collaborative soundtrack starts here.
        </Col>
      </Row>
      {!gameChoice ? (
        <>
          <Row className='my-4'>
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
          <Row>
            <Col
              xs={12}
              lg={{ span: 8, offset: 2 }}
              className='mb-4 text-center'
            >
              <Row className='g-4'>
                <Col xs={12} md={4}>
                  <div className='feature-card'>
                    <h3>Create Together</h3>
                    <p>
                      Start a room, invite friends, and build playlists in
                      real-time. Add your favorite tracks and see what others
                      are contributing.
                    </p>
                  </div>
                </Col>

                <Col xs={12} md={4}>
                  <div className='feature-card'>
                    <h3>Share Stories</h3>
                    <p>
                      Every song has a story. Add notes to your picks, share
                      memories, or tell others why this track means something
                      special.
                    </p>
                  </div>
                </Col>

                <Col xs={12} md={4}>
                  <div className='feature-card'>
                    <h3>Connect Through Music</h3>
                    <p>
                      Chat with friends, react to song choices, and discover new
                      music through people you trust. Perfect for parties, road
                      trips, or daily listening.
                    </p>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </>
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
