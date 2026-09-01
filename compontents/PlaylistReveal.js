import React, { useState, useEffect } from "react";
import { Row, Col, Button } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import Pusher from "pusher-js";
import CurrentlyPlaying from "./CurrentlyPlaying";
import { events, getClientId } from "@/lib/analytics";

export default function PlaylistReveal({
  playlistId,
  username,
  roomNumber,
  isLeader,
  initialAddedTrackIds,
}) {
  const [tracks, setTracks] = useState([]);
  const [revealedTracks, setRevealedTracks] = useState(new Map());
  // Which tracks have a submitter — never who, just which. Populated from the
  // leader-check round trip (pages/select.js -> /api/room/init) and live
  // Pusher "add" events, neither of which carry a username.
  const [addedTrackIds, setAddedTrackIds] = useState(
    () => new Set(initialAddedTrackIds || [])
  );
  const [recentReveal, setRecentReveal] = useState(null);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const { data, error } = useSWR(
    shouldFetch ? `/api/get-playlist?playlistId=${playlistId}` : null,
    async (url) => {
      try {
        const response = await fetcher(url);
        if (!response?.tracks?.items) {
          throw new Error("Invalid response format");
        }
        return response;
      } catch (err) {
        console.error("Fetch error:", err);
        setFetchError(err.message);
        throw err;
      }
    },
    {
      refreshInterval: shouldFetch ? 5000 : null,
      onError: (err) => {
        console.error("SWR error:", err);
        setFetchError(err.message);
      },
    }
  );

  useEffect(() => {
    const savedReveals = localStorage.getItem(`revealed-${roomNumber}`);
    if (savedReveals) {
      setRevealedTracks(new Map(JSON.parse(savedReveals)));
    }
  }, [roomNumber]);

  // The leader-check round trip (pages/select.js) can resolve after this
  // component's first render — merge its result in when it arrives.
  useEffect(() => {
    if (!initialAddedTrackIds?.length) return;
    setAddedTrackIds((prev) => {
      const next = new Set(prev);
      initialAddedTrackIds.forEach((id) => next.add(id));
      return next;
    });
  }, [initialAddedTrackIds]);

  // Save revealed tracks to localStorage when they change. This is safe to
  // cache — it's public, post-reveal information, unlike the answer key.
  useEffect(() => {
    if (revealedTracks.size > 0) {
      localStorage.setItem(
        `revealed-${roomNumber}`,
        JSON.stringify([...revealedTracks])
      );
    }
  }, [revealedTracks, roomNumber]);

  // Setup Pusher subscription
  useEffect(() => {
    if (!username || !roomNumber) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: "api/pusher/auth",
      auth: { params: { username } },
    });

    const channel = pusher.subscribe(`presence-playlist-shuffle-${roomNumber}`);

    channel.bind("playlist-update", (data) => {
      if (data.type === "add") {
        // No username on this event by design — see
        // pages/api/add-to-playlist.js. This only says a track is revealable.
        setAddedTrackIds((prev) => new Set(prev).add(data.trackId));
      } else if (data.type === "reveal") {
        // Broadcast by the leader-checked /api/room/reveal — every client
        // (including the leader's own) learns the answer and sees the
        // animation from this one place, so the reveal is synced for everyone.
        setRevealedTracks(
          (prev) => new Map(prev).set(data.trackId, data.adder)
        );
        setRecentReveal({ trackId: data.trackId, adder: data.adder });
        setTimeout(() => setRecentReveal(null), 2000);
      }
    });

    return () => {
      channel.unbind("playlist-update");
      pusher.unsubscribe(`presence-playlist-shuffle-${roomNumber}`);
      pusher.disconnect();
    };
  }, [username, roomNumber]);

  // Update tracks when data changes
  useEffect(() => {
    if (data?.tracks?.items) {
      const trackCount = data.tracks.items.length;
      events.playlistLoaded(trackCount, roomNumber);
      setTracks(
        data.tracks.items.map((item) => ({
          id: item.track.id,
          title: item.track.name,
          artist: item.track.artists[0].name,
          album: item.track.album.images[1],
          addedAt: item.added_at,
        }))
      );
    }
  }, [data, roomNumber]);

  const handleReveal = async (trackId) => {
    if (!isLeader || revealedTracks.has(trackId) || !addedTrackIds.has(trackId)) {
      return;
    }

    try {
      const res = await fetch("/api/room/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomNumber, trackId, clientId: getClientId() }),
      });
      const body = await res.json();

      if (!res.ok || !body.adder) {
        console.error("Reveal failed:", body.error);
        return;
      }

      events.songRevealed(roomNumber);
      // Local state updates when the resulting Pusher broadcast comes back
      // through the subscription above — that's what keeps every client
      // (leader included) in sync from a single source of truth.
    } catch (err) {
      console.error("Error revealing track:", err);
    }
  };

  const handleRefresh = () => {
    setShouldFetch(false);
    setTimeout(() => setShouldFetch(true), 100);
  };

  if (error) return <div>Failed to load playlist tracks</div>;

  if (!shouldFetch) {
    return (
      <Row>
        <Col
          xs={{ span: 8, offset: 2 }}
          sm={{ span: 8, offset: 2 }}
          md={{ span: 8, offset: 2 }}
          lg={{ span: 8, offset: 2 }}
          className='text-center'
        >
          <Button
            onClick={() => {
              console.log("Loading playlist...");
              setShouldFetch(true);
            }}
            variant='secondary'
            className='my-4'
          >
            Load Playlist Tracks
          </Button>
        </Col>
      </Row>
    );
  }

  if (error || fetchError) {
    return (
      <div className='text-center text-red-600'>
        Error loading playlist tracks: {error?.message || fetchError}
        <Button
          onClick={() => {
            setFetchError(null);
            setShouldFetch(false);
            setTimeout(() => setShouldFetch(true), 100);
          }}
          variant='secondary'
          className='mt-4 d-block mx-auto'
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return <div>Loading...</div>;

  return (
    <div className='relative'>
      <Row>
        <Col
          xs={{ span: 8, offset: 2 }}
          sm={{ span: 8, offset: 2 }}
          md={{ span: 8, offset: 2 }}
          lg={{ span: 8, offset: 2 }}
          className='text-center'
        >
          <Button onClick={handleRefresh} variant='secondary' className='my-4'>
            Refresh Tracks
          </Button>
        </Col>
      </Row>

      {/* <CurrentlyPlaying /> */}

      {recentReveal && (
        <div className='reveal-name fixed inset-0 z-50 animate-reveal'>
          <div
            className='animate-bounce-in text-center text-white'
            style={{
              fontSize: "min(20vw, 150px)",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {recentReveal.adder}
          </div>
        </div>
      )}

      <h2 className='text-2xl font-bold mb-4'>Playlist Tracks</h2>
      <Row xs={2} md={4} className='g-4'>
        {tracks.map((track) => (
          <Col key={track.id}>
            <Card text='dark' className='relative overflow-hidden'>
              {track.album && (
                <Card.Img
                  variant='top'
                  src={track.album.url}
                  alt={track.title}
                />
              )}
              <Card.Body>
                <Card.Title>{track.title}</Card.Title>
                <Card.Text>{track.artist}</Card.Text>
                {revealedTracks.has(track.id) ? (
                  <div
                    className={`
                      font-bold text-lg
                      ${
                        recentReveal?.trackId === track.id
                          ? "animate-slide-up"
                          : ""
                      }
                    `}
                  >
                    Added by: {revealedTracks.get(track.id)}
                  </div>
                ) : isLeader ? (
                  <Button
                    onClick={() => handleReveal(track.id)}
                    variant='secondary'
                    className='hover-scale'
                    disabled={!addedTrackIds.has(track.id)}
                  >
                    Reveal
                  </Button>
                ) : (
                  <div className='text-muted small'>
                    Waiting on the party leader to reveal…
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <style jsx>{`
        .animate-reveal {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-bounce-in {
          animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)
            forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }

        .hover-scale {
          transition: transform 0.2s;
        }

        .hover-scale:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
