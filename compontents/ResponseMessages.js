export default function addSongsMessage(type, code) {
  if (code === 201)
    return `${
      type === "songs"
        ? `Success! Song added to playlist.`
        : `Playlist created!`
    }`;
  if (code === 401) return "Looks like you need to log out and log in again.";
  if (code === 403)
    return `Looks like you don't have permission to add songs to this playlist.`;
  if (code === 429)
    return "Looks like there are connection issues with Spotify. Try again later.";
  if (code === 400) return `Whoops. Bad request!`;
}
