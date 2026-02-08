const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const collection = mongoose.connection.collection('users');
        await collection.dropIndex('username_1');
        console.log('Index username_1 dropped successfully');
    } catch (error) {
        console.error('Error dropping index:', error.message);
    } process.exit();
};

dropIndex();
