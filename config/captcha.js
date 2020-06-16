var request = require('request');

module.exports = {
vericaptcha :function(req,res,next){
  
  if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
    //return res.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
    req.flash('error_msg ', 'Selectionnez la verification robot');
  }
  var secretKey = "6LcSNfEUAAAAAKN-GHwWajyQe_LXcqXthDxg5KP2";
  let errors = [];
  
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
  
  request(verificationUrl,function(error,response,body) {
    body = JSON.parse(body);
    
    if(body.success !== undefined && !body.success) {
      errors.push({ msg: 'Selectionnez la verification robot pour continuer' });
   
      //req.flash('error_msg', 'Please select captcha');
      res.redirect('/users/register');
     
    }else{
    
      next();
    }
  });
}

}