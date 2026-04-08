// Google Analytics custom event tracking
// Works with @next/third-parties/google in Layout.js

// Track custom events
export const trackEvent = (eventName, parameters = {}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, parameters);
  }
};

// Pre-defined events for consistency
export const events = {
  // Room flow events
  roomCreationStarted: () =>
    trackEvent("room_creation_started"),

  roomCreationCompleted: (roomNumber, playlistId) =>
    trackEvent("room_creation_completed", {
      room_number: roomNumber,
      playlist_id: playlistId,
    }),

  roomJoinStarted: () =>
    trackEvent("room_join_started"),

  roomJoinCompleted: (roomNumber) =>
    trackEvent("room_join_completed", {
      room_number: roomNumber,
    }),

  roomEntered: (roomNumber, userCount) =>
    trackEvent("room_entered", {
      room_number: roomNumber,
      user_count: userCount,
    }),

  roomExited: (roomNumber, sessionDurationSec, songsAdded) =>
    trackEvent("room_exited", {
      room_number: roomNumber,
      session_duration_sec: sessionDurationSec,
      songs_added: songsAdded,
    }),

  inviteLinkCopied: (roomNumber) =>
    trackEvent("invite_link_copied", {
      room_number: roomNumber,
    }),

  // Song events
  songSearchPerformed: (searchTerm, resultsCount) =>
    trackEvent("song_search_performed", {
      search_term: searchTerm,
      results_count: resultsCount,
    }),

  songAdded: (source, roomNumber) =>
    trackEvent("song_added", {
      source: source, // "search" or "user_playlist"
      room_number: roomNumber,
    }),

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

  playlistLoaded: (trackCount, roomNumber) =>
    trackEvent("playlist_loaded", {
      track_count: trackCount,
      room_number: roomNumber,
    }),

  // Spotify auth events
  spotifyAuthStarted: () =>
    trackEvent("spotify_auth_started"),

  spotifyAuthCompleted: () =>
    trackEvent("spotify_auth_completed"),

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
