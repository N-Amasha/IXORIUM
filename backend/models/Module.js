const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }, // අදාළ පාඨමාලාව
  title: { type: String, required: true },
  textContent: { type: String, required: true }, // පිටුව තුළදීම කියවීමට ඇති සටහන්
  audioUrl: { type: String, required: true } // Voice Explanation එක තියෙන Audio File Link එක
}, { timestamps: true });

module.exports = mongoose.model('Module', ModuleSchema);