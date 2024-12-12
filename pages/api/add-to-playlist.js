import { getAccessToken } from "../../lib/spotify";
import { pusher } from "../../lib/pusher";

export default async function addToPlaylist(req, res) {
  const { uris, username, roomNumber, playlistId, trackId } = req.body;
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
        trackId,
        type: "add",
      })
      .catch((error) => {
        console.log(error);
      });

    console.log(addSong.statusText);
    res.status(addSong.status).json({ status: addSong.statusText });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: error.message });
  }
}
