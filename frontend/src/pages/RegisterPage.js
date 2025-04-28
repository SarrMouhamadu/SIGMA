import React, { useState } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserPlus } from 'react-icons/fa';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    position: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { name, email, password, confirmPassword, company, position, department } = formData;
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const userData = {
        name,
        email,
        password,
        position,
        department,
        companyName: company
      };
      
      const result = await register(userData);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="justify-content-md-center my-5">
      <Col md={8}>
        <Card className="p-4">
          <Card.Body>
            <h2 className="text-center mb-4">
              <FaUserPlus className="me-2" />
              Inscription
            </h2>
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Nom complet *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Entrez votre nom complet"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Entrez votre email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Mot de passe *</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Entrez votre mot de passe"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Form.Text className="text-muted">
                      Le mot de passe doit contenir au moins 6 caractères
                    </Form.Text>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="confirmPassword">
                    <Form.Label>Confirmer le mot de passe *</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirmez votre mot de passe"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="company">
                    <Form.Label>Entreprise</Form.Label>
                    <Form.Control
                      type="text"
                      name="company"
                      placeholder="Nom de votre entreprise"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="department">
                    <Form.Label>Département</Form.Label>
                    <Form.Control
                      type="text"
                      name="department"
                      placeholder="Votre département"
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="position">
                    <Form.Label>Poste</Form.Label>
                    <Form.Control
                      type="text"
                      name="position"
                      placeholder="Votre poste"
                      value={formData.position}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button
                variant="primary"
                type="submit"
                className="w-100 mt-3"
                disabled={loading}
              >
                {loading ? 'Inscription en cours...' : 'S\'inscrire'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
        
        <div className="text-center mt-3">
          Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
        </div>
      </Col>
    </Row>
  );
};

export default RegisterPage;
