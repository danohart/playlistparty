import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Accordion,
  Badge,
} from "react-bootstrap";
import { events } from "@/lib/analytics";

export default function UserPlaylists({
  playlistId,
  username,
  roomNumber,
  onSongAdded,
}) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [expandedPlaylist, setExpandedPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState({});
  const [addingTrack, setAddingTrack] = useState(null);
  const [filterSpotifyOnly, setFilterSpotifyOnly] = useState(false);
  const [nextUrl, setNextUrl] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUserPlaylists();
  }, []);

  const fetchUserPlaylists = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("user_spotify_token");
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    try {
      // Changed limit to 25
      const response = await fetch(
        "https://api.spotify.com/v1/me/playlists?limit=25",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired
          localStorage.removeItem("user_spotify_token");
          localStorage.removeItem("user_spotify_token_expiry");
          setError("Session expired. Please reconnect.");
          return;
        }
        throw new Error("Failed to fetch playlists");
      }

      const data = await response.json();

      // Add metadata about playlist ownership
      const playlistsWithMeta = (data.items || []).map((playlist) => ({
        ...playlist,
        isSpotifyOwned:
          playlist.owner.id === "spotify" ||
          playlist.owner.display_name === "Spotify",
      }));

      setPlaylists(playlistsWithMeta);
      setNextUrl(data.next);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePlaylists = async () => {
    if (!nextUrl || loadingMore) return;

    setLoadingMore(true);
    setError(null);
    const token = localStorage.getItem("user_spotify_token");

    try {
      const response = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch more playlists");
      }

      const data = await response.json();

      const playlistsWithMeta = (data.items || []).map((playlist) => ({
        ...playlist,
        isSpotifyOwned:
          playlist.owner.id === "spotify" ||
          playlist.owner.display_name === "Spotify",
      }));

      setPlaylists((prev) => [...prev, ...playlistsWithMeta]);
      setNextUrl(data.next);
    } catch (err) {
      console.error("Error loading more playlists:", err);
      setError("Failed to load more playlists");
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchPlaylistTracks = async (userPlaylistId) => {
    const token = localStorage.getItem("user_spotify_token");
    if (!token) return;

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${userPlaylistId}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch tracks");

      const data = await response.json();
      setPlaylistTracks((prev) => ({
        ...prev,
        [userPlaylistId]: data.items || [],
      }));
    } catch (err) {
      console.error("Error fetching tracks:", err);
    }
  };

  const handlePlaylistClick = (userPlaylistId) => {
    if (expandedPlaylist === userPlaylistId) {
      setExpandedPlaylist(null);
    } else {
      setExpandedPlaylist(userPlaylistId);
      if (!playlistTracks[userPlaylistId]) {
        fetchPlaylistTracks(userPlaylistId);
      }
    }
  };

  const addToRoomPlaylist = async (track) => {
    setAddingTrack(track.id);

    try {
      const response = await fetch("/api/add-to-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [`spotify:track:${track.id}`],
          trackId: track.id,
          playlistId,
          username,
          roomNumber,
        }),
      });

      if (response.status === 429) {
        // Server-side rate limit: user already added a song
        events.songAddRejected("already_added_one", roomNumber);
        const data = await response.json();
        alert(data.error || "You have already added a song to this room");
        // Notify parent to update state
        if (onSongAdded) {
          onSongAdded(track.id, track.name, track.artists[0]?.name);
        }
        setAddingTrack(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to add song");
      }

      events.songAdded("user_playlist", roomNumber);
      // Notify parent component that song was added
      if (onSongAdded) {
        onSongAdded(track.id, track.name, track.artists[0]?.name);
      }

      // Show success feedback briefly
      setTimeout(() => setAddingTrack(null), 1000);
    } catch (err) {
      console.error("Error adding track:", err);
      setAddingTrack(null);
      alert("Failed to add song. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className='text-center py-4'>
        <Spinner animation='border' />
        <div className='mt-2'>Loading your playlists...</div>
      </div>
    );
  }

  if (error && playlists.length === 0) {
    return (
      <div className='text-center text-danger py-4'>
        <div>{error}</div>
        <Button
          variant='secondary'
          size='sm'
          className='mt-2'
          onClick={fetchUserPlaylists}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className='text-center text-muted py-4'>No playlists found</div>
    );
  }

  const filteredPlaylists = filterSpotifyOnly
    ? playlists.filter((p) => p.isSpotifyOwned)
    : playlists;

  const spotifyPlaylists = playlists.filter((p) => p.isSpotifyOwned);

  return (
    <div className='user-playlists'>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h4 className='mb-0'>
          Your Playlists ({filteredPlaylists.length}
          {total > playlists.length && ` of ${total}`})
        </h4>
        {spotifyPlaylists.length > 0 && (
          <Button
            variant={filterSpotifyOnly ? "primary" : "outline-secondary"}
            size='sm'
            onClick={() => setFilterSpotifyOnly(!filterSpotifyOnly)}
          >
            {filterSpotifyOnly ? "✓ " : ""}Spotify Playlists Only
          </Button>
        )}
      </div>
      <Accordion>
        {filteredPlaylists.map((playlist) => (
          <Accordion.Item eventKey={playlist.id} key={playlist.id}>
            <Accordion.Header onClick={() => handlePlaylistClick(playlist.id)}>
              <div className='d-flex align-items-center w-100'>
                {playlist.images?.[0] && (
                  <img
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    style={{
                      width: 40,
                      height: 40,
                      marginRight: 12,
                      borderRadius: 4,
                    }}
                  />
                )}
                <div className='flex-grow-1'>
                  <div className='d-flex align-items-center gap-2'>
                    <strong>{playlist.name}</strong>
                    {playlist.isSpotifyOwned && (
                      <Badge bg='success' pill style={{ fontSize: "0.65rem" }}>
                        Spotify
                      </Badge>
                    )}
                  </div>
                  <small className='text-muted'>
                    {playlist.tracks.total} songs
                    {!playlist.isSpotifyOwned &&
                      ` • by ${playlist.owner.display_name}`}
                  </small>
                </div>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              {!playlistTracks[playlist.id] ? (
                <div className='text-center py-2'>
                  <Spinner animation='border' size='sm' />
                </div>
              ) : (
                <Row xs={1} className='g-2'>
                  {playlistTracks[playlist.id].map((item) => {
                    if (!item.track) return null;
                    return (
                      <Col key={item.track.id}>
                        <Card className='track-card'>
                          <Card.Body className='p-2'>
                            <Row className='align-items-center'>
                              <Col xs={2}>
                                {item.track.album?.images?.[2] && (
                                  <img
                                    src={item.track.album.images[2].url}
                                    alt={item.track.name}
                                    className='w-100'
                                    style={{ borderRadius: 4 }}
                                  />
                                )}
                              </Col>
                              <Col xs={7}>
                                <div className='small'>
                                  <strong>{item.track.name}</strong>
                                </div>
                                <div className='text-muted small'>
                                  {item.track.artists[0]?.name}
                                </div>
                              </Col>
                              <Col xs={3} className='text-end'>
                                <Button
                                  size='sm'
                                  variant='primary'
                                  onClick={() => addToRoomPlaylist(item.track)}
                                  disabled={addingTrack === item.track.id}
                                >
                                  {addingTrack === item.track.id ? (
                                    <>
                                      <Spinner
                                        as='span'
                                        animation='border'
                                        size='sm'
                                        role='status'
                                        aria-hidden='true'
                                      />
                                    </>
                                  ) : (
                                    "Add"
                                  )}
                                </Button>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      {/* Load More Button */}
      {nextUrl && (
        <div className='text-center mt-4'>
          <Button
            variant='secondary'
            onClick={loadMorePlaylists}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Spinner
                  as='span'
                  animation='border'
                  size='sm'
                  role='status'
                  aria-hidden='true'
                  className='me-2'
                />
                Loading...
              </>
            ) : (
              `Load More Playlists (${playlists.length} of ${total})`
            )}
          </Button>
        </div>
      )}

      {/* Error message for load more failures */}
      {error && playlists.length > 0 && (
        <div className='text-center text-danger mt-2 small'>{error}</div>
      )}
    </div>
  );
}
