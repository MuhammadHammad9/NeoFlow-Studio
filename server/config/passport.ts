import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as InstagramStrategy } from 'passport-instagram';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configure Google
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Find or create user
            let user = await prisma.user.findUnique({
                where: { googleId: profile.id }
            });

            if (!user) {
                // Try to find by email if available to merge accounts
                if (profile.emails && profile.emails[0]) {
                    user = await prisma.user.findUnique({
                        where: { email: profile.emails[0].value }
                    });

                    if (user) {
                        // Link account
                        user = await prisma.user.update({
                            where: { id: user.id },
                            data: { googleId: profile.id }
                        });
                    }
                }

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            googleId: profile.id,
                            name: profile.displayName,
                            email: profile.emails?.[0]?.value,
                            avatar: profile.photos?.[0]?.value
                        }
                    });
                }
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));
}

// Configure Instagram
if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
    passport.use(new InstagramStrategy({
        clientID: process.env.INSTAGRAM_CLIENT_ID,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
        callbackURL: "/api/auth/instagram/callback"
    }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
            let user = await prisma.user.findUnique({
                where: { instagramId: profile.id }
            });

            if (!user) {
                user = await prisma.user.create({
                    data: {
                        instagramId: profile.id,
                        name: profile.displayName || profile.username,
                        // Instagram basic display doesn't reliably give email
                    }
                });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));
}

// Configure Twitter (X)
if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
    passport.use(new TwitterStrategy({
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: "/api/auth/twitter/callback",
        includeEmail: true
    }, async (token, tokenSecret, profile, done) => {
        try {
            let user = await prisma.user.findUnique({
                where: { twitterId: profile.id }
            });

            if (!user) {
                if (profile.emails && profile.emails[0]) {
                    user = await prisma.user.findUnique({
                        where: { email: profile.emails[0].value }
                    });

                    if (user) {
                        user = await prisma.user.update({
                            where: { id: user.id },
                            data: { twitterId: profile.id }
                        });
                    }
                }

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            twitterId: profile.id,
                            name: profile.displayName,
                            email: profile.emails?.[0]?.value,
                            avatar: profile.photos?.[0]?.value
                        }
                    });
                }
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));
}

export default passport;
