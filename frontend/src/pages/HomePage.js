import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUserClock, FaChartLine, FaUsers, FaMobileAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <Container>
      <Row className="py-5 text-center">
        <Col>
          <h1 className="display-4 mb-4">Solution de Pointage en Ligne</h1>
          <p className="lead mb-4">
            Simplifiez la gestion des présences et du temps de travail de vos employés avec notre plateforme SaaS intuitive.
          </p>
          {!user ? (
            <div className="d-flex justify-content-center gap-3">
              <Link to="/register">
                <Button variant="primary" size="lg">S'inscrire</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline-primary" size="lg">Se connecter</Button>
              </Link>
            </div>
          ) : (
            <Link to="/dashboard">
              <Button variant="success" size="lg">Accéder au tableau de bord</Button>
            </Link>
          )}
        </Col>
      </Row>

      <Row className="py-5">
        <Col md={12} className="text-center mb-5">
          <h2 className="mb-4">Pourquoi choisir notre solution ?</h2>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="h-100 text-center p-4">
            <div className="text-center mb-3">
              <FaUserClock size={50} color="#3498db" />
            </div>
            <Card.Body>
              <Card.Title>Pointage Simplifié</Card.Title>
              <Card.Text>
                Système de pointage intuitif permettant aux employés d'enregistrer facilement leurs heures d'arrivée et de départ.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="h-100 text-center p-4">
            <div className="text-center mb-3">
              <FaChartLine size={50} color="#2ecc71" />
            </div>
            <Card.Body>
              <Card.Title>Rapports Détaillés</Card.Title>
              <Card.Text>
                Accédez à des rapports complets sur les présences, les retards et les heures supplémentaires pour une meilleure gestion.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="h-100 text-center p-4">
            <div className="text-center mb-3">
              <FaUsers size={50} color="#9b59b6" />
            </div>
            <Card.Body>
              <Card.Title>Gestion d'Équipe</Card.Title>
              <Card.Text>
                Organisez vos employés par départements et suivez facilement les performances individuelles et collectives.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="h-100 text-center p-4">
            <div className="text-center mb-3">
              <FaMobileAlt size={50} color="#e74c3c" />
            </div>
            <Card.Body>
              <Card.Title>Accessible Partout</Card.Title>
              <Card.Text>
                Application responsive accessible sur tous les appareils pour un pointage facile, même en déplacement.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="py-5 bg-light rounded">
        <Col md={12} className="text-center mb-5">
          <h2 className="mb-4">Nos Forfaits</h2>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 text-center">
            <Card.Header as="h5" className="bg-primary text-white">Basique</Card.Header>
            <Card.Body>
              <Card.Title className="pricing-card-title">
                <span className="display-4">19€</span>
                <small className="text-muted"> / mois</small>
              </Card.Title>
              <ul className="list-unstyled mt-3 mb-4">
                <li>Jusqu'à 10 employés</li>
                <li>Rapports basiques</li>
                <li>Support par email</li>
                <li>Accès mobile</li>
              </ul>
              <Button variant="outline-primary" size="lg">Commencer</Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 text-center border-primary">
            <Card.Header as="h5" className="bg-primary text-white">Premium</Card.Header>
            <Card.Body>
              <Card.Title className="pricing-card-title">
                <span className="display-4">49€</span>
                <small className="text-muted"> / mois</small>
              </Card.Title>
              <ul className="list-unstyled mt-3 mb-4">
                <li>Jusqu'à 50 employés</li>
                <li>Rapports avancés</li>
                <li>Support prioritaire</li>
                <li>Géolocalisation</li>
              </ul>
              <Button variant="primary" size="lg">Commencer</Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 text-center">
            <Card.Header as="h5" className="bg-primary text-white">Entreprise</Card.Header>
            <Card.Body>
              <Card.Title className="pricing-card-title">
                <span className="display-4">99€</span>
                <small className="text-muted"> / mois</small>
              </Card.Title>
              <ul className="list-unstyled mt-3 mb-4">
                <li>Employés illimités</li>
                <li>Rapports personnalisés</li>
                <li>Support dédié 24/7</li>
                <li>API & intégrations</li>
              </ul>
              <Button variant="outline-primary" size="lg">Contacter</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
