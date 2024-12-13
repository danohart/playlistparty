import React, { useState } from "react";
import { Toast } from "react-bootstrap";

export default function ChatNotifications({ chats, showChat }) {
  const [show, setShow] = useState(true);

  return (
    <Toast
      onClose={() => setShow(false)}
      show={show}
      delay={4500}
      autohide
      className={showChat ? "d-none" : `mt-2`}
    >
      <Toast.Header>
        <strong className='me-auto'>{chats.username}</strong>
      </Toast.Header>
      <Toast.Body>{chats.message}</Toast.Body>
    </Toast>
  );
}
