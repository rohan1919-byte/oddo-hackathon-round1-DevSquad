const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const AdminMessage = require('./models/AdminMessage');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap';

// Sample users with Indian names
const sampleUsers = [
    {
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        password: "password123",
        location: "Mumbai, Maharashtra",
        photo: "https://randomuser.me/api/portraits/women/1.jpg",
        skillsOffered: ["Cooking", "Yoga", "Hindi Teaching"],
        skillsWanted: ["Programming", "Photography"],
        availability: "Weekends",
        isPublic: true,
        isBanned: false
    },
    {
        name: "Arjun Patel",
        email: "arjun.patel@example.com",
        password: "password123",
        location: "Delhi, NCR",
        photo: "https://randomuser.me/api/portraits/men/2.jpg",
        skillsOffered: ["Programming", "Guitar", "English"],
        skillsWanted: ["Cooking", "Meditation"],
        availability: "Evenings",
        isPublic: true,
        isBanned: false
    },
    {
        name: "Meera Reddy",
        email: "meera.reddy@example.com",
        password: "password123",
        location: "Bangalore, Karnataka",
        photo: "https://randomuser.me/api/portraits/women/3.jpg",
        skillsOffered: ["Dance", "Art", "Telugu"],
        skillsWanted: ["Programming", "Cooking"],
        availability: "Weekdays",
        isPublic: true,
        isBanned: false
    },
    {
        name: "Rahul Singh",
        email: "rahul.singh@example.com",
        password: "password123",
        location: "Pune, Maharashtra",
        photo: "https://randomuser.me/api/portraits/men/4.jpg",
        skillsOffered: ["Photography", "Cricket", "Punjabi"],
        skillsWanted: ["Programming", "Cooking"],
        availability: "Weekends",
        isPublic: true,
        isBanned: false
    },
    {
        name: "Anjali Gupta",
        email: "anjali.gupta@example.com",
        password: "password123",
        location: "Chennai, Tamil Nadu",
        photo: "https://randomuser.me/api/portraits/women/5.jpg",
        skillsOffered: ["Carnatic Music", "Tamil", "Cooking"],
        skillsWanted: ["Programming", "Yoga"],
        availability: "Evenings",
        isPublic: true,
        isBanned: false
    },
    {
        name: "Vikram Malhotra",
        email: "vikram.malhotra@example.com",
        password: "password123",
        location: "Hyderabad, Telangana",
        photo: "https://randomuser.me/api/portraits/men/6.jpg",
        skillsOffered: ["Programming", "Chess", "Hindi"],
        skillsWanted: ["Cooking", "Music"],
        availability: "Weekends",
        isPublic: true,
        isBanned: false
    },
    {
        name: "Kavya Iyer",
        email: "kavya.iyer@example.com",
        password: "password123",
        location: "Kolkata, West Bengal",
        photo: "https://randomuser.me/api/portraits/women/7.jpg",
        skillsOffered: ["Bengali", "Poetry", "Painting"],
        skillsWanted: ["Programming", "Cooking"],
        availability: "Weekdays",
        isPublic: true,
        isBanned: false
    },
    {
        name: "Aditya Verma",
        email: "aditya.verma@example.com",
        password: "password123",
        location: "Ahmedabad, Gujarat",
        photo: "https://randomuser.me/api/portraits/men/8.jpg",
        skillsOffered: ["Gujarati", "Business", "Cricket"],
        skillsWanted: ["Programming", "Music"],
        availability: "Evenings",
        isPublic: true,
        isBanned: false
    }
];

async function setupDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB successfully!');

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await AdminMessage.deleteMany({});

        // Create admin user
        console.log('Creating admin user...');
        const adminPassword = await bcrypt.hash('admin123', 10);
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@skillswap.com',
            password: adminPassword,
            location: 'India',
            photo: 'https://randomuser.me/api/portraits/men/9.jpg',
            skillsOffered: ['Platform Management', 'Support'],
            skillsWanted: ['User Feedback'],
            availability: '24/7',
            isPublic: true,
            isBanned: false,
            isAdmin: true
        });
        await adminUser.save();
        console.log('Admin user created successfully!');

        // Create sample users
        console.log('Creating sample users...');
        for (const userData of sampleUsers) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = new User({
                ...userData,
                password: hashedPassword
            });
            await user.save();
        }
        console.log(`${sampleUsers.length} sample users created successfully!`);

        // Create welcome admin message
        console.log('Creating welcome message...');
        const welcomeMessage = new AdminMessage({
            text: 'Welcome to Skill Swap! Connect with people, share your skills, and learn from others in our vibrant community.',
            isActive: true
        });
        await welcomeMessage.save();
        console.log('Welcome message created successfully!');

        console.log('\n🎉 Database setup completed successfully!');
        console.log('\nDefault credentials:');
        console.log('Admin: admin@skillswap.com / admin123');
        console.log('Sample users: Use any email from the list with password "password123"');
        console.log('\nSample user emails:');
        sampleUsers.forEach(user => {
            console.log(`- ${user.email}`);
        });

    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed.');
    }
}

setupDatabase(); 