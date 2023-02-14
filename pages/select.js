import React, { useState, useEffect } from "react";
import Pusher from "pusher-js";
import { Row, Col, Button, FormControl } from "react-bootstrap";
import Meta from "@/compontents/Meta";
import { siteTitle } from "@/lib/constants";
import SearchSpotify from "@/compontents/SearchSpotify";
import addSongsMessage from "@/compontents/ResponseMessages";

export default function Select({ username }) {
  let playlistId = null;
  if (typeof window !== "undefined") {
    playlistId = localStorage.getItem("playlistId") || null;
  }

  const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    // use jwts in prod
    authEndpoint: `api/pusher/auth`,
    auth: { params: { username, playlistId } },
  });
  const [chats, setChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([
    { username: username + "(you)" },
  ]);
  const [onlineUserCount, setOnlineUsersCount] = useState(0);
  const [messageToSend, setMessageToSend] = useState("");
  const [songsToAdd, setSongsToAdd] = useState("");
  const [message, setMessage] = useState(null);
  const [roomNumber, setRoomNumber] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined")
      setRoomNumber(
        new URLSearchParams(window.location.search).get("roomNumber")
      );

    const channel = pusher.subscribe(`presence-playlist-shuffle-${roomNumber}`);

    // when a new member successfully subscribes to the channel
    channel.bind("pusher:subscription_succeeded", (members) => {
      // total subscribed
      setOnlineUsersCount(members.count);
    });

    // when a new member joins the chat
    channel.bind("pusher:member_added", (member) => {
      console.log("member", member.info);
      setOnlineUsersCount(channel.members.count);
      setOnlineUsers((prevState) => [
        ...prevState,
        {
          username: member.info.username,
        },
      ]);
    });

    // when a member leaves the chat
    channel.bind("pusher:member_removed", (member) => {
      setOnlineUsersCount(channel.members.count);
    });

    // updates chats
    channel.bind("playlist-update", function (data) {
      const { username, message } = data;

      setChats((prevState) => [...prevState, { username, message }]);
    });

    return () => {
      pusher.unsubscribe(`presence-playlist-shuffle-${roomNumber}`);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("/api/pusher/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: messageToSend, username, roomNumber }),
    }).then(setMessageToSend(""));
  };

  function addToPlaylist(songs) {
    // if (songs.indexOf("https://open.spotify")) {
    //   setMessage("Oops! Please put in an official share URL");
    //   return;
    // }

    // const songId = songs.split("/", 10)[4].split("?", 1);

    const songUri = "spotify:track:" + songs;

    fetch("/api/add-to-playlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: [songUri], playlistId }),
    }).then((res) => setMessage(addSongsMessage("songs", res.status)));
  }

  function selectTrack(trackId) {
    setSongsToAdd(trackId);
  }

  return (
    <>
      <Meta />
      <h1>{siteTitle}</h1>
      <Row>
        <Col xs={12} sm={12} md={6} lg={6}>
          <h2>People in: {onlineUserCount}</h2>
          <div>Room Number: {roomNumber}</div>
        </Col>
        {chats.map((chat, id) => (
          <Row key={id}>
            <Col>
              {chat.username}: {chat.message}
            </Col>
          </Row>
        ))}
        <Col>
          <form
            onSubmit={(e) => {
              handleSubmit(e);
            }}
          >
            <FormControl
              type='text'
              value={messageToSend}
              onChange={(e) => setMessageToSend(e.target.value)}
              placeholder='start typing....'
            />
            <Button
              className='w-50 mt-2'
              type='submit'
              disabled={!messageToSend}
            >
              Send
            </Button>
          </form>
        </Col>
      </Row>
      <Row>
        <Col xs={12} sm={12} md={6} lg={6}>
          <SearchSpotify selectTrack={addToPlaylist} />
          {message ? (
            <Row>
              <Col>{message}</Col>
            </Row>
          ) : null}
          <Row>
            <Col>
              Who&apos;s here? -{" "}
              {onlineUsers.map((user) => user.username + " ")}
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
}
