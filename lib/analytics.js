// Google Analytics custom event tracking
// Works with @next/third-parties/google in Layout.js

// ---------------------------------------------------------------------------
// Context helpers: a stable per-browser client id and a per-attempt "flow id"
// so a single create/join attempt can be followed all the way through the
// funnel, even across events fired before the room number exists.
// ---------------------------------------------------------------------------

const uuid = () => {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (e) {
    // fall through to the manual generator
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const ls = {
  get(k) {
    try {
      return window.localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  },
  set(k, v) {
    try {
      window.localStorage.setItem(k, v);
    } catch (e) {
      /* ignore */
    }
  },
};

const ss = {
  get(k) {
    try {
      return window.sessionStorage.getItem(k);
    } catch (e) {
      return null;
    }
  },
  set(k, v) {
    try {
      window.sessionStorage.setItem(k, v);
    } catch (e) {
      /* ignore */
    }
  },
};

export const getClientId = () => {
  if (typeof window === "undefined") return null;
  let id = ls.get("pp_client_id");
  if (!id) {
    id = uuid();
    ls.set("pp_client_id", id);
  }
  return id;
};

// Start a fresh flow (one create-or-join attempt). Call on the entry points.
export const newFlow = () => {
  if (typeof window === "undefined") return null;
  const id = uuid();
  ss.set("pp_flow_id", id);
  ss.set("pp_event_seq", "0");
  return id;
};

export const getFlowId = () => {
  if (typeof window === "undefined") return null;
  let id = ss.get("pp_flow_id");
  if (!id) id = newFlow();
  return id;
};

const nextSeq = () => {
  if (typeof window === "undefined") return 0;
  const n = parseInt(ss.get("pp_event_seq") || "0", 10) + 1;
  ss.set("pp_event_seq", String(n));
  return n;
};

// ---------------------------------------------------------------------------
// Room-entry timestamp, for time-to-first-song and session duration.
// ---------------------------------------------------------------------------

const enteredAtMem = {};

export const markRoomEntered = (roomNumber) => {
  if (typeof window === "undefined" || roomNumber == null) return;
  const now = Date.now();
  enteredAtMem[roomNumber] = now;
  ss.set(`pp_entered_at_${roomNumber}`, String(now));
};

const getEnteredAt = (roomNumber) => {
  if (enteredAtMem[roomNumber]) return enteredAtMem[roomNumber];
  const v = ss.get(`pp_entered_at_${roomNumber}`);
  return v ? parseInt(v, 10) : null;
};

// ---------------------------------------------------------------------------
// Core event sender. Every event automatically carries the flow context.
// options.beacon -> use the beacon transport (for page-unload events).
// ---------------------------------------------------------------------------

export const trackEvent = (eventName, parameters = {}, options = {}) => {
  if (typeof window === "undefined" || !window.gtag) return;
  const payload = {
    ...parameters,
    pp_client_id: getClientId(),
    flow_id: getFlowId(),
    event_seq: nextSeq(),
  };
  if (options.beacon) payload.transport_type = "beacon";
  window.gtag("event", eventName, payload);
};

// Pre-defined events for consistency
export const events = {
  newFlow,
  markRoomEntered,

  // Room flow events
  roomCreationStarted: () => trackEvent("room_creation_started"),

  roomCreationCompleted: (roomNumber, playlistId) =>
    trackEvent("room_creation_completed", {
      room_number: roomNumber,
      playlist_id: playlistId,
    }),

  // Fired from _app.js the moment a room number is generated — first event
  // that ties a room_number to the flow_id on the create path.
  roomCreated: (roomNumber) =>
    trackEvent("room_created", { room_number: roomNumber }),

  roomJoinStarted: () => trackEvent("room_join_started"),

  roomJoinCompleted: (roomNumber) =>
    trackEvent("room_join_completed", {
      room_number: roomNumber,
    }),

  roomEntered: (roomNumber, userCount) =>
    trackEvent("room_entered", {
      room_number: roomNumber,
      user_count: userCount,
      is_solo: userCount === 1,
    }),

  roomParticipantChanged: (roomNumber, userCount, peakCount) =>
    trackEvent("room_participant_changed", {
      room_number: roomNumber,
      user_count: userCount,
      peak_count: peakCount,
    }),

  // payload: { session_duration_sec, songs_added, peak_user_count,
  //            reached_search_tab, performed_search, reason }
  roomExited: (roomNumber, payload = {}, options = {}) =>
    trackEvent("room_exited", { room_number: roomNumber, ...payload }, options),

  inviteLinkCopied: (roomNumber) =>
    trackEvent("invite_link_copied", {
      room_number: roomNumber,
    }),

  invitePromptShown: (roomNumber) =>
    trackEvent("invite_prompt_shown", { room_number: roomNumber }),

  invitePromptContinued: (roomNumber) =>
    trackEvent("invite_prompt_continued", { room_number: roomNumber }),

  // Fired when someone lands on "/" with a ?room= param (a shared link click).
  inviteLinkOpened: (roomNumber) =>
    trackEvent("invite_link_opened", { room_number: roomNumber }),

  // Song events
  songSearchPerformed: (searchTerm, resultsCount) =>
    trackEvent("song_search_performed", {
      search_term: searchTerm,
      results_count: resultsCount,
    }),

  songAdded: (source, roomNumber) => {
    trackEvent("song_added", {
      source: source, // "search" or "user_playlist"
      room_number: roomNumber,
    });

    // The first song a user adds to a room is the key activation event —
    // emit it separately with timing so it is easy to build a funnel on.
    if (typeof window !== "undefined") {
      const key = `pp_first_song_${roomNumber}`;
      if (!ss.get(key)) {
        ss.set(key, "1");
        const enteredAt = getEnteredAt(roomNumber);
        trackEvent("first_song_added", {
          source: source,
          room_number: roomNumber,
          time_to_first_song_sec: enteredAt
            ? Math.round((Date.now() - enteredAt) / 1000)
            : null,
        });
      }
    }
  },

  songAddRejected: (reason, roomNumber) =>
    trackEvent("song_add_rejected", {
      reason: reason,
      room_number: roomNumber,
    }),

  songRevealed: (roomNumber) =>
    trackEvent("song_revealed", {
      room_number: roomNumber,
    }),

  // Playlist events
  playlistCreated: (roomNumber) =>
    trackEvent("playlist_created", {
      room_number: roomNumber,
    }),

  playlistCreateFailed: ({ status, reason } = {}) =>
    trackEvent("playlist_create_failed", {
      status: status,
      reason: reason,
    }),

  playlistLoaded: (trackCount, roomNumber) =>
    trackEvent("playlist_loaded", {
      track_count: trackCount,
      room_number: roomNumber,
    }),

  // Spotify auth events
  spotifyAuthStarted: () => trackEvent("spotify_auth_started"),

  spotifyAuthCompleted: () => trackEvent("spotify_auth_completed"),

  // Chat events
  chatOpened: (roomNumber) =>
    trackEvent("chat_opened", {
      room_number: roomNumber,
    }),

  messageSent: (roomNumber) =>
    trackEvent("message_sent", {
      room_number: roomNumber,
    }),

  // Tab navigation
  tabChanged: (tabName, roomNumber) =>
    trackEvent("tab_changed", {
      tab_name: tabName,
      room_number: roomNumber,
    }),
};
