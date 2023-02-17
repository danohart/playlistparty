import { Row, Col, Button, FormControl } from "react-bootstrap";

export default function JoinRoom({ handleRoomChange }) {
  return (
    <>
      <Row className='mt-2'>
        <Col>
          <h2>Room Code</h2>
          <FormControl
            type='text'
            placeholder='ABCD'
            onChange={handleRoomChange}
          />
        </Col>
      </Row>
    </>
  );
}
