import { Row, Col, FormControl } from "react-bootstrap";

export default function JoinRoom({ handleRoomChange }) {
  return (
    <>
      <Row className='mt-2'>
        <Col>
          <h4>Room Code</h4>
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
