import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaUserCircle, FaThumbsUp, FaCommentAlt } from "react-icons/fa";

function Home() {
  const fakePosts = [
    {
      id: 1,
      user: "John Doe",
      content: "Just finished a great ML project! 🚀",
      time: "2 hours ago",
    },
    {
      id: 2,
      user: "Jane Smith",
      content: "Loving the new React hooks in my app!",
      time: "5 hours ago",
    },
  ];

  return (
    
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <h2 className="text-center mb-4"> Social Feed</h2>
          {fakePosts.map((post) => (
            <Card className="mb-4 shadow-sm" key={post.id}>
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <FaUserCircle size={30} className="me-2 text-primary" />
                  <div>
                    <strong>{post.user}</strong>
                    <div className="text-muted" style={{ fontSize: "0.85rem" }}>{post.time}</div>
                  </div>
                </div>
                <Card.Text>{post.content}</Card.Text>
                <div className="d-flex gap-3 mt-3">
                  <Button variant="outline-primary" size="sm">
                    <FaThumbsUp className="me-1" /> Like
                  </Button>
                  <Button variant="outline-secondary" size="sm">
                    <FaCommentAlt className="me-1" /> Comment
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
