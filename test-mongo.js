const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URI || 'mongodb://localhost:27017/skill-swap-platform');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skill-swap-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('Database:', mongoose.connection.db.databaseName);
    
    await mongoose.disconnect();
    console.log('Connection closed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure MongoDB is installed and running');
    console.log('2. On Windows, check if MongoDB service is running');
    console.log('3. Try running: mongod --dbpath /path/to/data/db');
    console.log('4. Check if port 27017 is available');
  }
}

testMongoConnection(); 