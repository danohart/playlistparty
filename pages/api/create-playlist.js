import { getAccessToken, getUserId } from "../../lib/spotify";

export default async function addToPlaylist(req, res) {
  try {
    const { access_token } = await getAccessToken();
    const { id } = await getUserId().then((res) => res.json());
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

    const data = await createPlaylist.json();

    res.status(createPlaylist.status).json(data.id);
    res.end();
  } catch (error) {
    res.json(error);
    res.status(createPlaylist.status);
  }
}
