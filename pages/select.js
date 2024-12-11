import React, { useState, useEffect } from "react";
import Pusher from "pusher-js";
import { useRouter } from "next/router";
import {
  Row,
  Col,
  Button,
  FormControl,
  ToastContainer,
  Spinner,
} from "react-bootstrap";
import Meta from "@/compontents/Meta";
import { siteTitle } from "@/lib/constants";
import SearchSpotify from "@/compontents/SearchSpotify";
import PlaylistInfo from "@/compontents/PlaylistInfo";
import ChatMessage from "@/compontents/ChatMessage";
import Link from "next/link";
import Emojis from "@/lib/emojis";

export default function Select({
  username,
  room,
  spotifyPlaylist,
  clearSession,
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [playlistId, setPlaylistId] = useState(spotifyPlaylist);
  const [user, setUser] = useState(username);
  const [roomNumber, setRoomNumber] = useState(room);
  const [chats, setChats] = useState([]);
  const [toggleChat, setToggleChat] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [onlineUserCount, setOnlineUsersCount] = useState(0);
  const [messageToSend, setMessageToSend] = useState("");

  useEffect(() => {
    if (!user || !roomNumber) {
      const storedUsername = window.localStorage.getItem("chatName");
      const storedRoom = window.localStorage.getItem("roomNumber");
      const storedPlaylistId = window.localStorage.getItem("playlistId");

      if (!storedUsername || !storedRoom) {
        router.push("/");
        return;
      }

      setUser(JSON.parse(storedUsername));
      setRoomNumber(JSON.parse(storedRoom));
      if (storedPlaylistId) {
        setPlaylistId(JSON.parse(storedPlaylistId));
      }
    }
    setIsLoading(false);
  }, [user, roomNumber]);

  async function setPlaylistIdForRoom(playlistId) {
    await fetch("/api/pusher/playlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ playlistId, username: user, roomNumber }),
    });
  }

  useEffect(() => {
    if (!user) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: `api/pusher/auth`,
      auth: { params: { username: user, playlistId } },
    });

    const channel = pusher.subscribe(`presence-playlist-shuffle-${roomNumber}`);
    const playlistChannel = pusher.subscribe(
      `presence-cache-playlist-shuffle-${roomNumber}-playlist`
    );

    playlistChannel.bind("pusher:subscription_succeeded", (members) => {
      if (members.me.info.isVip) {
        setPlaylistIdForRoom(members.me.info.playlistId);
      }
    });

    channel.bind("pusher:subscription_succeeded", (members) => {
      setOnlineUsersCount(members.count);
      setOnlineUsers([]);
      channel.members.each(function (member) {
        setOnlineUsers((prevState) => [
          ...prevState,
          { username: member.info.username, icon: member.info.emoji },
        ]);
      });
    });

    channel.bind("pusher:member_added", (member) => {
      setOnlineUsersCount(channel.members.count);
      setOnlineUsers((prevState) => [
        ...prevState,
        { username: member.info.username, icon: member.info.emoji },
      ]);
    });

    channel.bind("pusher:member_removed", (member) => {
      setOnlineUsersCount(channel.members.count);
      setOnlineUsers((state) =>
        state.filter((item) => item.username !== member.info.username)
      );
    });

    channel.bind("playlist-update", function (data) {
      const { username, message } = data;
      setChats((prevState) => [...prevState, { username, message }]);
    });

    playlistChannel.bind("playlist-id", function (data) {
      setPlaylistId(data.playlistId);
      window.localStorage.setItem(
        "playlistId",
        JSON.stringify(data.playlistId)
      );
    });

    return () => {
      pusher.unsubscribe(`presence-playlist-shuffle-${roomNumber}`);
      pusher.unsubscribe(
        `presence-cache-playlist-shuffle-${roomNumber}-playlist`
      );
      pusher.disconnect();
    };
  }, [user, roomNumber, playlistId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("/api/pusher/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messageToSend,
        username: user,
        roomNumber,
      }),
    }).then(setMessageToSend(""));
  };

  if (isLoading) {
    return (
      <div
        className='d-flex justify-content-center align-items-center'
        style={{ height: "100vh" }}
      >
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position='top-end'>
        {chats.map((chat, id) => (
          <ChatMessage chat={chat} key={id} />
        ))}
      </ToastContainer>

      <Meta title={`Welcome ${user}!`} />
      <h1>
        <Link href='/'>{siteTitle}</Link>
      </h1>
      <Row>
        <Col xs={12} sm={12} md={12} lg={12}>
          <Row>
            <Col
              xs={{ span: 8, offset: 2 }}
              sm={{ span: 8, offset: 2 }}
              md={{ span: 8, offset: 2 }}
              lg={{ span: 8, offset: 2 }}
              className='mb-2'
            >
              <div className='room-id'>
                <div className='room-id-title'>Room #</div>
                {roomNumber}
              </div>
            </Col>
          </Row>
          <Row>
            <Col
              xs={{ span: 6, offset: 3 }}
              sm={{ span: 6, offset: 3 }}
              md={{ span: 6, offset: 3 }}
              lg={{ span: 6, offset: 3 }}
            >
              <Button
                variant='dark'
                size='sm'
                className='w-100'
                onClick={() => {
                  clearSession();
                  router.push("/");
                }}
              >
                Leave Room
              </Button>
            </Col>
          </Row>

          {!playlistId ? "" : <PlaylistInfo playlistId={playlistId} />}
          <div className='text-center'>People in: {onlineUserCount}</div>
          <div className='user-row'>
            {onlineUsers.map((user) => (
              <div className='user-id' key={user.username}>
                <div className='user-emoji'>{user.icon}</div>
                {user.username}
              </div>
            ))}
          </div>
        </Col>

        <Col xs={12} sm={12} md={12} lg={12}>
          <SearchSpotify
            playlistId={playlistId}
            username={user}
            roomNumber={roomNumber}
          />
        </Col>
        <Col xs={12} sm={12} md={12} lg={12}>
          <Row>
            <Col>
              <h2>Chat</h2>
              <Button onClick={() => setToggleChat(!toggleChat)}>
                Show Chat
              </Button>
            </Col>
          </Row>
        </Col>
        <Col className={`chat-input ${!toggleChat ? "d-none" : ""}`}>
          <Row>
            <Col className='d-flex justify-content-end mb-2'>
              <Button onClick={() => setToggleChat(!toggleChat)}>X</Button>
            </Col>
          </Row>
          <form onSubmit={handleSubmit}>
            <FormControl
              type='text'
              className='chat-field'
              value={messageToSend}
              onChange={(e) => setMessageToSend(e.target.value)}
              placeholder='start typing....'
            />
            <Button
              className='chat-submit w-50 mt-2'
              type='submit'
              disabled={!messageToSend}
            >
              Send
            </Button>
          </form>
        </Col>
      </Row>
    </>
  );
}
