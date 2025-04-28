import React, { useState } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { FaUser, FaBuilding, FaBriefcase } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    position: user?.position || ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Le nom est obligatoire');
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      const result = await updateProfile(formData);
      
      if (result.success) {
        setSuccess('Profil mis à jour avec succès');
      } else {
        setError(result.message || 'Erreur lors de la mise à jour du profil');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la mise à jour du profil');
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
              <FaUser className="me-2" />
              Mon Profil
            </h2>
            
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Nom complet</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Entrez votre nom complet"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={user?.email || ''}
                  disabled
                />
                <Form.Text className="text-muted">
                  L'email ne peut pas être modifié
                </Form.Text>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="department">
                    <Form.Label>
                      <FaBuilding className="me-2" />
                      Département
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="department"
                      placeholder="Votre département"
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="position">
                    <Form.Label>
                      <FaBriefcase className="me-2" />
                      Poste
                    </Form.Label>
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
                {loading ? 'Mise à jour en cours...' : 'Mettre à jour le profil'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ProfilePage;
