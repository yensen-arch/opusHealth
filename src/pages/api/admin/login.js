// pages/api/admin/login.js
import jwt from 'jsonwebtoken';

// Set admin credentials
const ADMIN_EMAIL = 'test@test.com';
const ADMIN_PASSWORD = 'test';
const JWT_SECRET = 'your-jwt-secret-key'; // In production, use process.env variables

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Generate JWT token
      const token = jwt.sign(
        { email, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' } // Token expires in 24 hours
      );
      
      return res.status(200).json({
        success: true,
        token
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}