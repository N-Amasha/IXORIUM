const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json()); // JSON data reading 
app.use(cors()); // give access to other Domain Requests
// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Database connection success!'))
  .catch(err => console.log('Database error:', err));

// Home Route
app.get('/', (req, res) => {
    res.send('IXORIUM Backend Server is Running!');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/progress', require('./routes/progress'));

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is working  on Port ${PORT}...`));