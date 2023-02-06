import Meta from "@/compontents/Meta";
import { Row, Col, Button } from "react-bootstrap";
import Track from "../compontents/Track";

export default function Welcome() {
  return (
    <Row>
      <Meta title='Welcome' />
      <Col className='fade-in'>
        <h1>Welcome</h1>
        <Row className='button-group'>
          <Col>
            <Button>Get Started</Button>
          </Col>
          <Col>
            <Button variant='outline-info'>Learn More</Button>
          </Col>
        </Row>
        <Track />
      </Col>
    </Row>
  );
}
