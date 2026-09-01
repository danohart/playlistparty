import { claimLeader, getAddedTrackIds } from "@/lib/room";

// Called once when any client (creator or joiner) reaches the room. Whoever
// gets here first becomes the room's leader — for the create flow that's the
// creator, since they land on /select before anyone can follow the invite
// link. Safe to call again on refresh: it just reports the existing leader.
export default async function handler(req, res) {
  const { roomNumber, clientId } = req.body || {};

  if (!roomNumber || !clientId) {
    return res
      .status(400)
      .json({ error: "roomNumber and clientId are required" });
  }

  try {
    const [leaderId, addedTrackIds] = await Promise.all([
      claimLeader(roomNumber, clientId),
      getAddedTrackIds(roomNumber),
    ]);
    return res.status(200).json({ leaderId, addedTrackIds });
  } catch (error) {
    console.error("Error claiming room leader:", error);
    return res.status(500).json({ error: "Failed to initialize room" });
  }
}
