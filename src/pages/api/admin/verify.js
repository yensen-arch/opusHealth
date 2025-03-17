// pages/api/admin/verify.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-jwt-secret-key'; // Should match the secret in login.js

export default async function handler(req, res) {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      
      // Token is valid
      return res.status(200).json({ 
        success: true,
        user: {
          email: decoded.email,
          role: decoded.role
        }
      });
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}