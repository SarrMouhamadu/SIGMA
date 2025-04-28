const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database for demo purposes
const db = {
  users: [],
  attendances: []
};

console.log('Using in-memory database for demo purposes');


// Auth routes
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, position, department } = req.body;
    
    // Check if user exists
    const existingUser = db.users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In a real app, we would hash this
      role: 'employee',
      department,
      position,
      createdAt: new Date()
    };
    
    db.users.push(newUser);
    
    // Generate token
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET || 'pointage_secret_key',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = db.users.find(user => user.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Check password (in a real app, we would compare hashed passwords)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'pointage_secret_key',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Auth middleware for protected routes
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Accès non autorisé, token manquant' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pointage_secret_key');
    const user = db.users.find(user => user.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Accès non autorisé, token invalide' });
  }
};

app.get('/api/auth/profile', auth, (req, res) => {
  res.json({ user: { ...req.user, password: undefined } });
});

app.put('/api/auth/profile', auth, (req, res) => {
  try {
    const { name, department, position } = req.body;
    
    // Find user and update
    const userIndex = db.users.findIndex(user => user.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    db.users[userIndex] = {
      ...db.users[userIndex],
      name: name || db.users[userIndex].name,
      department: department || db.users[userIndex].department,
      position: position || db.users[userIndex].position
    };
    
    res.json({
      message: 'Profil mis à jour avec succès',
      user: { ...db.users[userIndex], password: undefined }
    });
  } catch (error) {
    console.error('Erreur de mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Attendance routes
app.post('/api/attendance/check-in', auth, (req, res) => {
  try {
    const { latitude, longitude, notes } = req.body;
    
    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingAttendance = db.attendances.find(a => 
      a.userId === req.user.id && 
      new Date(a.checkInTime) >= today && 
      new Date(a.checkInTime) < tomorrow && 
      !a.checkOutTime
    );
    
    if (existingAttendance) {
      return res.status(400).json({
        message: 'Vous avez déjà pointé votre entrée aujourd\'hui',
        attendance: existingAttendance
      });
    }
    
    // Create new attendance
    const attendance = {
      id: Date.now().toString(),
      userId: req.user.id,
      checkInTime: new Date(),
      location: { latitude: latitude || 0, longitude: longitude || 0 },
      notes,
      status: 'present'
    };
    
    db.attendances.push(attendance);
    
    res.status(201).json({
      message: 'Pointage d\'entrée enregistré avec succès',
      attendance
    });
  } catch (error) {
    console.error('Erreur de pointage d\'entrée:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

app.post('/api/attendance/check-out', auth, (req, res) => {
  try {
    const { latitude, longitude, notes } = req.body;
    
    // Find today's check-in
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const attendanceIndex = db.attendances.findIndex(a => 
      a.userId === req.user.id && 
      new Date(a.checkInTime) >= today && 
      new Date(a.checkInTime) < tomorrow && 
      !a.checkOutTime
    );
    
    if (attendanceIndex === -1) {
      return res.status(404).json({ message: 'Aucun pointage d\'entrée trouvé pour aujourd\'hui' });
    }
    
    // Update attendance
    const checkOutTime = new Date();
    const totalHours = (checkOutTime - new Date(db.attendances[attendanceIndex].checkInTime)) / (1000 * 60 * 60);
    
    db.attendances[attendanceIndex] = {
      ...db.attendances[attendanceIndex],
      checkOutTime,
      totalHours,
      notes: notes ? (db.attendances[attendanceIndex].notes ? `${db.attendances[attendanceIndex].notes}\n${notes}` : notes) : db.attendances[attendanceIndex].notes
    };
    
    res.json({
      message: 'Pointage de sortie enregistré avec succès',
      attendance: db.attendances[attendanceIndex]
    });
  } catch (error) {
    console.error('Erreur de pointage de sortie:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

app.get('/api/attendance/history', auth, (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let filteredAttendances = db.attendances.filter(a => a.userId === req.user.id);
    
    if (startDate) {
      filteredAttendances = filteredAttendances.filter(a => 
        new Date(a.checkInTime) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setDate(endDateObj.getDate() + 1);
      filteredAttendances = filteredAttendances.filter(a => 
        new Date(a.checkInTime) < endDateObj
      );
    }
    
    // Sort by date (newest first)
    filteredAttendances.sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));
    
    res.json({ attendance: filteredAttendances });
  } catch (error) {
    console.error('Erreur de récupération des pointages:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.send('Pointage SaaS API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
