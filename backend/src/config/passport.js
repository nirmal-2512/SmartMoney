import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../database/models/index.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        done(null, {
          googleId: profile.id,
          email: profile.emails[0].value,
          fullName: profile.displayName,
          avatarUrl: profile.photos[0]?.value || null,
        });
      } catch (err) {
        done(err, null);
      }
    }
  )
);

export default passport;