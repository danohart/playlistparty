import useSWR from "swr";
import fetcher from "../lib/fetcher";
import Form from "react-bootstrap/Form";

export default function AllPlaylists() {
  const { data, error, isLoading } = useSWR("/api/all-playlists", fetcher);
  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  return (
    <Form.Select aria-label='Default select'>
      <option>Select Playlist</option>
      {data.map((playlist) => (
        <option
          value={playlist.id}
          xs={12}
          sm={12}
          md={12}
          lg={12}
          key={playlist.id}
        >
          {playlist.name}
        </option>
      ))}
    </Form.Select>
  );
}
