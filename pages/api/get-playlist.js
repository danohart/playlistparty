import { getPlaylist } from "../../lib/spotify";

export default async function handler(req, res) {
  const response = await getPlaylist(req.query.playlistId);
  const playlistInfo = await response.json();

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate=43200"
  );

  return res.status(200).json(playlistInfo);
}
