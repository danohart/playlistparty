import { useState } from "react";
import { Button, FormControl, Spinner } from "react-bootstrap";
import { Shuffle } from "react-bootstrap-icons";
import {
  uniqueNamesGenerator,
  adjectives,
  names,
} from "unique-names-generator";
import ResponseMessages from "@/compontents/ResponseMessages";
import { events } from "@/lib/analytics";

const TAKEN_LATELY = ["Basement 2am", "Dad's car radio", "Sunday roast"];

export default function CreatePlaylist({ playlistSelect, onBack }) {
  const [playlistName, setPlaylistName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function uniquePlaylistName() {
    const uniqueNameConfig = {
      dictionaries: [adjectives, names],
      separator: "-",
      style: "capital",
      length: 2,
    };
    const uniqueName = uniqueNamesGenerator(uniqueNameConfig);

    setPlaylistName(uniqueName);
  }

  function handleChange(e) {
    setPlaylistName(e.target.value);
  }

  async function createPlaylist(playlistInfo) {
    setLoading(true);

    try {
      const res = await fetch("/api/create-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: playlistInfo.toString(),
          description: "Playlist Shuffle",
          public: false,
        }),
      });

      const body = await res.json();

      // On success the API returns the new playlist id as a bare string.
      // Anything else (e.g. { error: "..." }) means it failed — show a
      // message and stay on this screen instead of advancing.
      if (res.ok && typeof body === "string" && body) {
        events.playlistCreated();
        setMessage(ResponseMessages("playlist", res.status));
        playlistSelect({ target: { value: body } });
        return;
      }

      events.playlistCreateFailed({
        status: res.status,
        reason: (body && body.error) || "non_string_response",
      });
      setMessage(
        ResponseMessages("playlist", res.status) ||
          (body && body.error) ||
          "Couldn't create the playlist. Please try again."
      );
    } catch (err) {
      events.playlistCreateFailed({ status: 0, reason: "network_error" });
      setMessage("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p className="flow-intro">
        This is what your friends see when they punch in the code.{" "}
        {onBack ? (
          <a
            href="#back"
            onClick={(e) => {
              e.preventDefault();
              onBack();
            }}
          >
            Joining someone else&apos;s? Go back.
          </a>
        ) : (
          "Joining someone else's? Use Back above."
        )}
      </p>

      <FormControl
        size="lg"
        name="playlist-field"
        placeholder="FRIDAY NIGHT, KITCHEN FLOOR"
        value={playlistName}
        onChange={handleChange}
        maxLength={40}
        disabled={loading}
      />

      <Button
        variant="primary"
        size="lg"
        className="w-100"
        disabled={loading || playlistName.trim() === ""}
        onClick={() => createPlaylist(playlistName)}
      >
        {loading ? (
          <Spinner animation="border" size="sm" role="status">
            <span className="visually-hidden">Creating…</span>
          </Spinner>
        ) : (
          "Create playlist"
        )}
      </Button>

      <Button
        variant="outline-light"
        className="flow-secondary"
        onClick={uniquePlaylistName}
        disabled={loading}
      >
        <Shuffle aria-hidden="true" />
        Make up a name
      </Button>

      {message ? <p className="flow-note">{message}</p> : null}

      <div className="pp-taken">
        <p className="pp-taken-label">Taken lately</p>
        <div className="pp-chips">
          {TAKEN_LATELY.map((name) => (
            <button
              type="button"
              key={name}
              className="pp-chip"
              onClick={() => setPlaylistName(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
