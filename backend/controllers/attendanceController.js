const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Check in
exports.checkIn = async (req, res) => {
  try {
    const { latitude, longitude, notes } = req.body;
    
    // Check if user already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingAttendance = await Attendance.findOne({
      user: req.user._id,
      checkInTime: { $gte: today, $lt: tomorrow },
      checkOutTime: null
    });
    
    if (existingAttendance) {
      return res.status(400).json({ 
        message: 'Vous avez déjà pointé votre entrée aujourd\'hui',
        attendance: existingAttendance
      });
    }
    
    // Create new attendance record
    const attendance = new Attendance({
      user: req.user._id,
      company: req.user.company,
      checkInTime: new Date(),
      location: {
        type: 'Point',
        coordinates: [longitude || 0, latitude || 0]
      },
      notes
    });
    
    await attendance.save();
    
    res.status(201).json({
      message: 'Pointage d\'entrée enregistré avec succès',
      attendance
    });
  } catch (error) {
    console.error('Erreur de pointage d\'entrée:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Check out
exports.checkOut = async (req, res) => {
  try {
    const { latitude, longitude, notes } = req.body;
    
    // Find today's check-in record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const attendance = await Attendance.findOne({
      user: req.user._id,
      checkInTime: { $gte: today, $lt: tomorrow },
      checkOutTime: null
    });
    
    if (!attendance) {
      return res.status(404).json({ message: 'Aucun pointage d\'entrée trouvé pour aujourd\'hui' });
    }
    
    // Update check-out time and location
    attendance.checkOutTime = new Date();
    
    if (latitude && longitude) {
      attendance.location.coordinates = [longitude, latitude];
    }
    
    if (notes) {
      attendance.notes = attendance.notes 
        ? `${attendance.notes}\n${notes}` 
        : notes;
    }
    
    // Calculate total hours
    attendance.calculateHours();
    
    await attendance.save();
    
    res.json({
      message: 'Pointage de sortie enregistré avec succès',
      attendance
    });
  } catch (error) {
    console.error('Erreur de pointage de sortie:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get user's attendance history
exports.getUserAttendance = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    
    // Check if user has permission to view other user's attendance
    const targetUserId = userId || req.user._id;
    
    if (userId && userId !== req.user._id.toString() && req.user.role === 'employee') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Build query
    const query = { user: targetUserId };
    
    if (startDate || endDate) {
      query.checkInTime = {};
      
      if (startDate) {
        query.checkInTime.$gte = new Date(startDate);
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        query.checkInTime.$lt = endDateObj;
      }
    }
    
    const attendance = await Attendance.find(query)
      .sort({ checkInTime: -1 })
      .populate('user', 'name email');
    
    res.json({ attendance });
  } catch (error) {
    console.error('Erreur de récupération des pointages:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get company attendance report
exports.getCompanyAttendance = async (req, res) => {
  try {
    // Check if user has permission
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    const { startDate, endDate, department } = req.query;
    
    // Build query
    const query = { company: req.user.company };
    
    if (startDate || endDate) {
      query.checkInTime = {};
      
      if (startDate) {
        query.checkInTime.$gte = new Date(startDate);
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        query.checkInTime.$lt = endDateObj;
      }
    }
    
    // If department is specified and user is admin or manager
    if (department) {
      const users = await User.find({ 
        company: req.user.company,
        department
      }).select('_id');
      
      query.user = { $in: users.map(user => user._id) };
    }
    
    const attendance = await Attendance.find(query)
      .sort({ checkInTime: -1 })
      .populate('user', 'name email department position');
    
    res.json({ attendance });
  } catch (error) {
    console.error('Erreur de récupération du rapport de pointage:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get attendance statistics
exports.getStatistics = async (req, res) => {
  try {
    // Check if user has permission
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    const { startDate, endDate, department } = req.query;
    
    // Set default date range to current month if not specified
    let start, end;
    
    if (startDate) {
      start = new Date(startDate);
    } else {
      start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }
    
    if (endDate) {
      end = new Date(endDate);
      end.setDate(end.getDate() + 1);
    } else {
      end = new Date();
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    }
    
    // Build user query
    const userQuery = { company: req.user.company };
    
    if (department) {
      userQuery.department = department;
    }
    
    // Get all users in the company/department
    const users = await User.find(userQuery).select('_id name department');
    
    // Get attendance records for the period
    const attendanceRecords = await Attendance.find({
      user: { $in: users.map(user => user._id) },
      checkInTime: { $gte: start, $lt: end }
    });
    
    // Calculate statistics
    const totalWorkdays = Math.round((end - start) / (1000 * 60 * 60 * 24));
    
    // Group attendance by user
    const userAttendance = {};
    users.forEach(user => {
      userAttendance[user._id] = {
        user: { id: user._id, name: user.name, department: user.department },
        present: 0,
        absent: 0,
        late: 0,
        totalHours: 0
      };
    });
    
    // Count attendance
    attendanceRecords.forEach(record => {
      if (userAttendance[record.user]) {
        if (record.status === 'present') {
          userAttendance[record.user].present += 1;
        } else if (record.status === 'late') {
          userAttendance[record.user].late += 1;
        }
        
        if (record.totalHours) {
          userAttendance[record.user].totalHours += record.totalHours;
        }
      }
    });
    
    // Calculate absences
    Object.keys(userAttendance).forEach(userId => {
      userAttendance[userId].absent = totalWorkdays - userAttendance[userId].present - userAttendance[userId].late;
      if (userAttendance[userId].absent < 0) userAttendance[userId].absent = 0;
    });
    
    // Convert to array
    const statistics = Object.values(userAttendance);
    
    res.json({
      period: { start, end },
      totalWorkdays,
      statistics
    });
  } catch (error) {
    console.error('Erreur de récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
