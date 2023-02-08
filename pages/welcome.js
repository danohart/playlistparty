import Meta from "@/compontents/Meta";
import { Row, Col, Button } from "react-bootstrap";
import CurrentlyPlaying from "../compontents/CurrentlyPlaying";
import { useRouter } from "next/router";

export default function Welcome() {
  const router = useRouter();

  function authSpotify() {
    const accountUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=http://localhost:3000/select&scope=user-read-currently-playing user-top-read playlist-modify-public playlist-read-collaborative playlist-read-private playlist-modify-private`;

    router.push(accountUrl);
  }
  return (
    <Row>
      <Meta title='Welcome' />
      <Col className='fade-in'>
        <h1>Welcome</h1>
        <Row className='button-group'>
          <Col>
            <Button onClick={authSpotify}>Get Started</Button>
          </Col>
          <Col>
            <Button variant='outline-info'>Learn More</Button>
          </Col>
        </Row>
        <CurrentlyPlaying />
      </Col>
    </Row>
  );
}
