const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Module = require('../models/Module');
const { protect } = require('../middleware/authMiddleware');

// 1. Mark a module as completed
router.post('/mark-complete', protect, async (req, res) => {
  try {
    const { courseId, moduleId } = req.body;
    const userId = req.user.id;

    // Check whether it is already saved
    let progress = await Progress.findOne({ user: userId, module: moduleId });

    if (progress) {
      return res.status(400).json({ msg: 'This module has already been completed.' });
    }

    // Add new progress data
    progress = new Progress({
      user: userId,
      course: courseId,
      module: moduleId,
      isCompleted: true
    });

    await progress.save();
    res.status(201).json({ msg: 'Module successfully marked as completed!' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 2. Get course progress percentage
router.get('/:courseId', protect, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // 1. Find the total number of modules in this course
    const totalModules = await Module.countDocuments({ course: courseId });

    if (totalModules === 0) {
      return res.json({ 
        progressPercentage: 0, 
        completedModulesCount: 0, 
        totalModules: 0 
      });
    }

    // 2. Find the number of modules completed by the student
    const completedModulesCount = await Progress.countDocuments({
      user: userId,
      course: courseId,
      isCompleted: true
    });

    // 3. Calculate progress percentage: (completed modules / total modules) * 100
    const progressPercentage = Math.round((completedModulesCount / totalModules) * 100);

    // 4. Send a list of completed module IDs (useful for showing ticks in UI)
    const completedModules = await Progress.find({ 
      user: userId, 
      course: courseId 
    }).select('module');

    const completedModuleIds = completedModules.map(p => p.module);

    res.json({
      progressPercentage,
      completedModulesCount,
      totalModules,
      completedModuleIds
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;