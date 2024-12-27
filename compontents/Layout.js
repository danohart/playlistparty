import { Container, Row, Col } from "react-bootstrap";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function Layout({ children }) {
  return (
    <>
      <Container>
        <Row>
          <Col>
            <main>{children}</main>
          </Col>
        </Row>
      </Container>
      <GoogleAnalytics gaId='G-5TS75L7L97' />
    </>
  );
}
