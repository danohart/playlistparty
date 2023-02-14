import { Container, Row, Col } from "react-bootstrap";

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
    </>
  );
}
