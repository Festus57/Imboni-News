import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc   Get all staff users
// @route  GET /api/users/staff
// @access Admin+
export const getStaffUsers = async (req, res, next) => {
  try {
    const staff = await User.find({ isStaff: true }).select('-password').sort({ createdAt: -1 });
    sendSuccess(res, { staff });
  } catch (err) {
    next(err);
  }
};

// @desc   Get all readers
// @route  GET /api/users/readers
// @access Admin+
export const getReaders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [readers, total] = await Promise.all([
      User.find({ role: 'reader' }).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments({ role: 'reader' }),
    ]);
    sendSuccess(res, { readers, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

// @desc   Create staff user
// @route  POST /api/users/staff
// @access Admin+
export const createStaffUser = async (req, res, next) => {
  try {
    const { name, email, password, role, staffBio } = req.body;
    const staffRoles = ['admin', 'editor', 'journalist', 'photographer', 'video_editor', 'ad_manager'];
    if (!staffRoles.includes(role)) return sendError(res, 'Invalid staff role.', 400);

    const existing = await User.findOne({ email });
    if (existing) return sendError(res, 'Email already registered.', 400);

    const user = await User.create({ name, email, password, role, staffBio, isStaff: true });
    sendSuccess(res, { user }, 'Staff user created.', 201);
  } catch (err) {
    next(err);
  }
};

// @desc   Toggle user active status
// @route  PATCH /api/users/:id/toggle-status
// @access Admin+
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found.', 404);
    if (user.role === 'super_admin') return sendError(res, 'Cannot deactivate super admin.', 403);
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    sendSuccess(res, { isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'deactivated'}.`);
  } catch (err) {
    next(err);
  }
};

// @desc   Delete user
// @route  DELETE /api/users/:id
// @access Admin+
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found.', 404);
    if (user.role === 'super_admin') return sendError(res, 'Cannot delete super admin.', 403);
    await User.findByIdAndDelete(req.params.id);
    sendSuccess(res, {}, 'User deleted.');
  } catch (err) {
    next(err);
  }
};
// @route  POST /api/users/:id/follow
// @access Reader
export const toggleFollowJournalist = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const journalistId = req.params.id;
    const isFollowing = currentUser.followedJournalists.includes(journalistId);
    if (isFollowing) {
      currentUser.followedJournalists = currentUser.followedJournalists.filter((id) => id.toString() !== journalistId);
    } else {
      currentUser.followedJournalists.push(journalistId);
    }
    await currentUser.save({ validateBeforeSave: false });
    sendSuccess(res, { following: !isFollowing }, isFollowing ? 'Unfollowed.' : 'Now following.');
  } catch (err) {
    next(err);
  }
};
