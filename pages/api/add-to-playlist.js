import { getAccessToken } from "../../lib/spotify";

export default async function addToPlaylist(req, res) {
  const { access_token } = await getAccessToken();

  console.log("body", req.body);
  const addSong = await fetch(
    `https://api.spotify.com/v1/playlists/${
      req.body.playlistId
    }/tracks?uris=${encodeURIComponent(req.body.uris)}`,
    {
      method: req.method,
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    }
  );
  console.log(addSong);
}
