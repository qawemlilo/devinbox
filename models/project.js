var mongoose = require('mongoose');

var ProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },

  title: {type: String, required: true },

  short_desc: {type: String, required: true },

  desc: {type: String, required: true },

  category: {type: String, required: true },

  tags: Array,

  url: {type: String, required: true },

  code_url: String,

  created_at: { type: Date, default: new Date() }
});


module.exports = mongoose.model('Project', ProjectSchema);
