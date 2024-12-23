import { getAccessToken, getUserId } from "../../lib/spotify";

export default async function addToPlaylist(req, res) {
  let createPlaylist;

  try {
    const { access_token } = await getAccessToken();

    // Get user response and await its JSON parsing
    const userResponse = await getUserId();
    const userData = await userResponse.json();
    const id = userData.id;

    console.log("User ID:", id);

    createPlaylist = await fetch(
      `https://api.spotify.com/v1/users/${id}/playlists`,
      {
        method: req.method,
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );
    console.log("createPlaylist status:", createPlaylist.status);

    if (!createPlaylist.ok) {
      const errorText = await createPlaylist.text();
      console.log("Error response:", errorText);
      throw new Error(
        `Spotify API error: ${createPlaylist.status} ${createPlaylist.statusText}`
      );
    }

    const data = await createPlaylist.json();
    return res.status(createPlaylist.status).json(data.id);
  } catch (error) {
    console.error("Error creating playlist:", error);
    const status = createPlaylist?.status || 500;
    return res.status(status).json({
      error: error.message || "Failed to create playlist",
    });
  }
}
