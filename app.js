var express = require('express');
var passport = require('passport');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var passportLocal = require('passport-local');
var passportHttp = require('passport-http');

var app = express();

// -------------------------------------------------
app.set('view engine', 'ejs');

// -------------------------------------------------
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(expressSession({
		secret: process.env.SESSION_SECRET || 'secret',
		resave: false,
		saveUninitialized: false
	}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal.Strategy(verifyCredentials));

passport.use(new passportHttp.BasicStrategy(verifyCredentials));

function verifyCredentials(username, password, done){
	// Implement logic here...
	if(username === password){
		// No time! :|
		done(null, { id:username, name: username});
	} else {
		done(null, null);
	}
}

passport.serializeUser(function(user, done){
	done(null, user.id);
});

passport.deserializeUser(function(id, done){
	// Query database/cache here
	done(null, {id: id, name: id});
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		next();
	} else {
		res.send(403);
	}
}

// -------------------------------------------------
app.get('/', function(req, res){
	res.render('index', {
		isAuthenticated: req.isAuthenticated(),
		user: req.user
	});
});

app.get('/login', function(req, res){
	res.render('login');
});

// Use local strategy
app.post('/login', passport.authenticate('local'), function(req, res){
	res.redirect('/');
});

app.get('/logout', function(req,res){
	req.logout();
	res.redirect('/');
});


app.use('/api', passport.authenticate('basic'));

app.get('/api/data', ensureAuthenticated, function(req, res){
	res.json([
		{value: 'mohit'},
		{value: 'mehrotra'},
		{value: 'test'},
		]);
});

// -------------------------------------------------

var port = process.env.PORT || 1337;

app.listen(port, function(){
	console.log('http://localhost:'+port+'/');
});