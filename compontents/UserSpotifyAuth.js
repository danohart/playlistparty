import React, { useState, useEffect } from "react";
import { Button, Card, Spinner, Alert } from "react-bootstrap";

export default function UserSpotifyAuth({ onAuthChange }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
    window.addEventListener("message", handleOAuthCallback);

    return () => {
      window.removeEventListener("message", handleOAuthCallback);
    };
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("user_spotify_token");
    const expiry = localStorage.getItem("user_spotify_token_expiry");

    if (token && expiry && Date.now() < parseInt(expiry)) {
      setIsAuthenticated(true);
      onAuthChange?.(true);
    } else {
      localStorage.removeItem("user_spotify_token");
      localStorage.removeItem("user_spotify_token_expiry");
      setIsAuthenticated(false);
      onAuthChange?.(false);
    }
    setIsLoading(false);
  };

  const handleOAuthCallback = (event) => {
    if (event.origin !== window.location.origin) return;

    if (event.data.type === "spotify_auth_success") {
      const { access_token, expires_in } = event.data;
      const expiryTime = Date.now() + expires_in * 1000;

      localStorage.setItem("user_spotify_token", access_token);
      localStorage.setItem("user_spotify_token_expiry", expiryTime.toString());

      setIsAuthenticated(true);
      setError(null);
      onAuthChange?.(true);
    } else if (event.data.type === "spotify_auth_error") {
      setError("Failed to authenticate with Spotify");
    }
  };

  const handleLogin = () => {
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem("spotify_auth_state", state);

    const scope = "playlist-read-private playlist-read-collaborative";

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      response_type: "token",
      redirect_uri: `${window.location.origin}/spotify-callback`,
      state: state,
      scope: scope,
      show_dialog: false,
    });

    const width = 500;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      `https://accounts.spotify.com/authorize?${params}`,
      "Spotify Login",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("user_spotify_token");
    localStorage.removeItem("user_spotify_token_expiry");
    setIsAuthenticated(false);
    onAuthChange?.(false);
  };

  if (isLoading) {
    return (
      <div className='text-center py-3'>
        <Spinner animation='border' size='sm' />
      </div>
    );
  }

  return (
    <Card className='mb-3'>
      <Card.Body>
        {error && (
          <Alert variant='danger' dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!isAuthenticated ? (
          <div className='text-center'>
            <Card.Title>Quick Add from Your Playlists</Card.Title>
            <Card.Text className='mb-3'>
              Connect your Spotify to easily add songs from your own playlists,
              including Wrapped favorites!
            </Card.Text>
            <Button variant='success' onClick={handleLogin} className='px-4'>
              Connect My Spotify
            </Button>
          </div>
        ) : (
          <div className='d-flex justify-content-between align-items-center'>
            <div>
              <strong>✓ Connected to your Spotify</strong>
              <div className='text-muted small'>
                Browse your playlists below
              </div>
            </div>
            <Button variant='outline-danger' size='sm' onClick={handleLogout}>
              Disconnect
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
