import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-3 mt-5">
      <Container>
        <Row>
          <Col className="text-center">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} PointageSaaS - Tous droits réservés
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
