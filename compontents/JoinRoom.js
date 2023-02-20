import { Row, Col, FormControl } from "react-bootstrap";

export default function JoinRoom({ handleRoomChange }) {
  return (
    <>
      <Row className='mt-2'>
        <Col>
          <h2>Room Code</h2>
          <FormControl
            type='text'
            placeholder={"Five digit code"}
            onChange={handleRoomChange}
          />
        </Col>
      </Row>
    </>
  );
}
