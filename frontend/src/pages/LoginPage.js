import React, { useState } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignInAlt } from 'react-icons/fa';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="justify-content-md-center my-5">
      <Col md={6}>
        <Card className="p-4">
          <Card.Body>
            <h2 className="text-center mb-4">
              <FaSignInAlt className="me-2" />
              Connexion
            </h2>
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Entrez votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 mt-3"
                disabled={loading}
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </Form>
            
            <div className="text-center mt-3">
              <Link to="/forgot-password">Mot de passe oublié ?</Link>
            </div>
          </Card.Body>
        </Card>
        
        <div className="text-center mt-3">
          Vous n'avez pas de compte ? <Link to="/register">S'inscrire</Link>
        </div>
      </Col>
    </Row>
  );
};

export default LoginPage;
