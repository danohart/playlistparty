import React, { useState, useEffect } from "react";
import { Row, Col, Button } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import Pusher from "pusher-js";
import CurrentlyPlaying from "./CurrentlyPlaying";

export default function PlaylistReveal({ playlistId, username, roomNumber }) {
  const [tracks, setTracks] = useState([]);
  const [revealedTracks, setRevealedTracks] = useState(new Map());
  const [songAdders, setSongAdders] = useState(new Map());
  const [recentReveal, setRecentReveal] = useState(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  const { data, error } = useSWR(
    shouldFetch && playlistId
      ? `/api/get-playlist?playlistId=${playlistId}`
      : null,
    fetcher,
    { refreshInterval: shouldFetch ? 5000 : null }
  );

  useEffect(() => {
    const savedAdders = localStorage.getItem(`songAdders-${roomNumber}`);
    const savedReveals = localStorage.getItem(`revealed-${roomNumber}`);

    if (savedAdders) {
      setSongAdders(new Map(JSON.parse(savedAdders)));
    }
    if (savedReveals) {
      setRevealedTracks(new Map(JSON.parse(savedReveals)));
    }
  }, [roomNumber]);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (songAdders.size > 0) {
      localStorage.setItem(
        `songAdders-${roomNumber}`,
        JSON.stringify([...songAdders])
      );
    }
    if (revealedTracks.size > 0) {
      localStorage.setItem(
        `revealed-${roomNumber}`,
        JSON.stringify([...revealedTracks])
      );
    }
  }, [songAdders, revealedTracks, roomNumber]);

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
        setSongAdders((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.trackId, data.username);
          return newMap;
        });
      } else if (data.type === "reveal") {
        setRevealedTracks(
          (prev) => new Map(prev.set(data.trackId, data.adder))
        );
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
  }, [data]);

  const handleReveal = async (trackId) => {
    if (revealedTracks.has(trackId)) return;

    const adder = songAdders.get(trackId);
    if (!adder) {
      console.log("No adder found for track:", trackId);
      return;
    }

    setRecentReveal({ trackId, adder });

    setTimeout(() => {
      setRecentReveal(null);
    }, 2000);

    setRevealedTracks(new Map(revealedTracks.set(trackId, adder)));
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
            onClick={() => setShouldFetch(true)}
            variant='secondary'
            className='my-4'
          >
            Load Playlist Tracks
          </Button>
        </Col>
      </Row>
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

      <CurrentlyPlaying />

      {recentReveal && (
        <div
          className='fixed inset-0 z-50 animate-reveal'
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "100",
          }}
        >
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
                ) : (
                  <Button
                    onClick={() => handleReveal(track.id)}
                    variant='secondary'
                    className='hover-scale'
                    disabled={!songAdders.has(track.id)}
                  >
                    Reveal
                  </Button>
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

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.1);
          }
          80% {
            opacity: 1;
            transform: scale(0.89);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
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

        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
