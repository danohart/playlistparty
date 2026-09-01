import { Container, Row, Col } from "react-bootstrap";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function Layout({ children, fullBleed }) {
  return (
    <>
      {fullBleed ? (
        <div className="full-bleed">{children}</div>
      ) : (
        <Container>
          <Row>
            <Col>
              <main>{children}</main>
            </Col>
          </Row>
        </Container>
      )}
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
    </>
  );
}
