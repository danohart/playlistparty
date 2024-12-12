import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import Pusher from "pusher-js";

const PlaylistReveal = ({ playlistId, username, roomNumber }) => {
  const [tracks, setTracks] = useState([]);
  const [revealedTracks, setRevealedTracks] = useState(new Map());
  const [songAdders, setSongAdders] = useState(new Map());

  const { data, error } = useSWR(
    playlistId ? `/api/get-playlist?playlistId=${playlistId}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  // Load saved state from localStorage
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

  useEffect(() => {
    if (!username || !roomNumber) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: "api/pusher/auth",
      auth: { params: { username } },
    });

    const channel = pusher.subscribe(`presence-playlist-shuffle-${roomNumber}`);

    channel.bind("playlist-update", (data) => {
      console.log("Received Pusher event:", data); // Debug log

      if (data.type === "add") {
        console.log("Adding song:", data.trackId, "by user:", data.username); // Debug log
        setSongAdders((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.trackId, data.username);
          console.log("Updated songAdders:", [...newMap]); // Debug log
          return newMap;
        });
      } else if (data.type === "reveal") {
        console.log("Revealing song:", data.trackId, "adder:", data.adder); // Debug log
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

    setRevealedTracks(new Map(revealedTracks.set(trackId, adder)));

    await fetch("/api/pusher/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `${username} revealed who added "${
          tracks.find((t) => t.id === trackId)?.title
        }"`,
        username,
        roomNumber,
        trackId,
        adder,
        type: "reveal",
      }),
    });
  };

  if (error) return <div>Failed to load playlist tracks</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <>
      <h2 className='text-2xl font-bold mb-4'>Playlist Tracks</h2>
      <CardGroup>
        {tracks.map((track) => (
          <Card key={track.id} text='dark'>
            {track.album && (
              <Card.Img variant='top' src={track.album.url} alt={track.title} />
            )}
            <Card.Body>
              <Card.Title>{track.title}</Card.Title>
              <Card.Text>{track.artist}</Card.Text>
            </Card.Body>

            {revealedTracks.has(track.id) ? (
              <div className='text-sm font-medium text-green-600'>
                Added by: {revealedTracks.get(track.id)}
              </div>
            ) : (
              <Button
                onClick={() => handleReveal(track.id)}
                variant='secondary'
                disabled={!songAdders.has(track.id)}
              >
                Reveal
              </Button>
            )}
          </Card>
        ))}
      </CardGroup>
    </>
  );
};

export default PlaylistReveal;
