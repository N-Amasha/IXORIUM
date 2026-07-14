const jwt = require('jsonwebtoken');

// 1. Check whether the user is logged in
const protect = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ msg: 'Access denied, no token found.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adds the user information stored in the token to the request
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token.' });
  }
};

// 2. Check whether the user is a teacher only (Teacher Only)
const teacherOnly = (req, res, next) => {
  if (req.user && req.user.role === 'teacher') {
    next();
  } else {
    return res.status(403).json({ msg: 'Only teachers are allowed to perform this action.' });
  }
};

module.exports = { protect, teacherOnly };