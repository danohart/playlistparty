import { getLeader, getAdder } from "@/lib/room";
import { pusher } from "@/lib/pusher";

// The only path that ever turns a trackId into a username. Server-checked
// against the room's leader — there is no other endpoint a client can call to
// learn who submitted a track before it's revealed.
export default async function handler(req, res) {
  const { roomNumber, trackId, clientId } = req.body || {};

  if (!roomNumber || !trackId || !clientId) {
    return res
      .status(400)
      .json({ error: "roomNumber, trackId and clientId are required" });
  }

  try {
    const leaderId = await getLeader(roomNumber);
    if (!leaderId || leaderId !== clientId) {
      return res
        .status(403)
        .json({ error: "Only the party leader can reveal a track" });
    }

    const adder = await getAdder(roomNumber, trackId);
    if (!adder) {
      return res.status(404).json({ error: "No submitter found for that track" });
    }

    await pusher
      .trigger(`presence-playlist-shuffle-${roomNumber}`, "playlist-update", {
        type: "reveal",
        trackId,
        adder,
      })
      .catch((error) => {
        console.error("Error broadcasting reveal:", error);
      });

    return res.status(200).json({ adder });
  } catch (error) {
    console.error("Error revealing track:", error);
    return res.status(500).json({ error: "Failed to reveal track" });
  }
}
