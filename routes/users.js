const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
var request = require('request');
const app = express();
var stringify = require('stringify');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');
const { vericaptcha } = require('../config/captcha');



// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));


// Register
router.post('/register',vericaptcha, (req, res,next) => {
  //secret cote backend
  //const secretKey = '6LdcSvAUAAAAADMpgMMdA6Pq-bvKAyKDM7e0_9ey';
  
  let errors = [];//je declare un tableau qui va contenir toutes les erreurs
  var { name, email, password, password2,captcha } = req.body;
  
  var reg = new RegExp("^[a-zA-Z]{2,17}[0-9]{0,3}$");
  if(!reg.test(name))
    {
      errors.push({ msg: 'Renseigner un pseudo valide ex:toto123' });
    }
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Renseigner  les champs requis' });
  }

  if (password != password2) {
    errors.push({ msg: 'Les mots de passes ne correspondent pas' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Mot de passe faible mot de passe doit etre superieur à 6 caracteres' });
    req.flash('error_msg ', 'Mot de passe faible mot de passe doit etre superieur à 6 caracteres');
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email existe deja' });
        req.flash('error_msg ', 'Email existe deja');
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'Vous etes maintenant bien enregistré'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Vous etes bien déconnectés');
  res.redirect('/users/login');
});

module.exports = router;
