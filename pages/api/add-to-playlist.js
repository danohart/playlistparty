import { getAccessToken } from "../../lib/spotify";

export default async function addToPlaylist(req, res) {
  const { access_token } = await getAccessToken();

  const playlistId = "6VU7MOt9x8j9CCpbmUm7Z7";

  console.log("body", req.body);
  const addSong = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${encodeURIComponent(
      req.body
    )}`,
    {
      method: req.method,
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    }
  );
  console.log(addSong.statusText);
}
