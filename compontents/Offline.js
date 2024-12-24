import React, { useState, useEffect } from "react";
import Alert from "react-bootstrap/Alert";
import { WifiOff } from "react-bootstrap-icons";

export default function OfflineNotification() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className='offline-notification'>
      <Alert variant='danger' className='mb-0'>
        <Alert.Heading>
          <WifiOff size={48} className='me-2' />
          You're Offline
        </Alert.Heading>
        Adding and playing song features won't work until you reconnect.
      </Alert>
    </div>
  );
}
