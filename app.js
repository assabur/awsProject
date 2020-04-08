const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const { v3 } = require('recaptcha3');
//const data = await v3(req);
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const app = express();
mongoose.connect('mongodb+srv://acces:acces2019@dbdame-tlsv3.mongodb.net/test?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);
// recuperons la listes des users connectées
app.get('/dashboard',function(req,res)
{
    if(!req.session.userName && !res.session.visitCount)
        {
            var listes_user=[];
            req.session.userName="requettes pour ";
            req.session.visitCount=1;
            res.status(201).send(req.session);
        }
        else
        {
          req.session.visitCount+=1;  
          res.status(200).send(req.session);
        }
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));

const http = require('http');


app.get("/", (request, response,next) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
  next();
});

//captacha
const { stringify } = require('querystring');


app.use(express.json());

app.get('/', (_, res) => res.sendFile(__dirname + '/register.ejs'));

app.post('/users/register', async (req, res) => {
  if (!req.body.captcha)
    return res.json({ success: false, msg: 's\'il vous plait selectionné  le captcha' });

  // Secret key
  const secretKey ="6Lc1m-IUAAAAAKk4h6ro34SLNPnu8PHbr8rEgZse";

  // Verify URL
  const query = stringify({
    secret: secretKey,
    response: req.body.captcha,
    remoteip: req.connection.remoteAddress
  });
  const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;

  // Make a request to verifyURL
  const body = await fetch(verifyURL).then(res => res.json());

  // If not successful
  if (body.success !== undefined && !body.success)
    return res.json({ success: false, msg: 'Erreur de  verification captcha' });

  // If successful
  return res.json({ success: true, msg: 'Captcha passed' });
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

