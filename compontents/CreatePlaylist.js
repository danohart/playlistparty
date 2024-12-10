import { useState } from "react";
import { Row, Col, Button, FormControl, Spinner } from "react-bootstrap";
import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import ResponseMessages from "@/compontents/ResponseMessages";

export default function CreatePlaylist({ handleJoinGame, playlistSelect }) {
  const [playlistName, setPlaylistName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function uniquePlaylistName() {
    const uniqueNameConfig = {
      dictionaries: [adjectives, colors, animals],
      separator: "-",
      length: 3,
    };
    const uniqueName = uniqueNamesGenerator(uniqueNameConfig);

    setPlaylistName(uniqueName);
  }

  function handleChange(e) {
    e.preventDefault;
    const formData = e.target.value;

    setPlaylistName(formData);
  }

  async function createPlaylist(playlistInfo) {
    setLoading(true);
    fetch("/api/create-playlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: playlistInfo.toString(),
        description: "Playlist Shuffle",
        public: false,
      }),
    }).then(async (res) =>
      setMessage(
        ResponseMessages("playlist", res.status),
        playlistSelect({ target: { value: await res.json() } })
      )
    );
    setLoading(false);
  }

  return (
    <>
      <h2>Create a new playlist</h2>
      <Row>
        <Col className='mb-3'>
          To start, create a playlist first. If you&apos;re just joining an
          already existing playlist, click &quot;Join Room&quot; below.
        </Col>
      </Row>
      <Row>
        <Col xs={12} sm={12} md={12} lg={12}>
          <FormControl
            name='playlist-field'
            placeholder='Name your new playlist'
            value={playlistName}
            onChange={handleChange}
            className='playlist-field'
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <Button
            disabled={playlistName === "" || message === "Playlist created!"}
            onClick={() => createPlaylist(playlistName)}
            size='md'
            className='mt-2'
          >
            {!loading ? (
              "Create playlist"
            ) : (
              <Spinner animation='border' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </Spinner>
            )}
          </Button>
          <Button
            className='ms-2 mt-2'
            size='md'
            variant='outline-primary'
            onClick={() => uniquePlaylistName()}
          >
            Make up a name
          </Button>
        </Col>
      </Row>
      <Row className='mt-4'>
        <Col>
          <Button size='lg' onClick={() => handleJoinGame()} className='w-100'>
            Join Room
          </Button>
        </Col>
      </Row>
      {message ? (
        <Row>
          <Col>{message}</Col>
        </Row>
      ) : null}
    </>
  );
}
