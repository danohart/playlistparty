const spotifyApiUrl = "https://api.spotify.com/v1";

export const getAccessToken = async () => {
  const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
  });

  return response.json();
};

export const getUserId = async () => {
  const { access_token } = await getAccessToken();

  const response = await fetch(`${spotifyApiUrl}/me`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get user ID: ${response.status} ${response.statusText}`
    );
  }

  return response;
};

export const topTracksOrArtists = async (refresh_token, tracksOrArtists) => {
  const { access_token } = await getAccessToken(refresh_token);

  return fetch(`${spotifyApiUrl}/me/top/${tracksOrArtists}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

export const currentlyPlayingSong = async (refresh_token) => {
  const { access_token } = await getAccessToken(refresh_token);

  return fetch(`${spotifyApiUrl}/me/player/currently-playing`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

export const getPlaylists = async (refresh_token) => {
  const { access_token } = await getAccessToken(refresh_token);

  const response = await getUserId();
  const { id } = await response.json();

  return fetch(`${spotifyApiUrl}/users/${id}/playlists`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

export const getPlaylistTracks = async (refresh_token, playlistId) => {
  const { access_token } = await getAccessToken(refresh_token);

  return fetch(`${spotifyApiUrl}/playlists/${playlistId}/tracks`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

export const getPlaylist = async (playlistId, refresh_token) => {
  const { access_token } = await getAccessToken(refresh_token);

  return fetch(`${spotifyApiUrl}/playlists/${playlistId}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

export const searchSpotify = async (searchQuery) => {
  const { access_token } = await getAccessToken();

  return fetch(`${spotifyApiUrl}/search?q=${searchQuery}&type=track&limit=5`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};
