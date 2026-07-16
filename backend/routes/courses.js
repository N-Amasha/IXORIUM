const express = require('express');
const router = express.Router();

const Course = require('../models/Course');
const Module = require('../models/Module');

const { protect, teacherOnly } = require('../middleware/authMiddleware');

// === 1. COURSE ROUTES ===

// Allow everyone to view courses (Students & Teachers)
router.get('/', protect, async (req, res) => {
  try {
    const courses = await Course.find().populate('teacher', 'name email');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Allow only teachers to create a new course
router.post('/', protect, teacherOnly, async (req, res) => {
  try {
    const { title, description } = req.body;

    const newCourse = new Course({
      title,
      description,
      teacher: req.user.id // The ID of the currently logged-in teacher
    });

    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// === 2. MODULE ROUTES (Notes & Voice) ===

// Allow students to view all modules related to a specific course (Course ID)
router.get('/:courseId/modules', protect, async (req, res) => {
  try {
    const modules = await Module.find({ course: req.params.courseId });
    res.json(modules);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Allow only teachers to add a new module (Note + Voice + Jargon)
router.post('/:courseId/modules', protect, teacherOnly, async (req, res) => {

  try {

    const { 
      title, 
      textContent, 
      audioUrl, 
      jargon 
    } = req.body;


    const newModule = new Module({

      course: req.params.courseId,
      title,
      textContent,
      audioUrl,
      jargon: jargon || {}

    });


    const savedModule = await newModule.save();

    res.status(201).json(savedModule);


  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

router.put('/modules/:moduleId', protect, teacherOnly, async (req, res) => {
  try {
    const { title, textContent, audioUrl, jargon } = req.body;

    const updatedModule = await Module.findByIdAndUpdate(
      req.params.moduleId,
      {
        title,
        textContent,
        audioUrl,
        jargon: jargon || {}
      },
      { new: true }
    );

    if (!updatedModule) {
      return res.status(404).json({ msg: 'Module not found' });
    }

    res.json(updatedModule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Update Course (Teacher only)
router.put('/:courseId', protect, teacherOnly, async (req, res) => {
  try {

    const { title, description } = req.body;

    const updatedCourse = await Course.findOneAndUpdate(
      {
        _id: req.params.courseId,
        teacher: req.user.id
      },
      {
        title,
        description
      },
      {
        new: true
      }
    ).populate('teacher', 'name email');


    if (!updatedCourse) {
      return res.status(404).json({
        msg: "Course not found or you don't have permission"
      });
    }


    res.json(updatedCourse);


  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
});

module.exports = router;