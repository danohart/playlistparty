import Meta from "@/compontents/Meta";
import { Col, Row } from "react-bootstrap";

export default function PrivacyPolicy() {
  return (
    <Row>
      <Meta title='Privacy Policy' />
      <Col>
        <h1 id='privacy-policy-for-playlistparty'>Privacy Policy</h1>
        <h2 id='what-information-we-collect'>What Information We Collect</h2>
        <p>
          PlaylistParty collects and temporarily stores the following limited
          information:
        </p>
        <ul>
          <li>
            <strong>Username</strong>: The display name you choose when joining
            a room (not your Spotify username)
          </li>
          <li>
            <strong>Room Number</strong>: The unique code for your collaborative
            session
          </li>
          <li>
            <strong>Song Selections</strong>: Which songs users add to the
            playlist
          </li>
          <li>
            <strong>Interaction Data</strong>: User contributions and
            interactions within the session
          </li>
        </ul>
        <p>We do NOT collect or store:</p>
        <ul>
          <li>Spotify account information</li>
          <li>Personal identification information</li>
          <li>Listening history or preferences</li>
          <li>Any data about your Spotify usage outside of PlaylistParty</li>
        </ul>
        <h2 id='how-we-use-information'>How We Use Information</h2>
        <p>The information we collect is used solely to:</p>
        <ul>
          <li>Create and manage collaborative rooms</li>
          <li>Enable collaborative playlist creation</li>
          <li>Support real-time interaction between participants</li>
          <li>Facilitate synchronized updates between users</li>
        </ul>
        <h2 id='data-storage-and-retention'>Data Storage and Retention</h2>
        <ul>
          <li>
            All session data is stored locally in your browser using
            localStorage
          </li>
          <li>
            Data is automatically deleted when:
            <ul>
              <li>You leave a room</li>
              <li>You clear your browser data</li>
              <li>The collaborative session ends</li>
            </ul>
          </li>
          <li>No data is retained on servers after the session ends</li>
        </ul>
        <h2 id='third-party-services'>Third-Party Services</h2>
        <p>PlaylistParty uses:</p>
        <ul>
          <li>Spotify&#39;s API for playlist management</li>
          <li>Pusher for real-time updates</li>
        </ul>
        <p>
          Your interaction with the Spotify service is governed by Spotify&#39;s
          own privacy policy and terms of use.
        </p>
        <h2 id='your-rights'>Your Rights</h2>
        <p>You can:</p>
        <ul>
          <li>Clear your session data at any time by leaving the room</li>
          <li>Control your contributions to collaborative playlists</li>
          <li>
            Request removal of any stored data by clearing your browser data
          </li>
        </ul>
        <h2 id='contact'>Contact</h2>
        <p>
          For questions about this privacy policy or PlaylistParty&#39;s data
          practices, please contact the creator and{" "}
          <a href='mailto:playlistparty@danielhart.co'>
            Chicago based web developer
          </a>{" "}
          of this game, <a href='mailto:playlistparty@danielhart.co'>Daniel</a>.
        </p>
        <h2 id='changes-to-this-policy'>Changes to This Policy</h2>
        <p>
          We may update this privacy policy as needed. Any changes will be
          reflected in this document with a new effective date.
        </p>
        <p>Last updated: 12/12/2024</p>
      </Col>
    </Row>
  );
}
