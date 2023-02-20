import React, { useState } from "react";
import { Row, Col, Toast } from "react-bootstrap";

export default function ChatMessage({ chat }) {
  const [show, setShow] = useState(false);
  return (
    <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide>
      <Toast.Header>
        <strong className='me-auto'>{chat.username}</strong>
      </Toast.Header>
      <Toast.Body>{chat.message}</Toast.Body>
    </Toast>
  );
}
