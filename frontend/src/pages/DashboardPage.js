import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);
import { FaUserCheck, FaUserClock, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getUserAttendance } from '../services/attendanceService';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [statistics, setStatistics] = useState({
    present: 0,
    absent: 0,
    late: 0,
    totalHours: 0,
    workdays: 0,
    expectedTotalHours: 0
  });

  // Horaires de travail
  const WORK_START = '07:30';
  const WORK_END = '16:00';

  // Calcule la différence en heures entre deux horaires HH:mm
  function getWorkHoursPerDay(start, end) {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let diff = (eh + em/60) - (sh + sm/60);
    if (diff < 0) diff += 24;
    return diff;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const attendanceResult = await getUserAttendance();
        if (attendanceResult.success) {
          // --- Période du mois courant ---
          const now = new Date();
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
          const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          // Filtrer les pointages du mois courant
          const attendanceMonth = attendanceResult.data.attendance.filter(att => {
            const checkIn = att.checkInTime ? new Date(att.checkInTime) : null;
            return checkIn && checkIn >= firstDay && checkIn <= lastDay;
          });
          setAttendanceData(attendanceMonth);

          // Calculer les jours ouvrés du mois (lundi-samedi)
          let workdays = 0;
          for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            if (d.getDay() !== 0) workdays++;
          }
          const workHoursPerDay = getWorkHoursPerDay(WORK_START, WORK_END);
          const expectedTotalHours = workdays * workHoursPerDay;

          // Statistiques du mois courant
          let present = 0, absent = 0, late = 0, totalHours = 0;
          for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            if (d.getDay() === 0) continue; // skip dimanche
            const dayDate = new Date(d);
            const att = attendanceMonth.find(a => {
              const checkIn = a.checkInTime ? new Date(a.checkInTime) : null;
              return checkIn && checkIn.toDateString() === dayDate.toDateString();
            });
            if (att && att.checkInTime) {
              const checkIn = new Date(att.checkInTime);
              const checkOut = att.checkOutTime ? new Date(att.checkOutTime) : null;
              const workStart = new Date(checkIn);
              const [h, m] = WORK_START.split(':');
              workStart.setHours(Number(h), Number(m), 0, 0);
              if (checkIn > workStart) {
                late++;
              } else {
                present++;
              }
              if (checkOut) {
                const diffMs = checkOut - checkIn;
                totalHours += diffMs / (1000 * 60 * 60);
              }
            } else {
              absent++;
            }
          }
          setStatistics({ present, absent, late, totalHours, workdays, expectedTotalHours });
        } else {
          setError('Erreur lors de la récupération des données de pointage');
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

  // Infos du mois courant
  const now = new Date();
  const currentMonthName = now.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  const workdays = statistics.workdays || 0;
  const expectedTotalHours = statistics.expectedTotalHours || 0;
  const proportion = expectedTotalHours > 0 ? (statistics.totalHours / expectedTotalHours) * 100 : 0;

  return (
    <div className="py-4">
      <h1 className="mb-2">Tableau de bord</h1>
      <h5 className="mb-4">Mois courant : <b style={{ textTransform: 'capitalize' }}>{currentMonthName}</b></h5>
      <div className="mb-3 text-muted" style={{ fontSize: 15 }}>
        Jours ouvrés : <b>{workdays}</b> &nbsp;|&nbsp; Heures attendues : <b>{expectedTotalHours.toFixed(1)}h</b> &nbsp;|&nbsp; Heures pointées : <b>{statistics.totalHours.toFixed(1)}h</b> &nbsp;|&nbsp; Taux de pointage : <b>{proportion.toFixed(1)}%</b>
      </div>
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
      
      {/* Graphe en cercle de la répartition */}
      <Row className="mb-4">
        <Col md={6} className="mx-auto">
          <Card>
            <Card.Body>
              <h5 className="mb-3 text-center">Répartition des 30 derniers jours</h5>
              <div style={{ maxWidth: 250, margin: '0 auto' }}>
                <Doughnut
                  data={{
                    labels: ['Présent', 'Retard', 'Absent'],
                    datasets: [
                      {
                        data: [statistics.present, statistics.late, statistics.absent],
                        backgroundColor: ['#2ecc71', '#f39c12', '#e74c3c'],
                        borderWidth: 2
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'bottom',
                      labels: {
                        font: { size: 16 }
                      }
                    }
                  }
                }}
              />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card>
             <Card.Header className="d-flex justify-content-between align-items-center">
               <h5 className="mb-0">Pointages récents</h5>
               <div>
                 <Button 
                   variant="outline-success" 
                   size="sm"
                   className="me-2"
                   onClick={() => {
                     // Exporter les 30 derniers jours
                     const exportData = attendanceData.map(attendance => ({
                       'Date': new Date(attendance.checkInTime).toLocaleDateString('fr-FR'),
                       'Entrée': attendance.checkInTime ? formatDate(attendance.checkInTime) : '',
                       'Sortie': attendance.checkOutTime ? formatDate(attendance.checkOutTime) : '',
                       'Durée': calculateDuration(attendance.checkInTime, attendance.checkOutTime),
                       'Statut': (() => {
                         const checkIn = attendance.checkInTime ? new Date(attendance.checkInTime) : null;
                         if (checkIn) {
                           const workStart = new Date(checkIn);
                           const [h, m] = WORK_START.split(':');
                           workStart.setHours(Number(h), Number(m), 0, 0);
                           if (checkIn > workStart) {
                             return 'late';
                           } else {
                             return 'present';
                           }
                         } else {
                           return 'Absent';
                         }
                       })()
                     }));
                     const ws = XLSX.utils.json_to_sheet(exportData);
                     const wb = XLSX.utils.book_new();
                     XLSX.utils.book_append_sheet(wb, ws, 'Pointages 30j');
                     const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                     saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'pointages_30_derniers_jours.xlsx');
                   }}
                 >
                   Exporter Excel (30j)
                 </Button>
                 <Button variant="outline-primary" size="sm" href="/attendance">
                   Voir tout
                 </Button>
               </div>
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
