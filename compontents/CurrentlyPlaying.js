import { Row, Col } from "react-bootstrap";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

export default function CurrentlyPlaying({ ...props }) {
  const { data, error, isLoading } = useSWR("/api/now-playing", fetcher);

  if (error) return <div>failed to load</div>;
  if (isLoading) return "loading...";

  return (
    <Row>
      <Col
        xs={{ span: 10, offset: 1 }}
        sm={{ span: 10, offset: 1 }}
        md={{ span: 10, offset: 1 }}
        lg={{ span: 10, offset: 1 }}
      >
        <h2 className='text-center'>Currently Playing</h2>
        <Row className='track'>
          <Col
            xs={12}
            sm={12}
            md={12}
            lg={12}
            className={`track-image ${data.isPlaying ? null : "loading"}`}
          >
            <img src={data.albumImageUrl} />
          </Col>
          <Col
            xs={12}
            sm={12}
            md={12}
            lg={12}
            className={`track-title ${data.isPlaying ? null : "loading"}`}
          >
            {data.isPlaying ? data.title : ""}
          </Col>
          <Col
            xs={12}
            sm={12}
            md={12}
            lg={12}
            className={`track-artist ${data.isPlaying ? null : "loading"}`}
          >
            {data.isPlaying ? data.artist : "Nothing Playing"}
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
