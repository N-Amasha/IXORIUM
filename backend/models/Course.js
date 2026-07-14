const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // The teacher who created this course
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);