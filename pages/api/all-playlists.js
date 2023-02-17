import { getPlaylists } from "../../lib/spotify";

export default async function handler(req, res) {
  const response = await getPlaylists();
  const { items } = await response.json();

  const playlists = items.map((playlist) => ({
    name: playlist.name,
    url: playlist.external_urls.spotify,
    id: playlist.id,
    coverImage: playlist.images[1],
    tracks: playlist.tracks,
  }));

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate=43200"
  );
  console.log("all playlists ", playlists);
  return res.status(200).json(playlists);
}
