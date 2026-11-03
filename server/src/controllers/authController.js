import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// @desc   Register new reader account
// @route  POST /api/auth/register
// @access Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required.', 400);
    }

    const existing = await User.findOne({ email });
    if (existing) return sendError(res, 'Email already registered.', 400);

    const user = await User.create({ name, email, password, role: 'reader' });
    const token = signToken(user._id);

    sendSuccess(res, { token, user: sanitizeUser(user) }, 'Account created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

// @desc   Login
// @route  POST /api/auth/login
// @access Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return sendError(res, 'Email and password are required.', 400);

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (!user.isActive) return sendError(res, 'Account deactivated. Contact support.', 403);

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    sendSuccess(res, { token, user: sanitizeUser(user) }, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

// @desc   Get current logged-in user
// @route  GET /api/auth/me
// @access Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followedTopics', 'name nameKiny slug')
      .populate('savedArticles', 'title slug featuredImage publishedAt');
    sendSuccess(res, { user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

// @desc   Update profile
// @route  PUT /api/auth/profile
// @access Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, preferredLanguage, preferredDistrict, newsletterSubscribed } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, preferredLanguage, preferredDistrict, newsletterSubscribed },
      { new: true, runValidators: true }
    );
    sendSuccess(res, { user: sanitizeUser(user) }, 'Profile updated.');
  } catch (err) {
    next(err);
  }
};

// @desc   Change password
// @route  PUT /api/auth/change-password
// @access Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return sendError(res, 'Current password is incorrect.', 400);
    }
    user.password = newPassword;
    await user.save();
    sendSuccess(res, {}, 'Password changed successfully.');
  } catch (err) {
    next(err);
  }
};

const sanitizeUser = (user) => {
  const u = user.toObject ? user.toObject() : user;
  delete u.password;
  delete u.emailVerifyToken;
  delete u.passwordResetToken;
  delete u.passwordResetExpires;
  return u;
};
