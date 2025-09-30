import { useEffect } from "react";
import { Spinner } from "react-bootstrap";

export default function SpotifyCallback() {
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const access_token = params.get("access_token");
    const state = params.get("state");
    const error = params.get("error");
    const expires_in = params.get("expires_in");

    // Verify state matches what we stored
    const stored_state = localStorage.getItem("spotify_auth_state");

    if (error) {
      // Send error to opener
      window.opener?.postMessage(
        {
          type: "spotify_auth_error",
          error: error,
        },
        window.location.origin
      );
      window.close();
      return;
    }

    if (state !== stored_state) {
      window.opener?.postMessage(
        {
          type: "spotify_auth_error",
          error: "State mismatch",
        },
        window.location.origin
      );
      window.close();
      return;
    }

    if (access_token) {
      // Send token to opener window
      window.opener?.postMessage(
        {
          type: "spotify_auth_success",
          access_token: access_token,
          expires_in: parseInt(expires_in) || 3600,
        },
        window.location.origin
      );

      // Clean up and close
      localStorage.removeItem("spotify_auth_state");
      window.close();
    } else {
      window.opener?.postMessage(
        {
          type: "spotify_auth_error",
          error: "No access token received",
        },
        window.location.origin
      );
      window.close();
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <Spinner animation='border' />
      <p>Connecting to Spotify...</p>
    </div>
  );
}
