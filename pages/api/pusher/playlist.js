import { pusher } from "../../../lib/pusher";

// presence channel handler
export default async function handler(req, res) {
  const { playlistId, username, roomNumber } = req.body;
  // Add spotify auth info to req.body in api fetch

  console.log("playlist req", req.body);
  // trigger a new post event via pusher
  await pusher
    .trigger(
      `presence-cache-playlist-shuffle-${roomNumber}-playlist`,
      "playlist-id",
      {
        playlistId,
        username,
      }
    )
    .catch((error) => {
      console.log(error);
    });

  res.json({ status: 200 });
}
