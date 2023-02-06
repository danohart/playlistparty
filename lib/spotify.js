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

  return fetch(`https://api.spotify.com/v1/me`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

export const topTracksOrArtists = async (tracksOrArtists) => {
  const { access_token } = await getAccessToken();

  return fetch(`https://api.spotify.com/v1/me/top/${tracksOrArtists}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

export const currentlyPlayingSong = async () => {
  const { access_token } = await getAccessToken();

  return fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

export const getPlaylists = async () => {
  const { access_token } = await getAccessToken();

  const response = await getUserId();

  const { id } = await response.json();

  return fetch(`https://api.spotify.com/v1/users/${id}/playlists`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

export const getPlaylist = async (playlistId) => {
  const { access_token } = await getAccessToken();

  return fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};
