import React, { useState } from "react";
import { Row, Col, FormControl } from "react-bootstrap";

export default function JoinRoom({ handleRoomChange }) {
  const [randomRoomNumber, setRandomRoomNumber] = useState(
    Math.floor(Math.random() * 90000) + 10000
  );
  return (
    <>
      <Row className='mt-2'>
        <Col>
          <h2>Room Code</h2>
          <FormControl
            type='text'
            placeholder={"Five digit code like: " + randomRoomNumber}
            onChange={handleRoomChange}
          />
        </Col>
      </Row>
    </>
  );
}
