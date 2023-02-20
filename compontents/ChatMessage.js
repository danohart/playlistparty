import React, { useState } from "react";
import { Toast } from "react-bootstrap";

export default function ChatMessage({ chat }) {
  const [show, setShow] = useState(true);
  //
  return (
    <Toast
      onClose={() => setShow(false)}
      show={show}
      delay={4500}
      autohide
      className='mt-2'
    >
      <Toast.Header>
        <strong className='me-auto'>{chat.username}</strong>
      </Toast.Header>
      <Toast.Body>{chat.message}</Toast.Body>
    </Toast>
  );
}
