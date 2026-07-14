const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({

  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // The student's ID

  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  }, // The related course ID

  module: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Module', 
    required: true 
  }, // The ID of the completed module

  isCompleted: { 
    type: Boolean, 
    default: true 
  } // Always true because the module has been completed

}, { timestamps: true });


// A student can store progress data for the same module only once
ProgressSchema.index({ user: 1, module: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);