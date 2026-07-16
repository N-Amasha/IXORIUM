const mongoose = require('mongoose');
const ModuleSchema = new mongoose.Schema({

  course:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Course',
    required:true
  },

  title:{
    type:String,
    required:true
  },

  textContent:{
    type:String,
    required:true
  },

  audioUrl: {
    type: String,
    required: false,
    default: ""
  },

  // Stores difficult words and meanings
  jargon:{
    type:Map,
    of:String,
    default:{}
  }

},{timestamps:true});


module.exports = mongoose.model('Module', ModuleSchema);