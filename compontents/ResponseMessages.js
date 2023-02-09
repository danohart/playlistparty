export default function addSongsMessage(code) {
  if (code === 201) return "Success! Songs added to playlist.";
  if (code === 401) return "Looks like you need to log out and log in again.";
  if (code === 403)
    return `Looks like you don't have permission to add songs to this playlist.`;
  if (code === 429)
    return "Looks like the game is having connection issues with Spotify. Try again later.";
}
