import { Row, Col } from "react-bootstrap";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

export default function Track({ ...song }) {
  return (
    <Row>
      <Col
        xs={{ span: 10, offset: 1 }}
        sm={{ span: 10, offset: 1 }}
        md={{ span: 10, offset: 1 }}
        lg={{ span: 10, offset: 1 }}
      >
        <Row className='track'>
          <Col xs={12} sm={12} md={12} lg={12} className='track-image'>
            <img src={song.song.album.url} />
          </Col>
          <Col xs={12} sm={12} md={12} lg={12} className='track-title'>
            {song.song.title}
          </Col>
          <Col xs={12} sm={12} md={12} lg={12} className='track-artist'>
            {song.song.artist}
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
