import { Row, Col, Button, FormControl } from "react-bootstrap";

export default function SetUsername({
  handleLoginChange,
  handleLogin,
  createRoom,
}) {
  return (
    <>
      <Row className='mt-2'>
        <Col>
          <h4>Pick a name</h4>
          <FormControl
            type='text'
            className='mt-2'
            onChange={handleLoginChange}
            placeholder='Your name'
            maxLength={10}
            required
          />
          <Button className='mt-2' size='lg' onClick={handleLogin}>
            {createRoom ? "Create Room" : "Join Room"}
          </Button>
        </Col>
      </Row>
    </>
  );
}
