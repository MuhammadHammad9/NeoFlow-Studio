import 'dotenv/config'; // Load env vars
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import passport from './config/passport';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-it';

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Middleware to authenticate
const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '7d' });

        // Return user info without password
        const { password: _, ...userInfo } = user;
        res.json({ token, user: userInfo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '7d' });

        const { password: _, ...userInfo } = user;
        res.json({ token, user: userInfo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// --- SOCIAL AUTH ROUTES ---

const handleSocialCallback = (req: any, res: any) => {
    // User is authenticated via Passport at this point
    const user = req.user;
    if (!user) return res.redirect('/?error=auth_failed');

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '7d' });

    // Redirect to frontend with token
    res.redirect(`/?token=${token}`);
};

// Google
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/api/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/?error=auth_failed' }),
    handleSocialCallback
);

// Instagram
app.get('/api/auth/instagram', passport.authenticate('instagram'));
app.get('/api/auth/instagram/callback',
    passport.authenticate('instagram', { session: false, failureRedirect: '/?error=auth_failed' }),
    handleSocialCallback
);

// Twitter
app.get('/api/auth/twitter', passport.authenticate('twitter'));
app.get('/api/auth/twitter/callback',
    passport.authenticate('twitter', { session: false, failureRedirect: '/?error=auth_failed' }),
    handleSocialCallback
);

// Me (Restore session)
app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.sendStatus(404);

        const { password: _, ...userInfo } = user;
        res.json({ user: userInfo });
    } catch (error) {
        res.sendStatus(500);
    }
});

// --- HISTORY ROUTES ---

app.get('/api/history', authenticateToken, async (req: any, res) => {
    try {
        const history = await prisma.history.findMany({
            where: { userId: req.user.id },
            orderBy: { timestamp: 'desc' }
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: "Error fetching history" });
    }
});

app.post('/api/history', authenticateToken, async (req: any, res) => {
    const { type, title, preview, content } = req.body;
    try {
        const item = await prisma.history.create({
            data: {
                userId: req.user.id,
                type,
                title,
                preview,
                content: content || ''
            }
        });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: "Error saving history" });
    }
});

app.delete('/api/history', authenticateToken, async (req: any, res) => {
    try {
        await prisma.history.deleteMany({
            where: { userId: req.user.id }
        });
        res.json({ message: "History cleared" });
    } catch (error) {
        res.status(500).json({ message: "Error clearing history" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
