// components/SearchSpotify.js
import React, { useState, useEffect } from "react";
import {
  FormControl,
  Button,
  Row,
  Col,
  Spinner,
  Tabs,
  Tab,
  Alert,
} from "react-bootstrap";
import addSongsMessage from "./ResponseMessages";
import UserSpotifyAuth from "./UserSpotifyAuth";
import UserPlaylists from "./UserPlaylists";

export default function SearchSpotify({ playlistId, username, roomNumber }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState({ items: [] });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [hasAddedSong, setHasAddedSong] = useState(false);
  const [addedSongInfo, setAddedSongInfo] = useState(null);

  // Check if user has already added a song to this room
  useEffect(() => {
    if (username && roomNumber) {
      const userSongs = JSON.parse(
        localStorage.getItem(`userSongs-${roomNumber}`) || "{}"
      );
      if (userSongs[username]) {
        setHasAddedSong(true);
        setAddedSongInfo(userSongs[username]);
      } else {
        setHasAddedSong(false);
        setAddedSongInfo(null);
      }
    }
  }, [username, roomNumber]);

  async function handleSubmit() {
    await fetch(`/api/search?searchTerm=${searchTerm}`).then(async (res) =>
      setSearchData(await res.json())
    );
  }

  function addToPlaylist(song, songName, artistName) {
    // Check again before adding
    if (hasAddedSong) {
      alert("You've already added a song to this playlist!");
      return;
    }

    const songUri = "spotify:track:" + song;
    setLoading(true);

    fetch("/api/add-to-playlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: [songUri],
        trackId: song,
        playlistId,
        username,
        roomNumber,
      }),
    })
      .then((res) => {
        if (res.ok) {
          // Store that this user has added a song
          const userSongs = JSON.parse(
            localStorage.getItem(`userSongs-${roomNumber}`) || "{}"
          );
          userSongs[username] = {
            trackId: song,
            trackName: songName,
            artistName: artistName,
            addedAt: new Date().toISOString(),
          };
          localStorage.setItem(
            `userSongs-${roomNumber}`,
            JSON.stringify(userSongs)
          );

          setHasAddedSong(true);
          setAddedSongInfo(userSongs[username]);
          setMessage(addSongsMessage("songs", res.status));
        } else {
          setMessage(addSongsMessage("songs", res.status));
        }
        setSearchData({ items: [] });
        setSearchTerm("");
        setTimeout(() => setMessage(null), 3000);
      })
      .catch((error) => {
        console.error("Error adding song:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const handleRemoveRestriction = () => {
    if (
      window.confirm(
        "Are you sure you want to remove your song and add a different one?"
      )
    ) {
      const userSongs = JSON.parse(
        localStorage.getItem(`userSongs-${roomNumber}`) || "{}"
      );
      delete userSongs[username];
      localStorage.setItem(
        `userSongs-${roomNumber}`,
        JSON.stringify(userSongs)
      );
      setHasAddedSong(false);
      setAddedSongInfo(null);
    }
  };

  return (
    <>
      {hasAddedSong && addedSongInfo && (
        <Alert variant='info' className='mb-3'>
          <Alert.Heading>✓ You've added your song!</Alert.Heading>
          <p className='mb-2'>
            <strong>{addedSongInfo.trackName}</strong> by{" "}
            {addedSongInfo.artistName}
          </p>
          <small className='text-muted'>
            You can only add one song per room to keep things fair and fun!
          </small>
          <hr />
          <div className='d-flex justify-content-end'>
            <Button
              variant='outline-secondary'
              size='sm'
              onClick={handleRemoveRestriction}
            >
              Change My Song
            </Button>
          </div>
        </Alert>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className='mb-3'
      >
        <Tab eventKey='search' title='Search Songs' disabled={hasAddedSong}>
          {hasAddedSong ? (
            <Alert variant='warning' className='text-center'>
              You've already added a song to this playlist. Click "Change My
              Song" above if you want to add a different one.
            </Alert>
          ) : (
            <>
              <Row>
                <Col>
                  <h2>Find a song</h2>
                  <FormControl
                    type='text'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder='start typing....'
                  />
                  <Button
                    className='w-50 mt-2'
                    type='submit'
                    disabled={!searchTerm}
                    onClick={handleSubmit}
                  >
                    Search
                  </Button>
                </Col>
              </Row>
              {searchTerm ? (
                <Row>
                  <Col>
                    {searchData.items.map((result) => (
                      <Row key={result.id}>
                        <Col xs={12} sm={12} md={12} lg={12}>
                          <Row className='track'>
                            <Col
                              xs={4}
                              sm={4}
                              md={4}
                              lg={4}
                              className='track-image'
                            >
                              <img
                                src={result.album.images[1].url}
                                alt={result.name}
                              />
                            </Col>
                            <Col xs={8} sm={8} md={8} lg={8}>
                              <div className='track-title text-start'>
                                {result.name}
                              </div>
                              <div className='track-artist text-start'>
                                {result.artists[0].name}
                              </div>
                              <Button
                                className='mt-2'
                                onClick={() =>
                                  addToPlaylist(
                                    result.id,
                                    result.name,
                                    result.artists[0].name
                                  )
                                }
                                disabled={loading}
                              >
                                {!loading ? (
                                  "Add to playlist"
                                ) : (
                                  <Spinner animation='border' role='status'>
                                    <span className='visually-hidden'>
                                      Loading...
                                    </span>
                                  </Spinner>
                                )}
                              </Button>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    ))}
                  </Col>
                </Row>
              ) : (
                <Row>
                  <Col>
                    <p>{message}</p>
                  </Col>
                </Row>
              )}
            </>
          )}
        </Tab>

        <Tab
          eventKey='myplaylists'
          title='My Playlists'
          disabled={hasAddedSong}
        >
          {hasAddedSong ? (
            <Alert variant='warning' className='text-center'>
              You've already added a song to this playlist. Click "Change My
              Song" above if you want to add a different one.
            </Alert>
          ) : (
            <>
              <UserSpotifyAuth onAuthChange={setIsUserAuthenticated} />
              {isUserAuthenticated && (
                <UserPlaylists
                  playlistId={playlistId}
                  username={username}
                  roomNumber={roomNumber}
                  onSongAdded={(trackId, trackName, artistName) => {
                    const userSongs = JSON.parse(
                      localStorage.getItem(`userSongs-${roomNumber}`) || "{}"
                    );
                    userSongs[username] = {
                      trackId,
                      trackName,
                      artistName,
                      addedAt: new Date().toISOString(),
                    };
                    localStorage.setItem(
                      `userSongs-${roomNumber}`,
                      JSON.stringify(userSongs)
                    );
                    setHasAddedSong(true);
                    setAddedSongInfo(userSongs[username]);
                  }}
                />
              )}
            </>
          )}
        </Tab>
      </Tabs>
    </>
  );
}
