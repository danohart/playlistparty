import useSWR from "swr";
import fetcher from "../lib/fetcher";
import { Row, Col, Button } from "react-bootstrap";

export default function GetPlaylist({ playlistId }) {
  const { data, error, isLoading } = useSWR(
    `/api/get-playlist?playlistId=${playlistId}`,
    fetcher
  );
  if (error) return <div>failed to load</div>;
  if (isLoading)
    return (
      <Row>
        <Col xs={8} sm={8} md={8} lg={8}>
          Loading Playlist
        </Col>
      </Row>
    );

  return (
    <>
      <Row>
        <Col
          xs={{ span: 6, offset: 3 }}
          sm={{ span: 6, offset: 3 }}
          md={{ span: 6, offset: 3 }}
          lg={{ span: 6, offset: 3 }}
        >
          <h3 className='text-center'>Playlist: {data.name}</h3>
          <a href={data.uri} target='_blank'>
            <Button className='w-100'>Play Songs</Button>
          </a>
        </Col>
      </Row>
    </>
  );
}
