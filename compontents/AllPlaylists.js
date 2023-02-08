import useSWR from "swr";
import fetcher from "../lib/fetcher";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function AllPlaylists(props) {
  const { data, error, isLoading } = useSWR("/api/all-playlists", fetcher);
  if (error) return <div>failed to load</div>;
  if (isLoading)
    return (
      <Row>
        <Col xs={8} sm={8} md={8} lg={8}>
          <Form.Select
            onChange={props.playlistSelect}
            aria-label='Default select'
          >
            <option>Loading Playlists</option>
          </Form.Select>
        </Col>
      </Row>
    );

  function removePlaylistId() {
    props.playlistSelect({ target: { value: "Select Playlist" } });
    localStorage.removeItem("playlistId");
  }

  return (
    <>
      <Row>
        <Col xs={8} sm={8} md={8} lg={8}>
          <Form.Select
            onChange={props.playlistSelect}
            aria-label='Default select'
          >
            <option disabled selected={props.playlistId === "Select Playlist"}>
              Select Playlist
            </option>
            {data.map((playlist) => (
              <option
                selected={props.playlistId === playlist.id}
                value={playlist.id}
                xs={12}
                sm={12}
                md={12}
                lg={12}
                key={playlist.id}
              >
                {playlist.name}
              </option>
            ))}
          </Form.Select>
        </Col>
        {localStorage.getItem("playlistId") ? (
          <Col>
            <Button onClick={removePlaylistId}>Reset</Button>
          </Col>
        ) : null}
      </Row>
    </>
  );
}
