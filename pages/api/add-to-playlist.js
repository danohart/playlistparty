import { getAccessToken } from "../../lib/spotify";
import { getSession } from "next-auth/react";

export default async function addToPlaylist(req, res) {
  try {
    const {
      token: { accessToken },
    } = await getSession({ req });

    const { access_token } = await getAccessToken(accessToken);
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

    console.log(addSong.statusText);
    res.status(addSong.status);
    res.end(JSON.stringify(addSong.statusText));
  } catch (error) {
    res.json(error);
    res.status(addSong.status);

    console.log(addSong.statusText);
  }
}
