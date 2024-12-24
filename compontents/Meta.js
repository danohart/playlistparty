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
        <link rel='icon' href='/favicon.ico' type='image/x-icon' />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/favicon-32x32.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/favicon-16x16.png'
        />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/apple-touch-icon.png'
        />
        <link rel='manifest' href='/manifest.json' />
        <meta name='theme-color' content='#002C27' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='PlaylistParty' />
        <meta name='application-name' content='PlaylistParty' />
        <meta name='msapplication-TileColor' content='#002C27' />
      </Head>
      <Script
        async
        src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3886685281037161'
        crossOrigin='anonymous'
      ></Script>
    </>
  );
}
