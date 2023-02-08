import { Container, Row, Col, Button } from "react-bootstrap";
import { useSession, signIn, signOut } from "next-auth/react";
import { siteTitle } from "@/lib/constants";

export default function Layout({ children }) {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        <Container>
          <header>
            Signed in as {session.token.email}
            <Button onClick={() => signOut()}>Sign out</Button>
          </header>
          <Row>
            <Col>
              <main>{children}</main>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
  return (
    <>
      <Container>
        <Row>
          <Col>
            <main>
              <h1>{siteTitle}</h1>
              <Col
                xs={{ span: 6, offset: 3 }}
                sm={{ span: 6, offset: 3 }}
                md={{ span: 6, offset: 3 }}
                lg={{ span: 6, offset: 3 }}
              >
                <Button onClick={() => signIn()}>Get Started</Button>
              </Col>
            </main>
          </Col>
        </Row>
      </Container>
    </>
  );
}
