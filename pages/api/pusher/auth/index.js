import { pusher } from "../../../../lib/pusher";
import Emojis from "@/lib/emojis";

export default async function handler(req, res) {
  // see https://pusher.com/docs/channels/server_api/authenticating-users
  const { socket_id, channel_name, username, playlistId } = req.body;
  // use JWTs here to authenticate users before continuing
  const randomString = Math.random().toString(36).slice(2);

  // Get random emoji for this user
  const userEmoji = Emojis();

  const isVip = playlistId !== "null" ? true : false;

  const presenceData = {
    user_id: randomString,
    user_info: {
      username: username,
      playlistId: playlistId,
      emoji: userEmoji,
      isVip,
    },
  };

  try {
    const auth = pusher.authorizeChannel(socket_id, channel_name, presenceData);
    res.send(auth);
  } catch (error) {
    console.error(error);
  }
}
