const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Mongodb connected');
    } catch (err) {
        console.log(err);
        console.error('Mongodb connection failed');
    };
};

module.exports = connectDB;