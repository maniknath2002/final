const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTER A NEW USER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // SECURITY FIX: public registration must never allow self-service Admin creation.
    // Only Candidate/Employer may self-register; Admins must be created directly in the DB/by another Admin.
    const allowedPublicRoles = ['Candidate', 'Employer'];
    if (role && !allowedPublicRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be Candidate or Employer.' });
    }

    // Check if the user already exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Hash the password to make it secure
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new user
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Candidate' // Kept matching standard PascalCase capitalization
    });

    // Generate a token right after saving so frontend doesn't crash
    const secretKey = process.env.JWT_SECRET;
    const token = jwt.sign(
      { id: user.id, role: user.role },
      String(secretKey),
      { expiresIn: '1d' }
    );

    // Return the token and user payload exactly like the login endpoint does
    res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

// 2. LOGIN A USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Create a secure token (JWT) containing the user's ID and Role
    const secretKey = process.env.JWT_SECRET;
    const token = jwt.sign(
      { id: user.id, role: user.role },
      String(secretKey),
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

// 3. GET CURRENT LOGGED-IN USER (used by Profile page)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};
