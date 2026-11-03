// Restrict access to certain roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized for this action.`,
      });
    }
    next();
  };
};

// Shorthand helpers
export const isStaff = authorize('super_admin', 'admin', 'editor', 'journalist', 'photographer', 'video_editor', 'ad_manager');
export const isEditor = authorize('super_admin', 'admin', 'editor');
export const isAdmin = authorize('super_admin', 'admin');
export const isSuperAdmin = authorize('super_admin');
export const isAdManager = authorize('super_admin', 'admin', 'ad_manager');
export const isVideoEditor = authorize('super_admin', 'admin', 'video_editor', 'editor');
