import { pusher } from "../../../lib/pusher";

// presence channel handler
export default async function handler(req, res) {
  const { message, username, roomNumber } = req.body;
  // Add spotify auth info to req.body in api fetch

  console.log("update", req.body);
  // trigger a new post event via pusher
  await pusher.trigger(
    `presence-playlist-shuffle-${roomNumber}`,
    "playlist-update",
    {
      message,
      username,
    }
  );

  res.json({ status: 200 });
}
