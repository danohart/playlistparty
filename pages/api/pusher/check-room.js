// pages/api/pusher/check-room.js
import { pusher } from "../../../lib/pusher";

export default async function handler(req, res) {
  const { roomNumber } = req.query;

  try {
    const channelUsers = await pusher.get({
      path: `/channels/presence-playlist-shuffle-${roomNumber}/users`,
    });

    const userData = await channelUsers.json();

    const hasUsers =
      userData && Array.isArray(userData.users) && userData.users.length > 0;

    return res.status(200).json({
      exists: hasUsers,
      message: hasUsers
        ? "Room is active"
        : "Room does not exist or is inactive",
      users: hasUsers ? userData.users.length : 0,
    });
  } catch (error) {
    console.error("Error checking room:", error);
    return res.status(500).json({
      exists: false,
      message: "Failed to check room status",
    });
  }
}
