import React, { useState, useEffect } from "react";
import Pusher from "pusher-js";
import { Row, Col, Button, FormControl } from "react-bootstrap";
import Meta from "@/compontents/Meta";
import { siteTitle } from "@/lib/constants";
import SearchSpotify from "@/compontents/SearchSpotify";
import addSongsMessage from "@/compontents/ResponseMessages";

export default function Select({ username, roomNumber, spotifyPlaylist }) {
  const [playlistId, setPlaylistId] = useState(spotifyPlaylist);
  const [chats, setChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([
    { username: username + "(you)" },
  ]);
  const [onlineUserCount, setOnlineUsersCount] = useState(0);
  const [messageToSend, setMessageToSend] = useState("");
  const [message, setMessage] = useState(null);

  async function setPlaylistIdForRoom(playlistId) {
    await fetch("/api/pusher/playlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ playlistId, username, roomNumber }),
    });
  }

  const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    // use jwts in prod
    authEndpoint: `api/pusher/auth`,
    auth: { params: { username, playlistId } },
  });

  useEffect(() => {
    const channel = pusher.subscribe(`presence-playlist-shuffle-${roomNumber}`);
    const playlistChannel = pusher.subscribe(
      `presence-cache-playlist-shuffle-${roomNumber}-playlist`
    );

    playlistChannel.bind("pusher:subscription_succeeded", (members) => {
      if (members.me.info.isVip) {
        setPlaylistIdForRoom(members.me.info.playlistId);
      }
    });
    // when a new member successfully subscribes to the channel
    channel.bind("pusher:subscription_succeeded", (members) => {
      // total subscribed
      setOnlineUsersCount(members.count);
      // setOnlineUsers((prevState) => [
      //   ...prevState,
      //   {
      //     username: members.me.username,
      //   },
      // ]);
    });

    // when a new member joins the chat
    channel.bind("pusher:member_added", (member) => {
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
      setOnlineUsers((prevState) => [
        ...prevState,
        {
          username: member.info.username,
        },
      ]);
    });

    // updates chats
    channel.bind("playlist-update", function (data) {
      const { username, message } = data;
      setChats((prevState) => [...prevState, { username, message }]);
    });

    // updates playlistId
    playlistChannel.bind("playlist-id", function (data) {
      setPlaylistId(data.playlistId);
    });

    return () => {
      pusher.unsubscribe(`presence-playlist-shuffle-${roomNumber}`);
      pusher.unsubscribe(
        `presence-cache-playlist-shuffle-${roomNumber}-playlist`
      );
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
    const songUri = "spotify:track:" + songs;

    fetch("/api/add-to-playlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: [songUri], playlistId }),
    }).then((res) => setMessage(addSongsMessage("songs", res.status)));
  }

  return (
    <>
      <Meta title={`Welcome ${username}!`} />
      <h1>{siteTitle}</h1>
      <Row>
        <Col xs={12} sm={12} md={12} lg={12}>
          <div className='room-id'>{roomNumber}</div>
          <h2>People in: {onlineUserCount}</h2>
          <div className='user-row'>
            {onlineUsers.map((user) => (
              <div className='user-id' key={user.username}>
                {user.username}
              </div>
            ))}
          </div>
        </Col>

        <Col xs={12} sm={12} md={12} lg={12}>
          <SearchSpotify selectTrack={addToPlaylist} />
        </Col>
        <Col xs={12} sm={12} md={12} lg={12}>
          <Row>
            <Col>
              <h2>Chat</h2>
              <Row className='chat'>
                {chats.map((chat, id) => (
                  <Col xs={12} sm={12} md={12} lg={12} key={id}>
                    <div className='chat-message'>{chat.message}</div>
                    <div className='chat-username'>{chat.username}</div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Col>
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
        <Col xs={12} sm={12} md={12} lg={12}>
          {message ? (
            <Row>
              <Col>{message}</Col>
            </Row>
          ) : null}
        </Col>
      </Row>
    </>
  );
}
