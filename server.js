const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// In-memory storage (replace MongoDB)
let users = [];
let swaps = [];
let adminMessages = [];
let feedbackLogs = [];

// Sample users with Indian names
const sampleUsers = [
    {
        id: 1,
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        password: "$2a$10$e8InJRdB3mOxWA6d.TE0iuOZ/7Q8hq/OxXRS5/3P50MJ96IYrt5x6", // password123
        location: "Mumbai, Maharashtra",
        photo: "https://randomuser.me/api/portraits/women/1.jpg",
        skillsOffered: ["Cooking", "Yoga", "Hindi Teaching"],
        skillsWanted: ["Programming", "Photography"],
        availability: "Weekends",
        isPublic: true,
        isBanned: false,
        isAdmin: false
    },
    {
        id: 2,
        name: "Arjun Patel",
        email: "arjun.patel@example.com",
        password: "$2a$10$e8InJRdB3mOxWA6d.TE0iuOZ/7Q8hq/OxXRS5/3P50MJ96IYrt5x6", // password123
        location: "Delhi, NCR",
        photo: "https://randomuser.me/api/portraits/men/2.jpg",
        skillsOffered: ["Programming", "Guitar", "English"],
        skillsWanted: ["Cooking", "Meditation"],
        availability: "Evenings",
        isPublic: true,
        isBanned: false,
        isAdmin: false
    },
    {
        id: 3,
        name: "Meera Reddy",
        email: "meera.reddy@example.com",
        password: "$2a$10$e8InJRdB3mOxWA6d.TE0iuOZ/7Q8hq/OxXRS5/3P50MJ96IYrt5x6", // password123
        location: "Bangalore, Karnataka",
        photo: "https://randomuser.me/api/portraits/women/3.jpg",
        skillsOffered: ["Dance", "Art", "Telugu"],
        skillsWanted: ["Programming", "Cooking"],
        availability: "Weekdays",
        isPublic: true,
        isBanned: false,
        isAdmin: false
    },
    {
        id: 4,
        name: "Rahul Singh",
        email: "rahul.singh@example.com",
        password: "$2a$10$e8InJRdB3mOxWA6d.TE0iuOZ/7Q8hq/OxXRS5/3P50MJ96IYrt5x6", // password123
        location: "Pune, Maharashtra",
        photo: "https://randomuser.me/api/portraits/men/4.jpg",
        skillsOffered: ["Photography", "Cricket", "Punjabi"],
        skillsWanted: ["Programming", "Cooking"],
        availability: "Weekends",
        isPublic: true,
        isBanned: false,
        isAdmin: false
    },
    {
        id: 5,
        name: "Anjali Gupta",
        email: "anjali.gupta@example.com",
        password: "$2a$10$e8InJRdB3mOxWA6d.TE0iuOZ/7Q8hq/OxXRS5/3P50MJ96IYrt5x6", // password123
        location: "Chennai, Tamil Nadu",
        photo: "https://randomuser.me/api/portraits/women/5.jpg",
        skillsOffered: ["Carnatic Music", "Tamil", "Cooking"],
        skillsWanted: ["Programming", "Yoga"],
        availability: "Evenings",
        isPublic: true,
        isBanned: false,
        isAdmin: false
    },
    {
        id: 6,
        name: "Vikram Malhotra",
        email: "vikram.malhotra@example.com",
        password: "$2a$10$e8InJRdB3mOxWA6d.TE0iuOZ/7Q8hq/OxXRS5/3P50MJ96IYrt5x6", // password123
        location: "Hyderabad, Telangana",
        photo: "https://randomuser.me/api/portraits/men/6.jpg",
        skillsOffered: ["Programming", "Chess", "Hindi"],
        skillsWanted: ["Cooking", "Music"],
        availability: "Weekends",
        isPublic: true,
        isBanned: false,
        isAdmin: false
    },
    {
        id: 7,
        name: "Kavya Iyer",
        email: "kavya.iyer@example.com",
        password: "$2a$10$e8InJRdB3mOxWA6d.TE0iuOZ/7Q8hq/OxXRS5/3P50MJ96IYrt5x6", // password123
        location: "Kolkata, West Bengal",
        photo: "https://randomuser.me/api/portraits/women/7.jpg",
        skillsOffered: ["Bengali", "Poetry", "Painting"],
        skillsWanted: ["Programming", "Cooking"],
        availability: "Weekdays",
        isPublic: true,
        isBanned: false,
        isAdmin: false
    },
    {
        id: 8,
        name: "Aditya Verma",
        email: "aditya.verma@example.com",
        password: "$2a$10$e8InJRdB3mOxWA6d.TE0iuOZ/7Q8hq/OxXRS5/3P50MJ96IYrt5x6", // password123
        location: "Ahmedabad, Gujarat",
        photo: "https://randomuser.me/api/portraits/men/8.jpg",
        skillsOffered: ["Gujarati", "Business", "Cricket"],
        skillsWanted: ["Programming", "Music"],
        availability: "Evenings",
        isPublic: true,
        isBanned: false,
        isAdmin: false
    }
];

// Initialize with sample data
users = [...sampleUsers];

// Add admin user
const adminUser = {
    id: 9,
    name: 'Admin User',
    email: 'admin@skillswap.com',
    password: '$2a$10$6PmzZv2nXjcJTNOe9nhk0O/InIo2GNhG7fkPfRM0UUfCpycmCDerW', // admin123
    location: 'India',
    photo: 'https://randomuser.me/api/portraits/men/9.jpg',
    skillsOffered: ['Platform Management', 'Support'],
    skillsWanted: ['User Feedback'],
    availability: '24/7',
    isPublic: true,
    isBanned: false,
    isAdmin: true
};
users.push(adminUser);

// Add welcome message
adminMessages.push({
    id: 1,
    text: 'Welcome to Skill Swap! Connect with people, share your skills, and learn from others in our vibrant community.',
    isActive: true,
    createdAt: new Date()
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// File upload route
app.post('/api/upload-photo', authenticateToken, upload.single('photo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const photoUrl = `/uploads/${req.file.filename}`;
        res.json({ 
            message: 'Photo uploaded successfully', 
            photoUrl: photoUrl 
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
});

// User routes
app.post('/api/users/register', async (req, res) => {
    try {
        const { name, email, password, location, photo, skillsOffered, skillsWanted, availability } = req.body;

        // Check if user already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword,
            location: location || '',
            photo: photo || '',
            skillsOffered: skillsOffered || [],
            skillsWanted: skillsWanted || [],
            availability: availability || '',
            isPublic: true,
            isBanned: false,
            isAdmin: false
        };

        users.push(newUser);

        // Generate token
        const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '24h' });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            message: 'User registered successfully',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is banned
        if (user.isBanned) {
            return res.status(403).json({ message: 'Account is banned' });
        }

        // Generate token
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/users/me', authenticateToken, (req, res) => {
    try {
        const user = users.find(u => u.id === req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/api/users/profile', authenticateToken, (req, res) => {
    try {
        const { name, location, photo, skillsOffered, skillsWanted, availability, isPublic } = req.body;
        const userIndex = users.findIndex(u => u.id === req.user.userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user profile
        users[userIndex] = {
            ...users[userIndex],
            name: name || users[userIndex].name,
            location: location !== undefined ? location : users[userIndex].location,
            photo: photo !== undefined ? photo : users[userIndex].photo,
            skillsOffered: skillsOffered || users[userIndex].skillsOffered,
            skillsWanted: skillsWanted || users[userIndex].skillsWanted,
            availability: availability !== undefined ? availability : users[userIndex].availability,
            isPublic: isPublic !== undefined ? isPublic : users[userIndex].isPublic
        };

        const { password: _, ...userWithoutPassword } = users[userIndex];
        res.json({ 
            message: 'Profile updated successfully',
            user: userWithoutPassword 
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/users/public', (req, res) => {
    try {
        const { search } = req.query;
        let publicUsers = users.filter(u => u.isPublic && !u.isBanned);

        if (search) {
            const searchTerm = search.toLowerCase();
            publicUsers = publicUsers.filter(user => 
                user.skillsOffered.some(s => s.toLowerCase().includes(searchTerm)) ||
                user.skillsWanted.some(s => s.toLowerCase().includes(searchTerm)) ||
                user.name.toLowerCase().includes(searchTerm) ||
                user.location.toLowerCase().includes(searchTerm)
            );
        }

        const usersWithoutPassword = publicUsers.map(({ password: _, ...user }) => user);
        res.json(usersWithoutPassword);
    } catch (error) {
        console.error('Get public users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get user by ID (for swaps)
app.get('/api/users/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const user = users.find(u => u.id === parseInt(userId));
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Swap routes
app.post('/api/swaps', authenticateToken, (req, res) => {
    try {
        const { toUserId, skillOffered, skillWanted } = req.body;
        const fromUserId = req.user.userId;

        // Check if users exist
        const fromUser = users.find(u => u.id === fromUserId);
        const toUser = users.find(u => u.id === toUserId);

        if (!fromUser || !toUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create swap
        const newSwap = {
            id: swaps.length + 1,
            fromUserId,
            toUserId,
            skillOffered,
            skillWanted,
            status: 'pending',
            createdAt: new Date()
        };

        swaps.push(newSwap);
        res.status(201).json({ message: 'Swap request sent successfully', swap: newSwap });
    } catch (error) {
        console.error('Create swap error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/swaps/my-swaps', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        const userSwaps = swaps.filter(s => s.fromUserId === userId || s.toUserId === userId);

        const incoming = userSwaps.filter(s => s.toUserId === userId && s.status === 'pending');
        const outgoing = userSwaps.filter(s => s.fromUserId === userId && s.status === 'pending');
        const accepted = userSwaps.filter(s => s.status === 'accepted');

        res.json({ incoming, outgoing, accepted });
    } catch (error) {
        console.error('Get swaps error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Accept or reject a swap
app.put('/api/swaps/:swapId/:action', authenticateToken, (req, res) => {
    try {
        const { swapId, action } = req.params;
        const userId = req.user.userId;

        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        const swapIndex = swaps.findIndex(s => s.id === parseInt(swapId) && s.toUserId === userId);
        if (swapIndex === -1) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        swaps[swapIndex].status = action === 'accept' ? 'accepted' : 'rejected';
        res.json({ message: `Swap ${action}ed successfully` });
    } catch (error) {
        console.error('Update swap error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a swap
app.delete('/api/swaps/:swapId', authenticateToken, (req, res) => {
    try {
        const { swapId } = req.params;
        const userId = req.user.userId;

        const swapIndex = swaps.findIndex(s => s.id === parseInt(swapId) && s.fromUserId === userId);
        if (swapIndex === -1) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        swaps.splice(swapIndex, 1);
        res.json({ message: 'Swap deleted successfully' });
    } catch (error) {
        console.error('Delete swap error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add feedback to a swap
app.post('/api/swaps/:swapId/feedback', authenticateToken, (req, res) => {
    try {
        const { swapId } = req.params;
        const { rating, text } = req.body;
        const userId = req.user.userId;

        const swap = swaps.find(s => s.id === parseInt(swapId) && (s.fromUserId === userId || s.toUserId === userId));
        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        if (!swap.feedback) {
            swap.feedback = [];
        }

        // Remove existing feedback from this user
        swap.feedback = swap.feedback.filter(f => f.fromUserId !== userId);

        // Add new feedback
        swap.feedback.push({
            fromUserId: userId,
            rating: parseInt(rating),
            text,
            createdAt: new Date()
        });

        res.json({ message: 'Feedback added successfully' });
    } catch (error) {
        console.error('Add feedback error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin routes
app.get('/api/admin/messages/latest', (req, res) => {
    try {
        const latestMessage = adminMessages
            .filter(m => m.isActive)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

        res.json(latestMessage || null);
    } catch (error) {
        console.error('Get admin message error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/admin/messages', authenticateToken, (req, res) => {
    try {
        const user = users.find(u => u.id === req.user.userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { text } = req.body;
        const newMessage = {
            id: adminMessages.length + 1,
            text,
            isActive: true,
            createdAt: new Date()
        };

        adminMessages.push(newMessage);
        res.status(201).json({ message: 'Admin message created successfully', adminMessage: newMessage });
    } catch (error) {
        console.error('Create admin message error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Skill Swap Platform server running on http://localhost:${PORT}`);
    console.log(`📊 Sample users loaded: ${users.length}`);
    console.log(`👑 Admin user: admin@skillswap.com / admin123`);
    console.log(`👥 Sample users: Use any email from the list with password "password123"`);
    console.log(`📁 Upload directory: ${uploadsDir}`);
    console.log(`\nSample user emails:`);
    sampleUsers.forEach(user => {
        console.log(`- ${user.email}`);
    });
}); 