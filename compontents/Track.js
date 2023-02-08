import { Row, Col } from "react-bootstrap";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

export default function Track({ ...props }) {
  const { data, error, isLoading } = useSWR("/api/stats/tracks", fetcher);

  if (error) return <div>failed to load</div>;
  if (isLoading) return "loading...";

  return (
    <Row>
      <Col
        xs={{ span: 10, offset: 1 }}
        sm={{ span: 10, offset: 1 }}
        md={{ span: 10, offset: 1 }}
        lg={{ span: 10, offset: 1 }}
      >
        {data.map((song) => (
          <Row className='track'>
            <Col xs={12} sm={12} md={12} lg={12} className='track-image'>
              <img src={song.coverImage.url} />
            </Col>
            <Col xs={12} sm={12} md={12} lg={12} className='track-title'>
              {song.title}
            </Col>
            <Col xs={12} sm={12} md={12} lg={12} className='track-artist'>
              {song.artist}
            </Col>
          </Row>
        ))}
      </Col>
    </Row>
  );
}
