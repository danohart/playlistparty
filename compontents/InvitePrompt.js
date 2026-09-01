import { useEffect, useState } from "react";
import { Row, Col, Button, Alert, FormControl, InputGroup } from "react-bootstrap";
import { events } from "@/lib/analytics";

export default function InvitePrompt({ roomNumber, onContinue }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    events.invitePromptShown(roomNumber);
  }, [roomNumber]);

  const handleContinue = () => {
    events.invitePromptContinued(roomNumber);
    onContinue();
  };

  // Construct the shareable URL
  const roomUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?room=${roomNumber}`
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      events.inviteLinkCopied(roomNumber);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Row className='mt-4'>
      <Col xs={12} lg={{ span: 8, offset: 2 }}>
        <Alert variant='success' className='text-center'>
          <h3>Room Created! 🎉</h3>
          <p className='mb-3'>
            Your room is ready. Share this link with friends so they can join and add songs:
          </p>

          <InputGroup className='mb-3'>
            <FormControl
              value={roomUrl}
              readOnly
              className='text-center'
            />
            <Button
              variant='outline-secondary'
              onClick={handleCopyLink}
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </Button>
          </InputGroup>

          <p className='text-muted small mb-3'>
            Room #{roomNumber}
          </p>

          <Button
            size='lg'
            variant='primary'
            onClick={handleContinue}
            className='w-100'
          >
            Continue to Room
          </Button>
        </Alert>
      </Col>
    </Row>
  );
}
