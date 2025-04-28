const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Accès non autorisé, token manquant' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pointage_secret_key');
    
    // Find user by id
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    // Add user to request object
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Accès non autorisé, token invalide' });
  }
};

// Middleware to check admin role
const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé, privilèges administrateur requis' });
  }
};

// Middleware to check manager or admin role
const managerAuth = (req, res, next) => {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé, privilèges de gestionnaire requis' });
  }
};

module.exports = { auth, adminAuth, managerAuth };
