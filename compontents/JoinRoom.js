import { Row, Col, Button, FormControl } from "react-bootstrap";

export default function JoinRoom({ roomNumber }) {
  return (
    <>
      <Row className='mt-2'>
        <Col>
          <FormControl type='text' placeholder='ABCD' onChange={roomNumber} />
        </Col>
      </Row>
    </>
  );
}
