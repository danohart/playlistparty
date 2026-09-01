import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import Meta from "@/compontents/Meta";
import FlowLayout from "@/compontents/FlowLayout";
import CodeInput from "@/compontents/CodeInput";
import CreatePlaylist from "@/compontents/CreatePlaylist";
import JoinRoom from "@/compontents/JoinRoom";
import SetUsername from "@/compontents/SetUsername";
import InvitePrompt from "@/compontents/InvitePrompt";
import { events } from "@/lib/analytics";

const ROOM_CODE_LENGTH = 5;

const HOW_IT_PLAYS = [
  {
    title: "Add in secret",
    body: "Submit your tracks. Nobody sees who added what.",
  },
  {
    title: "Play it out loud",
    body: "One speaker, one room, one shuffled playlist.",
  },
  {
    title: "Guess out loud",
    body: "Take turns. Get it right, take a point. Get it wrong, learn something.",
  },
];

export default function Home({
  handleLogin,
  handleLoginChange,
  handleRoomChange,
  handlePlaylistChange,
  spotifyPlaylist,
  clearSession,
  room,
  showInvitePrompt,
  continueToRoom,
}) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [gameChoice, setGameChoice] = useState(null);
  const [code, setCode] = useState("");
  const [joinError, setJoinError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-select "Join" mode if room parameter is in URL
  useEffect(() => {
    if (router.query.room && !gameChoice) {
      const roomNum = parseInt(router.query.room);
      if (!isNaN(roomNum)) {
        events.newFlow();
        events.inviteLinkOpened(roomNum);
        handleRoomChange({ target: { value: roomNum } });
        setCode(String(roomNum));
        setGameChoice("join");
        events.roomJoinStarted();
      }
    }
  }, [router.query.room, gameChoice]);

  const startParty = () => {
    events.newFlow();
    events.roomCreationStarted();
    setGameChoice("create");
  };

  const handleJoinSubmit = async () => {
    if (code.length !== ROOM_CODE_LENGTH || isJoining) return;
    setJoinError(null);
    setIsJoining(true);
    try {
      const res = await fetch(`/api/pusher/check-room?roomNumber=${code}`);
      const data = await res.json();
      if (data.error || !data.exists) {
        setJoinError("No party with that code.");
        return;
      }
      events.newFlow();
      events.roomJoinStarted();
      handleRoomChange({ target: { value: code } });
      setGameChoice("join");
    } catch (err) {
      setJoinError("Couldn't check that code. Try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const backToHome = () => {
    clearSession();
    setGameChoice(null);
    setCode("");
    setJoinError(null);
  };

  // --- Create / join flow -------------------------------------------------
  if (isClient && gameChoice === "create") {
    if (!spotifyPlaylist) {
      return (
        <>
          <Meta description='Start a Playlist Party — name your party and build a playlist in secret with the room.' />
          <FlowLayout
            step={1}
            onBack={() => setGameChoice(null)}
            heading={
              <>
                Name your
                <br />
                party
              </>
            }
          >
            <CreatePlaylist
              playlistSelect={handlePlaylistChange}
              onBack={() => setGameChoice(null)}
            />
          </FlowLayout>
        </>
      );
    }

    if (showInvitePrompt) {
      return (
        <>
          <Meta />
          <FlowLayout
            step={3}
            heading={
              <>
                Share the
                <br />
                code
              </>
            }
          >
            <InvitePrompt roomNumber={room} onContinue={continueToRoom} />
          </FlowLayout>
        </>
      );
    }

    return (
      <>
        <Meta />
        <FlowLayout
          step={2}
          heading={
            <>
              Pick a
              <br />
              name
            </>
          }
        >
          <p className='flow-intro'>
            Playlist created. This name is just what shows up next to your
            messages in the room.
          </p>
          <SetUsername
            handleLoginChange={handleLoginChange}
            handleLogin={handleLogin}
            createRoom
          />
        </FlowLayout>
      </>
    );
  }

  if (isClient && gameChoice === "join") {
    return (
      <>
        <Meta description='Join a Playlist Party with the code your host read out.' />
        <FlowLayout
          onBack={backToHome}
          heading={
            <>
              Join the
              <br />
              party
            </>
          }
        >
          <p className='flow-intro'>
            Punch in the code your host read out, then pick the name the room
            sees.
          </p>
          <JoinRoom handleRoomChange={handleRoomChange} roomNumber={room} />
          <SetUsername
            handleLoginChange={handleLoginChange}
            handleLogin={handleLogin}
            roomNumber={room}
          />
        </FlowLayout>
      </>
    );
  }

  // --- Homepage (design 2a) --------------------------------------------------
  return (
    <>
      <Meta description='PlaylistParty is a social music challenge where you can test your knowledge and share your favorite tunes with friends.' />
      <div className='pp-home'>
        <section className='pp-hero'>
          <div className='pp-wrap'>
            <p className='pp-eyebrow'>Playlist Party</p>
            <h1 className='pp-title'>
              Whose
              <br />
              song
              <br />
              is this?
            </h1>
            <p className='pp-subhead'>
              A playlist built in secret by everyone in the room. Press play and
              start accusing.
            </p>
          </div>
        </section>

        <section className='pp-section pp-actions'>
          <div className='pp-wrap'>
            <Button
              variant='primary'
              size='lg'
              className='w-100'
              disabled={!isClient}
              onClick={startParty}
            >
              Start a party
            </Button>

            <div className='pp-divider'>
              <span>Or join one</span>
              <hr />
            </div>

            <div>
              <div className='pp-code-row'>
                <CodeInput
                  value={code}
                  onChange={(v) => {
                    setCode(v);
                    if (joinError) setJoinError(null);
                  }}
                  onSubmit={handleJoinSubmit}
                  length={ROOM_CODE_LENGTH}
                  invalid={!!joinError}
                  disabled={!isClient || isJoining}
                />
                <Button
                  variant='outline-light'
                  onClick={handleJoinSubmit}
                  disabled={
                    !isClient || isJoining || code.length !== ROOM_CODE_LENGTH
                  }
                >
                  {isJoining ? "…" : "Join"}
                </Button>
              </div>
              {joinError && (
                <p className='pp-code-error' role='alert'>
                  {joinError}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className='pp-section pp-section--tight pp-how'>
          <div className='pp-wrap'>
            {HOW_IT_PLAYS.map((card, i) => (
              <div
                key={card.title}
                className={`pp-how-card${
                  card.accent ? " pp-how-card--accent" : ""
                }`}
              >
                <span className='pp-how-num'>{i + 1}</span>
                <div>
                  <p className='pp-how-title'>{card.title}</p>
                  <p className='pp-how-body'>{card.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

Home.fullBleed = true;

export async function getStaticProps() {
  return {
    props: {},
  };
}
