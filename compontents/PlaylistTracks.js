import useSWR from "swr";
import fetcher from "../lib/fetcher";
import { Form, Button, Row, Col } from "react-bootstrap";
import Track from "./Track";

export default function PlaylistTracks(props) {
  const { data, error, isLoading } = useSWR(
    `/api/playlist-tracks?id=${props.playlistId}`,
    fetcher
  );
  if (error) return <div>failed to load</div>;
  if (isLoading)
    return (
      <Row>
        <Col xs={8} sm={8} md={8} lg={8}>
          Loading...
        </Col>
      </Row>
    );

  return (
    <>
      <Row>
        {data.map((song) => (
          <Track {...song} key={song.id} />
        ))}
      </Row>
    </>
  );
}
