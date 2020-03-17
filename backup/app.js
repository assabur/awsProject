const express= require('express');
const passport = require('passport');
const path=require('path');
const bodyParser = require('body-parser');
const cookieParser=require('cookie-parser');
const exphbs=require('express-handlebars');
const expressValidator = require('express-validator');
const flash =require('connect-flash');
const mongoose=require('mongoose');
const mongo=require('mongodb');
const LocalStrategy=require('passport-local').Strategy;
const session =require('express-session');
var db=mongoose.connection;

mongoose.connect('mongodb+srv://acces:acces2019@dbdame-tlsv3.mongodb.net/test?retryWrites=true&w=majority',
		 { useNewUrlParser: true,
		    useUnifiedTopology: true })
		  .then(() => console.log('Connexion à MongoDB réussie !'))
          .catch(() => console.log('Connexion à MongoDB échouée !'));
          const routes=require('./routes/index');
          const users=require ('./routes/users');
          const app=express();

          app.set('views',path.join(__dirname,'views'));
          app.engine('handlebars',exphbs({defaultLayout:'layout'}));
          app.set('view engine','handlebars');
          app.use(bodyParser.json());
          app.use(bodyParser.urlencoded({ extended: false }));
          app.use(cookieParser());
          app.use(express.static(path.join(__dirname,'public')));

          app.use(session(
              {
                secret:'pagelogin',
                saveUninitialized:true,
                resave:true  
              }));
    app.use(passport.initialize());
    app.use(passport.session());

    /*app.use(expressValidator({
        errorFormatter: function(param, msg, value) {
            var namespace = param.split('.')
            , root    = namespace.shift()
            , formParam = root;
      
          while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
          }
          return {
            param : formParam,
            msg   : msg,
            value : value
          };
        }
      }));
    app.use(expressValidator({
          errorFormatter:function(param,msg,value){
              var namespace=param.split('.')
              , root =namespace.shift()
              ,formParam=root;

              while(namespace.length){
                  formParam+='['+namespace.shift()+']';
              }
              return{
                  param:formParam,
                  msg:msg,
                  value
              };
          }
            
        }
    ));*/
    app.use(flash());
    app.use(function(req,res,next){
        res.locals.succes_msg=req.flash('succes message');
        res.locals.error_msgg=req.flash('error_msg');
        res.locals.error=req.flash('error');
        res.locals.user=req.user|| null;
        next();
    });
    app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'),function(){
	console.log('Server started on port '+app.get('port'));
});
    
   
