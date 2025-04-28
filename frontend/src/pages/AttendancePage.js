import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Form, Alert, Spinner } from 'react-bootstrap';
import { FaSignInAlt, FaSignOutAlt, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { checkIn, checkOut, getUserAttendance } from '../services/attendanceService';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AttendancePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get user's attendance history
      const result = await getUserAttendance(filters);
      
      if (result.success) {
        setAttendanceData(result.data.attendance);
        
        // Check if there's an active check-in without check-out
        const active = result.data.attendance.find(
          (a) => a.checkInTime && !a.checkOutTime
        );
        
        if (active) {
          setCurrentAttendance(active);
        } else {
          setCurrentAttendance(null);
        }
      } else {
        setError(result.message || 'Erreur lors de la récupération des données');
      }
    } catch (err) {
      setError('Une erreur est survenue lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Get current location if available
      let location = {};
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (err) {
          console.log('Géolocalisation non disponible');
        }
      }
      
      const result = await checkIn(location);
      
      if (result.success) {
        setSuccess('Pointage d\'entrée enregistré avec succès');
        setCurrentAttendance(result.data.attendance);
        fetchAttendanceData();
      } else {
        setError(result.message || 'Erreur lors du pointage d\'entrée');
      }
    } catch (err) {
      setError('Une erreur est survenue lors du pointage d\'entrée');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Get current location if available
      let location = {};
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (err) {
          console.log('Géolocalisation non disponible');
        }
      }
      
      const result = await checkOut(location);
      
      if (result.success) {
        setSuccess('Pointage de sortie enregistré avec succès');
        setCurrentAttendance(null);
        fetchAttendanceData();
      } else {
        setError(result.message || 'Erreur lors du pointage de sortie');
      }
    } catch (err) {
      setError('Une erreur est survenue lors du pointage de sortie');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchAttendanceData();
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Calculate time difference
  const calculateDuration = (checkIn, checkOut) => {
    if (!checkOut) return 'En cours';
    
    const diffMs = new Date(checkOut) - new Date(checkIn);
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}min`;
  };

  return (
    <div className="py-4">
      <h1 className="mb-4">Gestion des Pointages</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <h5 className="mb-3">Pointage du jour</h5>
              <div className="d-flex gap-3">
                <Button 
                  variant="success" 
                  onClick={handleCheckIn}
                  disabled={loading || currentAttendance}
                >
                  <FaSignInAlt className="me-2" />
                  Pointer l'entrée
                </Button>
                <Button 
                  variant="danger" 
                  onClick={handleCheckOut}
                  disabled={loading || !currentAttendance}
                >
                  <FaSignOutAlt className="me-2" />
                  Pointer la sortie
                </Button>
              </div>
              
              {currentAttendance && (
                <div className="mt-3">
                  <Alert variant="info">
                    <strong>Pointage en cours</strong> - Entrée à {formatDate(currentAttendance.checkInTime)}
                  </Alert>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Filtrer les pointages</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleFilterSubmit}>
                <Row>
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaCalendarAlt className="me-2" />
                        Date de début
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaCalendarAlt className="me-2" />
                        Date de fin
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={2} className="d-flex align-items-end">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      <FaSearch className="me-2" />
                      Filtrer
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Historique des pointages</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Chargement des données...</p>
                </div>
              ) : attendanceData.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Entrée</th>
                      <th>Sortie</th>
                      <th>Durée</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((attendance) => (
                      <tr key={attendance.id || attendance._id}>
                        <td>{new Date(attendance.checkInTime).toLocaleDateString('fr-FR')}</td>
                        <td>{formatDate(attendance.checkInTime)}</td>
                        <td>{attendance.checkOutTime ? formatDate(attendance.checkOutTime) : 'En cours'}</td>
                        <td>{calculateDuration(attendance.checkInTime, attendance.checkOutTime)}</td>
                        <td>
                          <span className={`badge bg-${
                            attendance.status === 'present' ? 'success' :
                            attendance.status === 'late' ? 'warning' :
                            attendance.status === 'absent' ? 'danger' : 'primary'
                          }`}>
                            {attendance.status === 'present' ? 'Présent' :
                             attendance.status === 'late' ? 'En retard' :
                             attendance.status === 'absent' ? 'Absent' :
                             attendance.status === 'half-day' ? 'Demi-journée' : 'Congé'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center py-3">Aucun pointage trouvé pour la période sélectionnée</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AttendancePage;
