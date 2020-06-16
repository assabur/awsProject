/* Dans cette partie on cree un nouvel objet qui represent notre user avec les champs name,email,password,date */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  partiesWin: {
    type: Number,
    default: 0
  },
  partiesLost: {
    type: Number,
    default: 0
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
