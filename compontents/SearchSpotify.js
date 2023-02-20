import React, { useState } from "react";
import { FormControl, Button, Row, Col } from "react-bootstrap";
import addSongsMessage from "./ResponseMessages";

export default function SearchSpotify({ playlistId, username, roomNumber }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState({ items: [] });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    await fetch(`/api/search?searchTerm=${searchTerm}`).then(async (res) =>
      setSearchData(await res.json())
    );
  }

  function addToPlaylist(song) {
    const songUri = "spotify:track:" + song;
    setLoading(true);
    fetch("/api/add-to-playlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: [songUri],
        playlistId,
        username,
        roomNumber,
      }),
    }).then(
      (res) => setMessage(addSongsMessage("songs", res.status)),
      setSearchData({ items: [] }),
      setSearchTerm(null),
      setTimeout(setMessage(null), 3000)
    );

    setLoading(false);
  }

  return (
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
              <Row>
                <Col xs={12} sm={12} md={12} lg={12}>
                  <Row className='track'>
                    <Col xs={4} sm={4} md={4} lg={4} className='track-image'>
                      <img src={result.album.images[1].url} />
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
                        onClick={() => addToPlaylist(result.id)}
                      >
                        {!loading ? (
                          "Add to playlist"
                        ) : (
                          <Spinner animation='border' role='status'>
                            <span className='visually-hidden'>Loading...</span>
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
            <h2>{message}</h2>
          </Col>
        </Row>
      )}
    </>
  );
}
