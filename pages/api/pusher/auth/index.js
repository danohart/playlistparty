import { pusher } from "../../../../lib/pusher";

export default async function handler(req, res) {
  // see https://pusher.com/docs/channels/server_api/authenticating-users
  const { socket_id, channel_name, username, playlistId } = req.body;
  // use JWTs here to authenticate users before continuing
  const randomString = Math.random().toString(36).slice(2);

  const isVip = playlistId !== "null" ? true : false;

  const presenceData = {
    user_id: randomString,
    user_info: {
      username: username,
    },
    playlistId: playlistId,
    isVip,
  };

  try {
    const auth = pusher.authorizeChannel(socket_id, channel_name, presenceData);
    console.log("auth", auth);
    res.send(auth);
  } catch (error) {
    console.error(error);
  }
}
