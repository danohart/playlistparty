# Playlist Shuffle Game

Gather your friends. Add songs to a playlist individually. Then shuffle and play through the playlist while everyone guesses who added each song.
## Getting Started

*Pull requests are welcomed! Let us know how to improve this app and game play!* 

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## [API routes](https://nextjs.org/docs/api-routes/introduction)

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Spotify Integration

Currently, this app is using the Spotify Web API along with [NextAuth](https://next-auth.js.org/) for authentication for the app. In order to function, you will need a `SPOTIFY_CLIENT_ID` and`SPOTIFY_CLIENT_SECRET` in a `.env` file in the root of this project. To get running quickly, reference this blog post to get a refresh token for your project - [https://dev.to/j471n/how-to-use-spotify-api-with-nextjs-50o5](https://dev.to/j471n/how-to-use-spotify-api-with-nextjs-50o5). The required scope that is needed for Spotify permissions are listed below.

```
playlist-read-collaborative
playlist-read-private
playlist-modify-public
playlist-modify-private
```
## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
