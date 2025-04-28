const User = require('../models/User');
const Company = require('../models/Company');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'pointage_secret_key',
    { expiresIn: '7d' }
  );
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, companyId, department, position } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Check if company exists
    let company = null;
    if (companyId) {
      company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Entreprise non trouvée' });
      }
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'employee',
      company: companyId,
      department,
      position
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Erreur de récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, department, position } = req.body;
    
    // Find user and update
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, department, position },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ 
      message: 'Profil mis à jour avec succès',
      user 
    });
  } catch (error) {
    console.error('Erreur de mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
