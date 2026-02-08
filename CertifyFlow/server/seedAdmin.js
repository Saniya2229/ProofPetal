// Script to create an admin user for demo/testing purposes
// Run with: node seedAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
};

const createAdminUser = async () => {
    await connectDB();

    const User = require('./models/User');

    // Admin credentials for demo
    const adminEmail = 'admin@certifyflow.com';
    const adminPassword = 'Admin123!';
    const adminName = 'System Administrator';

    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            // Update existing user to admin role
            existingAdmin.role = 'admin';
            existingAdmin.password = adminPassword; // Will be hashed by pre-save hook
            await existingAdmin.save();
            console.log('✅ Existing user updated to admin:');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Password: ${adminPassword}`);
            console.log(`   Role: admin`);
        } else {
            // Create new admin user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            await User.create({
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });

            console.log('✅ Admin user created successfully:');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Password: ${adminPassword}`);
            console.log(`   Role: admin`);
        }

        console.log('\n📌 Use these credentials to log in at /admin-login');

    } catch (error) {
        console.error('Error creating admin:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDatabase connection closed.');
    }
};

createAdminUser();
