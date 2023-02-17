import React, { useState } from "react";
import "@/styles/style.scss";
import Layout from "@/compontents/Layout";
import { useRouter } from "next/router";

export default function App({ Component, pageProps: { ...pageProps } }) {
  const [username, setUsername] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    router.push(`/select?roomNumber=${roomNumber}`);
  };

  return (
    <Layout>
      <Component
        handleLoginChange={(e) => setUsername(e.target.value)}
        handleLogin={handleLogin}
        username={username}
        roomNumber={roomNumber}
        handleRoomChange={(e) => setRoomNumber(e.target.value)}
        {...pageProps}
      />
    </Layout>
  );
}
