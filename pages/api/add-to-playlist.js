import { getAccessToken } from "../../lib/spotify";
import { pusher } from "../../lib/pusher";

export default async function addToPlaylist(req, res) {
  const { uris, username, roomNumber, playlistId } = req.body;
  try {
    const { access_token } = await getAccessToken();
    const addSong = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${encodeURIComponent(
        uris
      )}`,
      {
        method: req.method,
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // trigger a new post event via pusher
    await pusher
      .trigger(`presence-playlist-shuffle-${roomNumber}`, "playlist-update", {
        message: `${username} just added their song!`,
        username,
      })
      .catch((error) => {
        console.log(error);
      });

    console.log(addSong.statusText);
    res.status(addSong.status);
    res.end(JSON.stringify(addSong.statusText));
  } catch (error) {
    res.json(error);
    res.status(addSong.status);

    console.log(addSong.statusText);
  }
}
