import { getAccessToken } from "../../lib/spotify";
import { pusher } from "../../lib/pusher";

// Server-side tracking of who has added songs to each room
// Key format: "roomNumber:username" -> trackId
// Note: This resets on serverless cold starts, but prevents most abuse during active sessions
const roomSongAdders = new Map();

// Clean up old entries after 24 hours to prevent memory bloat
const ENTRY_TTL_MS = 24 * 60 * 60 * 1000;
const entryTimestamps = new Map();

function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, timestamp] of entryTimestamps.entries()) {
    if (now - timestamp > ENTRY_TTL_MS) {
      roomSongAdders.delete(key);
      entryTimestamps.delete(key);
    }
  }
}

export default async function addToPlaylist(req, res) {
  const { uris, username, roomNumber, playlistId, trackId } = req.body;

  // Server-side validation: one song per user per room
  const userRoomKey = `${roomNumber}:${username}`;

  // Clean up old entries periodically
  cleanupOldEntries();

  if (roomSongAdders.has(userRoomKey)) {
    const existingTrackId = roomSongAdders.get(userRoomKey);
    return res.status(429).json({
      error: "You have already added a song to this room",
      existingTrackId,
      code: "SONG_LIMIT_REACHED"
    });
  }

  try {
    const { access_token } = await getAccessToken();
    const addSong = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${encodeURIComponent(
        uris
      )}`,
      {
        method: req.method,
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // trigger a new post event via pusher
    await pusher
      .trigger(`presence-playlist-shuffle-${roomNumber}`, "playlist-update", {
        message: `${username} just added their song!`,
        username,
        trackId,
        type: "add",
      })
      .catch((error) => {
        console.log(error);
      });

    // Only record the song if it was successfully added to Spotify
    if (addSong.ok) {
      roomSongAdders.set(userRoomKey, trackId);
      entryTimestamps.set(userRoomKey, Date.now());
    }

    console.log(addSong.statusText);
    res.status(addSong.status).json({ status: addSong.statusText });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: error.message });
  }
}
