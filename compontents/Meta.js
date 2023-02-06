import Head from "next/head";

export default function Meta(props) {
  const metaTitle = props.title
    ? `${props.title} : Playlist Shuffle`
    : `Playlist Shuffle`;
  const metaDescription = props.description
    ? props.description
    : `Have your group add songs to a playlist, play the playlist, then guess who added it.`;

  return (
    <Head>
      <title>{metaTitle}</title>
      <meta name='description' content={metaDescription} />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <link rel='icon' href='/favicon.ico' />
    </Head>
  );
}
