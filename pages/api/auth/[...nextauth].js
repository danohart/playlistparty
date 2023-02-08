import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

const scopes =
  "user-read-currently-playing user-top-read playlist-modify-public playlist-read-collaborative playlist-read-private playlist-modify-private";

export default NextAuth({
  providers: [
    SpotifyProvider({
      authorization: `https://accounts.spotify.com/authorize?scope=${scopes}`,
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.refresh_token;
      }
      return token;
    },
    async session(session, user) {
      session.user = user;
      return session;
    },
  },
});
