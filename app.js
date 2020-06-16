const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const flash = require("connect-flash");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const http = require("http");
const { v3 } = require("recaptcha3");
const { initWebsocket } = require("./wssocket.js");
const path = require('path');
const exphbs=require('express-handlebars');
const expressValidator = require('express-validator');
const cookieParser=require('cookie-parser'); 
const bodyParser = require('body-parser');
 const dotenv = require ('dotenv'); 
dotenv.config (); 


// configuration de passport
require('./config/passport')(passport);


// importation des données de connexion
const db = require('./config/keys').mongoURI;


// Connection à mongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  
  )
  .then(() => console.log('MongoDB : connexion reussi'))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Express session
var configured_session = session({
  secret: "secret",
  resave: true,
  saveUninitialized: true
});
app.use(configured_session);

// Passport middleware
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());


// Enable flash messages
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.list_users = [];
  next();
});

// Routes
app.use("/", require("./routes/index.js"));

app.use("/users", require("./routes/users.js"));

//Servir les fichiers statique
app.use('/css',express.static(__dirname +'/css'));
app.use('/views',express.static(__dirname +'/views'));
app.use(express.static("public"));
//
initWebsocket(app, configured_session);

//
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
