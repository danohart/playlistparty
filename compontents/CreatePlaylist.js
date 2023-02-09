import { useState } from "react";
import { Row, Col, Button, FormControl } from "react-bootstrap";
import ResponseMessages from "@/compontents/ResponseMessages";

export default function CreatePlaylist() {
  const [playlistName, setPlaylistName] = useState("");
  const [message, setMessage] = useState("");

  function handleChange(e) {
    e.preventDefault;
    const formData = e.target.value;

    setPlaylistName(formData);
  }

  function createPlaylist(playlistInfo) {
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
    }).then((res) => setMessage(ResponseMessages("playlist", res.status)));
  }

  return (
    <>
      <Row>
        <Col xs={12} sm={12} md={12} lg={12}>
          <FormControl
            placeholder='Name your new playlist'
            value={playlistName}
            onChange={handleChange}
          />
        </Col>
      </Row>
      <Row className='mt-2'>
        <Col>
          <Button
            disabled={
              process.env.NODE_ENV !== "development" || playlistName === ""
            }
            onClick={() => createPlaylist(playlistName)}
            size='lg'
          >
            Create playlist
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
