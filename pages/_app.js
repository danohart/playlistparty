import { SessionProvider } from "next-auth/react";
import "@/styles/style.scss";
import Layout from "@/compontents/Layout";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}
