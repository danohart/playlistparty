import React, { useState } from "react";
import { FormControl, Button, Row, Col } from "react-bootstrap";

export default function SearchSpotify({ selectTrack }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState({ items: [] });

  async function handleSubmit() {
    await fetch(`/api/search?searchTerm=${searchTerm}`).then(async (res) =>
      setSearchData(await res.json())
    );
  }

  return (
    <>
      <Row>
        <Col>
          <h2>Search</h2>
          <FormControl
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='start typing....'
          />
          <Button
            className='w-50 mt-2'
            type='submit'
            onClick={handleSubmit}
            disabled={!searchTerm}
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
                        onClick={() => selectTrack(result.id)}
                      >
                        Select this song
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            ))}
          </Col>
        </Row>
      ) : null}
    </>
  );
}
