// declarations des constantes requises
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// chargons le modele USer
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // a cette etape on verifie la correspondance des emails
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
         // req.flash('error_msg ', 'Email n'/'est pas enregistré');
          return done(null, false, { message : 'cet email n '/'est pas enregistré' });
        }

        // on verifie la coresspondance des mots de passe hachés remarque: l'orsque les mots de passes ne sont pas identiques
        //pour une notion de securité on precise juste à l'user que les identifiants saisis sont incorrectes
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message : 'Les identifiants saisis sont incorrectes ' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
