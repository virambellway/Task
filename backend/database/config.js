

const mongoose = require('mongoose');
// const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://127.0.0.1:27017/task";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process if MongoDB connection fails
  });

module.exports = mongoose.connection;
