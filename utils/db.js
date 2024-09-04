// utils/db.js
import { MongoClient } from 'mongodb';

// Set environment variables or defaults
const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${HOST}:${PORT}`;

// Define the DBClient class
class DBClient {
  constructor() {
    // Initialize MongoDB client
    this.client = new MongoClient(url, { useUnifiedTopology: true, useNewUrlParser: true });
    
    // Connect to the MongoDB client
    this.client.connect().then(() => {
      this.db = this.client.db(DATABASE);
      console.log('Connected to MongoDB');
    }).catch((err) => {
      console.error('Failed to connect to MongoDB:', err);
    });
  }

  // Check if MongoDB client is connected
  isAlive() {
    // Check the connection status
    return this.client.isConnected();
  }

  // Get the number of documents in the 'users' collection
  async nbUsers() {
    try {
      const users = this.db.collection('users');
      return await users.countDocuments();
    } catch (err) {
      console.error('Error fetching number of users:', err);
      return 0;
    }
  }

  // Get the number of documents in the 'files' collection
  async nbFiles() {
    try {
      const files = this.db.collection('files');
      return await files.countDocuments();
    } catch (err) {
      console.error('Error fetching number of files:', err);
      return 0;
    }
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
module.exports = dbClient;

