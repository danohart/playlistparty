import React, { useState, useEffect } from "react";
import Pusher from "pusher-js";
import { Row, Col, Button, FormControl } from "react-bootstrap";
import Meta from "@/compontents/Meta";
import { siteTitle } from "@/lib/constants";

export default function Select() {
  let username = "daniel";
  const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    // use jwts in prod
    authEndpoint: `api/pusher/auth`,
    auth: { params: { username } },
  });
  const [chats, setChats] = useState([]);
  const [messageToSend, setMessageToSend] = useState("");

  useEffect(() => {
    const channel = pusher.subscribe("playlist-shuffle");

    // when a new member successfully subscribes to the channel
    // channel.bind("pusher:subscription_succeeded", (members) => {
    //   // total subscribed
    //   setOnlineUsersCount(members.count);
    // });

    // when a new member joins the chat
    channel.bind("pusher:member_added", (member) => {
      console.log("count", channel.members.count);
    });

    // // when a member leaves the chat
    // channel.bind("pusher:member_removed", (member) => {
    //   setOnlineUsersCount(channel.members.count);
    //   setUsersRemoved((prevState) => [...prevState, member.info.username]);
    // });

    // updates chats
    channel.bind("chat-update", function (data) {
      const { username, message } = data;
      setChats((prevState) => [...prevState, { username, message }]);
    });

    return () => {
      pusher.unsubscribe("playlist-shuffle");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("/api/pusher/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: messageToSend }, { username: username }),
    }).then(setMessageToSend(""));
  };

  return (
    <>
      <Meta />
      <h1>{siteTitle}</h1>
      <Row>
        <Col xs={12} sm={12} md={6} lg={6}>
          <h2>Pusher</h2>
        </Col>
        {chats.map((chat, id) => (
          <Row>
            <Col>{chat.message}</Col>
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
            <Button type='submit'>Send</Button>
          </form>
        </Col>
      </Row>
    </>
  );
}
