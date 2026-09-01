import { useEffect, useState } from "react";
import { Button, FormControl, InputGroup } from "react-bootstrap";
import { events } from "@/lib/analytics";

export default function InvitePrompt({ roomNumber, onContinue }) {
  const [copied, setCopied] = useState(false);

  // Construct the shareable URL
  const roomUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?room=${roomNumber}`
      : "";

  useEffect(() => {
    events.invitePromptShown(roomNumber);
  }, [roomNumber]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      events.inviteLinkCopied(roomNumber);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleContinue = () => {
    events.invitePromptContinued(roomNumber);
    onContinue();
  };

  return (
    <>
      <p className="flow-intro">
        Your room is live. Read this code out to the room, or send the link —
        everyone adds songs in secret.
      </p>

      <div className="flow-code-display" aria-label={`Room code ${roomNumber}`}>
        {roomNumber}
      </div>

      <InputGroup>
        <FormControl value={roomUrl} readOnly aria-label="Room link" />
        <Button variant="outline-light" onClick={handleCopyLink}>
          {copied ? "Copied" : "Copy link"}
        </Button>
      </InputGroup>

      <Button
        variant="primary"
        size="lg"
        className="w-100"
        onClick={handleContinue}
      >
        Continue to room
      </Button>
    </>
  );
}
