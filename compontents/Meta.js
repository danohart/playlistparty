import Head from "next/head";
import Script from "next/script";
import { siteTitle } from "../lib/constants";

export default function Meta(props) {
  const metaTitle = props.title ? `${props.title} : ${siteTitle}` : siteTitle;
  const metaDescription = props.description
    ? props.description
    : `Have your group add songs to a playlist, play the playlist, then guess who added it.`;

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name='description' content={metaDescription} />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Script
        async
        src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3886685281037161'
        crossOrigin='anonymous'
      ></Script>
    </>
  );
}
