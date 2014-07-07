var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true, required: true },

  name: { type: String, default: '', required: true},

  preferences: Array,

  postToken: String,

  twitter: String,

  github: String,

  website: String,
  
  postTokenExpires: Date,

  created_at: { type: Date, default: new Date() }
});


module.exports = mongoose.model('User', userSchema);
