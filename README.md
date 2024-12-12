# PlaylistParty 🎵

Build the perfect playlist together. Drop in your favorite tracks, chat about music, and discover new songs through friends. Your collaborative soundtrack starts here.

## Features

- Create collaborative playlists in real-time
- Chat with friends while building playlists
- Share stories behind your music choices
- See who's currently in the room
- Search and add songs from Spotify
- Real-time updates for all participants

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Spotify Developer](https://developer.spotify.com/) account
- A [Pusher](https://pusher.com/) account

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/playlist-party.git
cd playlist-party
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:
```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REFRESH_TOKEN=your_spotify_refresh_token
APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
```

### Getting the Required Credentials

#### Spotify Setup
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Get your Client ID and Client Secret
4. Add `http://localhost:3000` to your Redirect URIs in the app settings
5. To get your refresh token:
   - Use the [Spotify OAuth Tool](https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started) (easiest)
   - Or implement the OAuth flow manually following Spotify's documentation

#### Pusher Setup
1. Create a free account at [Pusher](https://pusher.com/)
2. Create a new Channels app
3. Get your app credentials from the app dashboard
4. Make sure to enable client events in your app settings

## Running the Application

1. Start the development server:
```bash
npm run dev
# or
yarn dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
playlist-party/
├── components/          # React components
├── lib/                 # Utility functions and API helpers
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   └── ...
├── public/             # Static files
├── styles/             # SCSS styles
├── .env               # Environment variables
└── ...
```

## Key Technologies

- [Next.js](https://nextjs.org/) - React framework
- [Pusher](https://pusher.com/) - Real-time updates
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) - Music data and playback
- [React Bootstrap](https://react-bootstrap.github.io/) - UI components
- [SCSS](https://sass-lang.com/) - Styling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Local Development Tips

- Use the Next.js development server which includes hot-reloading
- Test real-time features using multiple browser windows
- Monitor your Pusher dashboard for debugging real-time events
- Check the browser console and server logs for debugging

## Troubleshooting

Common issues and solutions:

- **Spotify API 401 errors**: Your refresh token might be expired. Generate a new one.
- **Pusher connection issues**: Check if client events are enabled in your Pusher app settings.
- **Real-time updates not working**: Ensure all environment variables are correctly set.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Spotify Web API for providing music data
- Pusher for real-time functionality
- The Next.js team for the amazing framework

---

Made with ❤️ by Daniel Hart in Chicago, IL, USA 🇺🇸