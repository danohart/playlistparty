// pages/api/playlist-tracks.js
import { getAccessToken, getPlaylistTracks } from "../../lib/spotify";

export default async function handler(req, res) {
  try {
    // Get access token first
    const { access_token } = await getAccessToken();

    // Validate playlist ID
    const playlistId = req.query.id;
    if (!playlistId) {
      return res.status(400).json({ error: "Playlist ID is required" });
    }

    // Get playlist tracks
    const response = await getPlaylistTracks(access_token, playlistId);

    console.log("response for playlist tracks", response);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch playlist tracks: ${response.statusText}`
      );
    }

    const { items } = await response.json();

    const tracks = items.map((track) => ({
      title: track.track.name,
      artist: track.track.artists[0].name,
      album: track.track.album.images[1],
      added_by: track.added_by.id,
      id: track.track.id,
    }));

    // Set cache headers
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=43200"
    );

    return res.status(200).json(tracks);
  } catch (error) {
    console.error("Error fetching playlist tracks:", error);
    return res.status(500).json({
      error: "Failed to fetch playlist tracks",
      details: error.message,
    });
  }
}
