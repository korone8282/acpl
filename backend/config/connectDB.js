// backend/config/connectDB.js
const mongoose = require('mongoose');
require('dotenv').config();

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
    console.log('mongoose connected');
  } catch (e) {
    console.log('mongoose connect error', e.message, e);
    throw new Error('Database connection failed');
  }
};

module.exports = { dbConnect };