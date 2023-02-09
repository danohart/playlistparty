import { getAccessToken, getUserId } from "../../lib/spotify";
import { getSession } from "next-auth/react";

export default async function addToPlaylist(req, res) {
  try {
    const {
      token: { accessToken },
    } = await getSession({ req });

    const { access_token } = await getAccessToken(accessToken);
    const { id } = await getUserId(accessToken).then((res) => res.json());
    const createPlaylist = await fetch(
      `https://api.spotify.com/v1/users/${id}/playlists`,
      {
        method: req.method,
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );
    res.status(createPlaylist.status);
    res.end(JSON.stringify(createPlaylist.statusText));
  } catch (error) {
    res.json(error);
    res.status(createPlaylist.status);
  }
}
