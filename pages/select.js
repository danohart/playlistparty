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
  Card,
  Badge,
  Tab,
  Tabs,
  Offcanvas,
} from "react-bootstrap";
import Meta from "@/compontents/Meta";
import { siteTitle } from "@/lib/constants";
import SearchSpotify from "@/compontents/SearchSpotify";
import PlaylistInfo from "@/compontents/PlaylistInfo";
import ChatNotifications from "@/compontents/ChatMessage";
import Link from "next/link";
import PlaylistReveal from "@/compontents/PlaylistReveal";

const Select = ({ username, room, spotifyPlaylist, clearSession }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [playlistId, setPlaylistId] = useState(spotifyPlaylist);
  const [user, setUser] = useState(username);
  const [roomNumber, setRoomNumber] = useState(room);
  const [chats, setChats] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [onlineUserCount, setOnlineUsersCount] = useState(0);
  const [messageToSend, setMessageToSend] = useState("");
  const [activeTab, setActiveTab] = useState("search");

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
      const { username, message, type, trackId } = data;

      if (type === "add") {
        // Store the song addition in localStorage to persist who added each song
        const existingAdders = JSON.parse(
          localStorage.getItem(`songAdders-${roomNumber}`) || "[]"
        );
        const addersMap = new Map(existingAdders);
        addersMap.set(trackId, username);
        localStorage.setItem(
          `songAdders-${roomNumber}`,
          JSON.stringify([...addersMap])
        );
      }

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
    if (!messageToSend.trim()) return;

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
    });
    setMessageToSend("");
  };

  if (isLoading) {
    return (
      <Row className='d-flex justify-content-center align-items-center min-vh-100'>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </Spinner>
      </Row>
    );
  }

  return (
    <div className='vaporwave-page'>
      <ToastContainer position='top-end' className='position-fixed'>
        {chats.map((chat, id) => (
          <ChatNotifications chats={chat} showChat={showChat} key={id} />
        ))}
      </ToastContainer>

      <Meta title={`Welcome ${user}!`} />

      <Row className='mb-1 pt-1'>
        <Col
          xs={12}
          className='d-flex justify-content-center align-items-center'
        >
          <h1>
            <Link href='/'>{siteTitle}</Link>
          </h1>
        </Col>
      </Row>
      <Row>
        <Col className='text-center'>
          <Button
            variant='danger'
            size='sm'
            className='vaporwave-btn-danger mb-2'
            onClick={() => {
              clearSession();
              router.push("/");
            }}
          >
            Leave Room
          </Button>
        </Col>
      </Row>

      <Card className='main-card mb-4'>
        <Card.Body>
          <Row className='align-items-center'>
            <Col xs={12} md={4} className='text-center text-md-start'>
              <h5 className='room-heading'>Room #{roomNumber}</h5>
            </Col>
            <Col xs={12} md={4} className='text-center'>
              <Badge className='online-count-badge'>
                {onlineUserCount} Online
              </Badge>
            </Col>
            <Col
              xs={12}
              md={4}
              className='text-center text-md-end mt-3 mt-md-0'
            >
              <Button
                variant='secondary'
                size='lg'
                onClick={() => setShowChat(true)}
              >
                Open Chat
              </Button>
            </Col>
          </Row>

          <div className='mt-3'>
            <div className='d-flex flex-wrap gap-2 justify-content-center'>
              {onlineUsers.map((user) => (
                <Badge key={user.username} className='user-badge'>
                  <span className='emoji-icon'>{user.icon}</span>
                  {user.username}
                </Badge>
              ))}
            </div>
          </div>
        </Card.Body>
      </Card>

      <div className='content-tabs'>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className='mb-4'
        >
          <Tab eventKey='playlist' title='Playlist'>
            {playlistId && <PlaylistInfo playlistId={playlistId} />}
          </Tab>
          <Tab eventKey='search' title='Add Songs'>
            <SearchSpotify
              playlistId={playlistId}
              username={user}
              roomNumber={roomNumber}
            />
          </Tab>
        </Tabs>
      </div>

      <Offcanvas
        show={showChat}
        onHide={() => setShowChat(false)}
        placement='end'
        className='chat-sidebar'
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Chat</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className='chat-messages'>
            {chats.map((chat, index) => (
              <div
                key={index}
                className={`message ${
                  chat.username === user ? "message-sent" : "message-received"
                }`}
              >
                <div className='username'>{chat.username}</div>
                <div>{chat.message}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className='chat-input w-100'>
            <div className='d-flex gap-2'>
              <FormControl
                type='text'
                value={messageToSend}
                onChange={(e) => setMessageToSend(e.target.value)}
                placeholder='Type a message...'
                className='flex-grow-1'
              />
              <Button
                type='submit'
                disabled={!messageToSend.trim()}
                className='vaporwave-btn-primary'
              >
                Send
              </Button>
            </div>
          </form>

          {playlistId && (
            <PlaylistReveal
              playlistId={playlistId}
              username={user}
              roomNumber={roomNumber}
            />
          )}
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
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default Select;
