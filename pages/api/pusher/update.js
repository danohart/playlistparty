import { pusher } from "../../../lib/pusher";

// presence channel handler
export default async function handler(req, res) {
  const { message, username } = req.body;
  console.log("update", req.body);
  // trigger a new post event via pusher
  await pusher.trigger("playlist-shuffle", "chat-update", {
    message,
    username,
  });

  res.json({ status: 200 });
}
