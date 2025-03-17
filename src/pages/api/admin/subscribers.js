// pages/api/admin/subscribers.js
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-jwt-secret-key'; // Should match the secret in login.js
const ADMIN_EMAIL = 'test@test.com';

// Helper function to verify admin token
function verifyAdminToken(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Ensure it's an admin token
    if (decoded.email !== ADMIN_EMAIL || decoded.role !== 'admin') {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

// Helper function to read subscribers data
function getSubscribersData() {
  const dataFilePath = path.join(process.cwd(), 'data', 'subscribers.json');
  
  if (!fs.existsSync(dataFilePath)) {
    return [];
  }
  
  const fileContent = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(fileContent);
}

// Helper function to write subscribers data
function writeSubscribersData(subscribers) {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const dataFilePath = path.join(dataDir, 'subscribers.json');
  fs.writeFileSync(dataFilePath, JSON.stringify(subscribers, null, 2));
}

export default async function handler(req, res) {
  // Verify admin token for all requests
  const admin = verifyAdminToken(req);
  if (!admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    // GET: Retrieve all subscribers
    if (req.method === 'GET') {
      const subscribers = getSubscribersData();
      return res.status(200).json({ success: true, subscribers });
    }
    
    // DELETE: Remove a subscriber
    if (req.method === 'DELETE') {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      const subscribers = getSubscribersData();
      const filteredSubscribers = subscribers.filter(sub => sub.email !== email);
      
      // Check if any subscriber was removed
      if (subscribers.length === filteredSubscribers.length) {
        return res.status(404).json({ message: 'Subscriber not found' });
      }
      
      // Save updated subscribers list
      writeSubscribersData(filteredSubscribers);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Subscriber deleted successfully'
      });
    }
    
    // Method not allowed
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Subscribers API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}