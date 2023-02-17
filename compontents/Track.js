import { Row, Col } from "react-bootstrap";

export default function Track(song) {
  if (song.minimal)
    return (
      <Col xs={12} sm={12} md={12} lg={12}>
        <Row className='track'>
          <Col xs={4} sm={4} md={4} lg={4} className='track-image'>
            <img src={song.album.url} />
          </Col>
          <Col xs={8} sm={8} md={8} lg={8}>
            <div className='track-title text-start'>{song.title}</div>
            <div className='track-artist text-start'>{song.artist}</div>
          </Col>
        </Row>
      </Col>
    );

  return (
    <Col xs={6} sm={6} md={6} lg={6} className='track'>
      <Col xs={12} sm={12} md={12} lg={12} className='track-image'>
        <img src={song.album.url} />
      </Col>
      <Col xs={12} sm={12} md={12} lg={12} className='track-title'>
        {song.title}
      </Col>
      <Col xs={12} sm={12} md={12} lg={12} className='track-artist'>
        {song.artist}
      </Col>
    </Col>
  );
}
