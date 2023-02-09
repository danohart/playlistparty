import { Container, Row, Col, Button } from "react-bootstrap";
import { useSession, signIn, signOut } from "next-auth/react";
import { siteTitle } from "@/lib/constants";
import Meta from "./Meta";

export default function Layout({ children }) {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        <Container>
          <header>
            <Row>
              <Col xs={8}>
                Signed in as <strong>{session.token.name}</strong>
                <br />
                <Button
                  variant='outline-primary'
                  onClick={() => signOut()}
                  className='ms-1'
                >
                  Sign out
                </Button>
              </Col>
              <Col>
                <img
                  width='64'
                  height='auto'
                  align='right'
                  src={session.token.picture}
                />
              </Col>
            </Row>
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
      <Meta />
      <Container>
        <Row>
          <Col>
            <main>
              <h1>{siteTitle}</h1>
              <Col
                xs={{ span: 8, offset: 2 }}
                sm={{ span: 8, offset: 2 }}
                md={{ span: 8, offset: 2 }}
                lg={{ span: 8, offset: 2 }}
              >
                <Button className='w-100' size='lg' onClick={() => signIn()}>
                  Get Started
                </Button>
              </Col>
              <Row>
                <Col className='text-center mt-3'>
                  You'll need a Spotify account to get started.
                </Col>
              </Row>
            </main>
          </Col>
        </Row>
      </Container>
    </>
  );
}
