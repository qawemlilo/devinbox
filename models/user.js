var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },

  name: { type: String, default: '' },

  preferences: Array,

  postToken: String,
  
  postTokenExpires: Date,

  created_at: { type: Date, default: new Date() },
});


module.exports = mongoose.model('User', userSchema);
