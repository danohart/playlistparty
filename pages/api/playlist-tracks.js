import { getPlaylistTracks } from "../../lib/spotify";

export default async function handler(req, res) {
  const response = await getPlaylistTracks(accessToken, req.query.id);
  const { items } = await response.json();
  const tracks = items.map((track) => ({
    title: track.track.name,
    artist: track.track.artists[0].name,
    album: track.track.album.images[1],
    added_by: track.added_by.id,
    id: track.track.id,
  }));

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate=43200"
  );

  return res.status(200).json(tracks);
}
