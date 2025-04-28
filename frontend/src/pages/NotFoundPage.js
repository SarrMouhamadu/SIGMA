import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={6}>
          <FaExclamationTriangle size={100} className="text-warning mb-4" />
          <h1 className="display-4 mb-4">Page non trouvée</h1>
          <p className="lead mb-4">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <Link to="/">
            <Button variant="primary" size="lg">
              Retour à l'accueil
            </Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;
