import { getPlaylists } from "../../lib/spotify";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const {
    token: { accessToken },
  } = await getSession({ req });

  const response = await getPlaylists(accessToken);
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

  return res.status(200).json(playlists);
}
