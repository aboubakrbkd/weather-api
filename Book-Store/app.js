require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./models/db');

const app = express();

connectDB();
app.use(express.json());
app.use(cookieParser());
app.use('/', authRoutes);

app.get('/', (req, res) => {
    res.status(200).send("Hello World");
});


module.exports = app;