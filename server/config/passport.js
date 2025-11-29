const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      if (user.oauthProvider !== 'google') {
        return done(null, false, { message: 'Email already registered with different method' });
      }
      return done(null, user);
    }

    // Create new user
    user = new User({
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0]?.value || '',
      oauthProvider: 'google',
      oauthId: profile.id,
      isVerified: true,
      nativeLanguage: 'en', // Default, user should update
      learningLanguages: []
    });

    await user.save();
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'email', 'picture.type(large)']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      if (user.oauthProvider !== 'facebook') {
        return done(null, false, { message: 'Email already registered with different method' });
      }
      return done(null, user);
    }

    // Create new user
    user = new User({
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0]?.value || '',
      oauthProvider: 'facebook',
      oauthId: profile.id,
      isVerified: true,
      nativeLanguage: 'en', // Default, user should update
      learningLanguages: []
    });

    await user.save();
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

