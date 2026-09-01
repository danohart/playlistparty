import { getPlaylist } from "../../lib/spotify";

export default async function handler(req, res) {
  const response = await getPlaylist(req.query.playlistId);
  const playlistInfo = await response.json();
  console.log("Fetched playlist info:", playlistInfo);

  // A room's track list changes live, and PlaylistReveal polls this every 5s.
  // A tiny shared-cache window absorbs click-bursts / accidental request floods
  // (which otherwise hammer Spotify's shared app credentials and risk a 429
  // that degrades the whole app) while still self-healing in ~3s. The old
  // s-maxage=86400 froze each room's first — usually empty — response for 24h.
  res.setHeader(
    "Cache-Control",
    "public, max-age=0, s-maxage=3, stale-while-revalidate=15"
  );

  return res.status(200).json(playlistInfo);
}
