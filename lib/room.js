import { redis } from "@/lib/redis";

// Rooms are ephemeral parties, not long-lived data — expire everything after
// a day of inactivity instead of growing Redis forever.
const ROOM_TTL_SECONDS = 24 * 60 * 60;

const leaderKey = (roomNumber) => `room:${roomNumber}:leader`;
const addersKey = (roomNumber) => `room:${roomNumber}:adders`;
const revealedKey = (roomNumber) => `room:${roomNumber}:revealed`;

// The first client to reach this for a room becomes its leader. Safe to call
// repeatedly, by the same client or others — it never overwrites an existing
// leader, it just reports who currently holds it (SET NX under the hood).
export async function claimLeader(roomNumber, clientId) {
  await redis.set(leaderKey(roomNumber), clientId, {
    nx: true,
    ex: ROOM_TTL_SECONDS,
  });
  return redis.get(leaderKey(roomNumber));
}

export async function getLeader(roomNumber) {
  return redis.get(leaderKey(roomNumber));
}

// Server-side answer key: trackId -> username. Never exposed directly to
// clients — only read via getAdder(), and only the leader-checked reveal
// endpoint calls that.
export async function recordAdder(roomNumber, trackId, username) {
  const key = addersKey(roomNumber);
  await redis.hset(key, { [trackId]: username });
  await redis.expire(key, ROOM_TTL_SECONDS);
}

export async function getAdder(roomNumber, trackId) {
  return redis.hget(addersKey(roomNumber), trackId);
}

// Which tracks have a submitter — safe to give to any client (no usernames),
// so the Reveal button can know what's revealable even after a refresh.
export async function getAddedTrackIds(roomNumber) {
  return redis.hkeys(addersKey(roomNumber));
}

export async function recordReveal(roomNumber, trackId, username) {
  const key = revealedKey(roomNumber);
  await redis.hset(key, { [trackId]: username });
  await redis.expire(key, ROOM_TTL_SECONDS);
}
