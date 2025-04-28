import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { FaUserCheck, FaUserClock, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getUserAttendance, getStatistics } from '../services/attendanceService';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [statistics, setStatistics] = useState({
    present: 0,
    absent: 0,
    late: 0,
    totalHours: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user's recent attendance
        const attendanceResult = await getUserAttendance();
        
        if (attendanceResult.success) {
          setAttendanceData(attendanceResult.data.attendance.slice(0, 5));
        } else {
          setError('Erreur lors de la récupération des données de pointage');
        }
        
        // Get statistics if user is admin or manager
        if (user.role === 'admin' || user.role === 'manager') {
          const statsResult = await getStatistics();
          
          if (statsResult.success) {
            // Process statistics data
            const stats = {
              present: 0,
              absent: 0,
              late: 0,
              totalHours: 0
            };
            
            statsResult.data.statistics.forEach(userStat => {
              stats.present += userStat.present;
              stats.absent += userStat.absent;
              stats.late += userStat.late;
              stats.totalHours += userStat.totalHours;
            });
            
            setStatistics(stats);
          }
        }
      } catch (err) {
        setError('Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

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

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <h1 className="mb-4">Tableau de bord</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div className="mb-3">
                <FaUserCheck size={40} color="#2ecc71" />
              </div>
              <Card.Title>Présences</Card.Title>
              <Card.Text className="display-4">{statistics.present}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div className="mb-3">
                <FaUserClock size={40} color="#e74c3c" />
              </div>
              <Card.Title>Absences</Card.Title>
              <Card.Text className="display-4">{statistics.absent}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div className="mb-3">
                <FaClock size={40} color="#f39c12" />
              </div>
              <Card.Title>Retards</Card.Title>
              <Card.Text className="display-4">{statistics.late}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div className="mb-3">
                <FaCalendarAlt size={40} color="#3498db" />
              </div>
              <Card.Title>Heures totales</Card.Title>
              <Card.Text className="display-4">
                {statistics.totalHours.toFixed(1)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Pointages récents</h5>
              <Button variant="outline-primary" size="sm" href="/attendance">
                Voir tout
              </Button>
            </Card.Header>
            <Card.Body>
              {attendanceData.length > 0 ? (
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
                      <tr key={attendance._id}>
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
                <p className="text-center py-3">Aucun pointage récent trouvé</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
