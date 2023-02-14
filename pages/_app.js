import React, { useState } from "react";
import "@/styles/style.scss";
import Layout from "@/compontents/Layout";
import { useRouter } from "next/router";

export default function App({ Component, pageProps: { ...pageProps } }) {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleLogin = (e) => {
    router.push(`/select?roomNumber=${e}`);
  };

  return (
    <Layout>
      <Component
        handleLoginChange={(e) => setUsername(e.target.value)}
        handleLogin={handleLogin}
        username={username}
        {...pageProps}
      />
    </Layout>
  );
}
