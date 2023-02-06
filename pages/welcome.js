import { Row, Col, Button } from "react-bootstrap";

export default function Welcome() {
  return (
    <Row>
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
      </Col>
    </Row>
  );
}
