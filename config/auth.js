/*
dans cette partie on permet aux constantes ensureAuthenticated et forwardAuthenticated d'etre visible dans les autres 
packages en gros ces deux constantes assurent que l'utilisateur s'est authentifié avant d'acceder aux ressources 

*/
module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Svp conectez vous pour acceder aux ressources');
    res.redirect('/users/login');
  },
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashboard');      
  }
};
