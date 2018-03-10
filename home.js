/*
Get/Post request handling
requires
*/
var express = require('express');
var fs = require("fs"); //write file
var session = require("express-session");
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
//Post info
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({secret: "thisisapassword1"}));
session.loggedIn = 0;

const path = require('path');


//set directory parents
// https://stackoverflow.com/questions/41582026/css-files-not-found-using-express-handlebars
app.use('/css/', express.static(path.join(__dirname, '/css')));
app.use('/js/', express.static(path.join(__dirname, '/js')));
app.use('/files/', express.static(path.join(__dirname, '/files')));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 61431);


/* Homepage handling*/
app.get('/',function(req,res){
  console.log("in home.js get");
  var context = {};
  res.render('login', context);
 });


//Post login info, if matches test login, redirect to /newQuote
app.post('/',function(req,res){
  var params = [];
  var context = {};

  for (var p in req.body){
    params.push({'name':p,'value':req.body[p]});
  }
  context.dataList = params;

  if(params[0].name=="username" && params[0].value=="employeeTest"){
    if(params[1].name=="password" && params[1].value=="testpassword"){
      session.loggedIn = 1;
      res.redirect("/newQuote");
    }
  } else {
    res.render('loginError', context); //render error page if unsuccessful login
  }
});


app.get("/logOut", function(req, res){
  if (session.loggedIn) {
    session.loggedIn = 0;
  }
  res.redirect("/");
});
/*
Common app.use for errors
listen for port
*/
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
