import React, { useState, useEffect, useRef } from "react";
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
import { events, getClientId } from "@/lib/analytics";

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
  const [showChat, setShowChat] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [onlineUserCount, setOnlineUsersCount] = useState(0);
  const [messageToSend, setMessageToSend] = useState("");
  const [activeTab, setActiveTab] = useState("search");
  const sessionStartTime = useRef(Date.now());
  const peakCountRef = useRef(0);
  const onlineCountRef = useRef(0);
  const roomEnteredFiredRef = useRef(false);
  const reachedSearchTabRef = useRef(true); // "search" is the default tab
  const performedSearchRef = useRef(false);
  const hasExitedRef = useRef(false);
  const [isLeader, setIsLeader] = useState(false);
  const [initialAddedTrackIds, setInitialAddedTrackIds] = useState([]);

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

  // Claim/read the room's leader. Whoever gets here first (normally the
  // creator, who lands on this page before anyone can follow the invite link)
  // becomes the leader; everyone else just learns who it is. Safe to re-run on
  // refresh — it never steals leadership, only reports it.
  useEffect(() => {
    if (!roomNumber) return;

    const clientId = getClientId();
    fetch("/api/room/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomNumber, clientId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsLeader(data.leaderId === clientId);
        setInitialAddedTrackIds(data.addedTrackIds || []);
      })
      .catch((err) => console.error("Error initializing room leader:", err));
  }, [roomNumber]);

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

    // Main presence channel for user tracking and chat
    const channel = pusher.subscribe(`presence-playlist-shuffle-${roomNumber}`);

    // Playlist channel for handling playlist-specific events
    const playlistChannel = pusher.subscribe(
      `presence-cache-playlist-shuffle-${roomNumber}-playlist`
    );

    // Only handle VIP status and playlist ID on playlist channel
    playlistChannel.bind("pusher:subscription_succeeded", (members) => {
      if (members.me.info.isVip) {
        setPlaylistIdForRoom(members.me.info.playlistId);
      }
    });

    // Handle playlist ID updates
    playlistChannel.bind("playlist-id", function (data) {
      setPlaylistId(data.playlistId);
      window.localStorage.setItem(
        "playlistId",
        JSON.stringify(data.playlistId)
      );
    });

    // Keep a ref copy of the online count so the Pusher callbacks (which do not
    // re-run on re-render) can read the current value, and track the peak.
    const setCount = (next) => {
      const value = Math.max(0, next);
      onlineCountRef.current = value;
      peakCountRef.current = Math.max(peakCountRef.current, value);
      setOnlineUsersCount(value);
    };

    playlistChannel.bind("pusher:subscription_succeeded", (members) => {
      setCount(members.count);

      // Fire room_entered once, with the real participant count.
      if (!roomEnteredFiredRef.current) {
        roomEnteredFiredRef.current = true;
        events.markRoomEntered(roomNumber);
        events.roomEntered(roomNumber, members.count);
      }

      const currentUsers = [];
      members.each((member) => {
        currentUsers.push({
          username: member.info.username,
          icon: member.info.emoji,
        });
      });
      setOnlineUsers(currentUsers);
    });

    playlistChannel.bind("pusher:member_added", (member) => {
      setCount(onlineCountRef.current + 1);
      events.roomParticipantChanged(
        roomNumber,
        onlineCountRef.current,
        peakCountRef.current
      );
      setOnlineUsers((prevUsers) => [
        ...prevUsers,
        {
          username: member.info.username,
          icon: member.info.emoji,
        },
      ]);
    });

    playlistChannel.bind("pusher:member_removed", (member) => {
      setCount(onlineCountRef.current - 1);
      events.roomParticipantChanged(
        roomNumber,
        onlineCountRef.current,
        peakCountRef.current
      );
      setOnlineUsers((prevUsers) =>
        prevUsers.filter((user) => user.username !== member.info.username)
      );
    });

    // Handle chat messages. "add"/"reveal" are system events for the Playlist
    // tab (handled by PlaylistReveal's own subscription to this channel) —
    // real chat messages, sent from handleSubmit below, carry no `type`. Note:
    // an "add" event deliberately does not carry a username — see
    // pages/api/add-to-playlist.js — so nobody can learn who submitted a track
    // before the leader reveals it.
    channel.bind("playlist-update", function (data) {
      if (data.type) return;

      const { username, message } = data;
      setChats((prevState) => [...prevState, { username, message }]);
    });

    return () => {
      pusher.unsubscribe(`presence-playlist-shuffle-${roomNumber}`);
      pusher.unsubscribe(
        `presence-cache-playlist-shuffle-${roomNumber}-playlist`
      );
      pusher.disconnect();
    };
  }, [user, roomNumber, playlistId]);

  // Rest of the component remains the same...

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
    events.messageSent(roomNumber);
    setMessageToSend("");
  };

  const handleChatOpen = () => {
    events.chatOpened(roomNumber);
    setShowChat(true);
  };

  const handleTabChange = (tabName) => {
    if (tabName === "search") reachedSearchTabRef.current = true;
    events.tabChanged(tabName, roomNumber);
    setActiveTab(tabName);
  };

  const buildExitPayload = (reason) => {
    const sessionDurationSec = Math.floor(
      (Date.now() - sessionStartTime.current) / 1000
    );
    let songsAdded = 0;
    try {
      const userSongs = JSON.parse(
        localStorage.getItem(`userSongs-${roomNumber}`) || "{}"
      );
      songsAdded = userSongs[user] ? 1 : 0;
    } catch (e) {
      /* ignore */
    }
    return {
      session_duration_sec: sessionDurationSec,
      songs_added: songsAdded,
      peak_user_count: peakCountRef.current,
      reached_search_tab: reachedSearchTabRef.current,
      performed_search: performedSearchRef.current,
      reason,
    };
  };

  const fireExit = (reason, options) => {
    if (hasExitedRef.current || !roomNumber) return;
    hasExitedRef.current = true;
    events.roomExited(roomNumber, buildExitPayload(reason), options);
  };

  // Most people leave by closing the tab, not the button — capture that too.
  useEffect(() => {
    const onPageHide = () => fireExit("tab_close", { beacon: true });
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        fireExit("tab_close", { beacon: true });
      }
    };
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomNumber, user]);

  const handleLeaveRoom = () => {
    fireExit("leave_button");
    clearSession();
    router.push("/");
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
    <>
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
            onClick={handleLeaveRoom}
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
                onClick={handleChatOpen}
              >
                Open Chat
              </Button>
            </Col>
          </Row>

          <div className='mt-3'>
            <div className='d-flex flex-wrap gap-2 justify-content-center'>
              {onlineUsers.map((user, index) => (
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
          onSelect={handleTabChange}
          className='mb-4'
        >
          <Tab eventKey='playlist' title='Playlist'>
            {playlistId && (
              <>
                <PlaylistInfo playlistId={playlistId} />
                <PlaylistReveal
                  playlistId={playlistId}
                  username={user}
                  roomNumber={roomNumber}
                  isLeader={isLeader}
                  initialAddedTrackIds={initialAddedTrackIds}
                />
              </>
            )}
          </Tab>
          <Tab eventKey='search' title='Add Songs'>
            <SearchSpotify
              playlistId={playlistId}
              username={user}
              roomNumber={roomNumber}
              onSearchPerformed={() => {
                performedSearchRef.current = true;
              }}
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
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
