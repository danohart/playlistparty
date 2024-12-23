import { useState } from "react";
import { Row, Col, Button, FormControl, Alert } from "react-bootstrap";

export default function SetUsername({
  handleLoginChange,
  handleLogin,
  createRoom,
  roomNumber,
}) {
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");

  const checkRoom = async (number) => {
    try {
      setIsChecking(true);
      const response = await fetch(
        `/api/pusher/check-room?roomNumber=${number}`
      );
      const data = await response.json();

      if (data.error) {
        setError("Unable to check room status. Please try again.");
        return false;
      }

      if (!data.exists) {
        setError("This room does not exist or is no longer active.");
        return false;
      }

      return true;
    } catch (err) {
      setError("Network error while checking room status.");
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!username.trim()) {
      setError("Please enter a name");
      return;
    }

    if (createRoom) {
      handleLoginChange({ target: { value: username } });
      handleLogin();
      return;
    }

    const isValid = await checkRoom(roomNumber);
    if (isValid) {
      handleLoginChange({ target: { value: username } });
      handleLogin();
    }
  };

  return (
    <Row className='mt-2'>
      <Col>
        <h4>Pick a name</h4>
        <FormControl
          type='text'
          className='mt-2'
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          placeholder='Your name'
          maxLength={10}
          required
        />

        {error && (
          <Alert variant='danger' className='mt-2'>
            {error}
          </Alert>
        )}

        <Button
          className='mt-2'
          size='lg'
          onClick={handleSubmit}
          disabled={isChecking || !username.trim()}
        >
          {isChecking
            ? "Checking..."
            : createRoom
            ? "Create Room"
            : "Join Room"}
        </Button>
      </Col>
    </Row>
  );
}
