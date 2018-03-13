/*************************************************************
** File Name: scheduleServer.js
** Author: Group 30
** Course: CS361
** Description: This is the javascript file that ????????????
*************************************************************/
var express = require('express');
var session = require("express-session");
var fs = require("fs"); //write file
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var request = require('request');

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.set('port', 61431);
app.use(express.static('public'));
var credentials = require('./credentials.js');
var dataDef = require('./dataDefinition.js');
var testData = require('./testDataCreation.js')

// Starting program
var scheduleData = [];

scheduleData = testData.CreateTestData();
//testData.PrintTestData(scheduleData);
/* Homepage handling*/

//for login

app.use(session({
  secret: "thisisapassword1",
  resave: false,
  saveUninitialized: false
          }));;
session.loggedIn = 0;

const path = require('path');


app.get('/',function(req,res){
  var context = {};
  res.render('loginHome', context);
 });


//Post login info, if matches test login, redirect to /newQuote
app.post('/',function(req,res){
  var params = [];
  var context = {};

  for (var p in req.body){
    params.push({'name':p,'value':req.body[p]})
  }
  context.dataList = params;

  if(params[0].name=="username" && params[0].value=="employeeTest"){
    if(params[1].name=="password" && params[1].value=="testpassword"){
      session.loggedIn = 1;
      res.redirect("/listview");
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

//Add scheduled task
app.get('/listview', function(req, res, next) {
  	var context = {};
    //context.maprequest = "https://maps.googleapis.com/maps/api/js?&key=" + credentials.mapKey + "&callback=initMap";

    context.results = scheduleData.profiles[0].Schedule.tasks;
    context.layout = 'listLayout';
    res.render('listview', context);
});

app.put('/listview', function(req, res){
  var context = {};

  newTask = new dataDef.Task(req.body.name, req.body.date, req.body.time,
      req.body.address, req.body.city, req.body.state, req.body.recurring);   
  scheduleData.profiles[0].Schedule.tasks.push(newTask);
  res.send(null);
});

function CoordinateFormatAddress(task) {
	addressUnf = task.Location;
	addressForm = task.Location.address.split(" ").join("+");
	addressForm += ",+" + task.Location.city.split(" ").join("+");
	addressForm += ",+" + task.Location.state.split(" ").join("+");
	return addressForm;
}


function BubbleSortDates(arr) {
  var i;
  var j;
  var date1 = [];
  var date2 = [];
  var time1 = [];
  var time2 = [];
  var task;

  for (i = arr.length - 1; i >= 0; i--) {
    for (j = 1; j <= i; j++) {
      if (arr[j - 1].date == null || arr[j - 1].time == null) {
        task = arr[i];
        arr[i] = arr[j - 1];
        arr[j - 1] = task;
        break;
      }

      if (arr[j].date == null || arr[j].time == null) {
        task = arr[i];
        arr[i] = arr[j];
        arr[j] = task;
        break;
      }

      date1 = arr[j - 1].date.split("-");
      date2 = arr[j].date.split("-");
      time1 = arr[j - 1].time.split(":");
      time2 = arr[j].time.split(":");

      if (Number(date1[0]) > Number(date2[0])) {
        task = arr[j];
        arr[j] = arr[j - 1];
        arr[j - 1] = task;
      } else if (Number(date1[0]) == Number(date2[0]) && Number(date1[1]) > Number(date2[1])) {
        task = arr[j];
        arr[j] = arr[j - 1];
        arr[j - 1] = task;
      } else if (Number(date1[1]) == Number(date2[1]) && Number(date1[2]) > Number(date2[2])) {
        task = arr[j];
        arr[j] = arr[j - 1];
        arr[j - 1] = task;
      } else if (Number(date1[2]) == Number(date2[2]) && Number(time1[0]) > Number(time2[0])) {
        task = arr[j];
        arr[j] = arr[j - 1];
        arr[j - 1] = task;
      } else if (Number(time1[0]) == Number(time2[0]) && Number(time1[1]) > Number(time2[1])) {
        task = arr[j];
        arr[j] = arr[j - 1];
        arr[j - 1] = task;
      }
    }
  }

  return arr;
}

function GetCoords(res, context, complete) {
	var addresses = [];
	var lats = [];
	var lngs = [];

	scheduleData.profiles[0].Schedule.tasks = BubbleSortDates(scheduleData.profiles[0].Schedule.tasks);

	scheduleData.profiles[0].Schedule.tasks.forEach( function(e) {
 		addresses.push(CoordinateFormatAddress(e));
	});

	addresses.forEach( function(e, i) {
	  	request('https://maps.googleapis.com/maps/api/geocode/json?address=' +
	    	e + '&key=' + credentials.mapKey, function(err, response, body) {
	    	if (!err && response.statusCode < 400) {
	      		var bodyParsed = JSON.parse(body);
	      		lats[i] = bodyParsed.results[0].geometry.location.lat;
	      		lngs[i] = bodyParsed.results[0].geometry.location.lng;
	      		requestComplete();
	    	} else {
	      		console.log(err);
	      		if (response) {
	      			console.log(response.statusCode);
	      		}
	    	}
	  	});
	});

  	requestCount = 0;
  	function requestComplete() {
  		requestCount++;
  		if (requestCount == addresses.length) {
  			context.lats = lats;
  			context.lngs = lngs;
  			complete();
  		}
  	};
}

app.get('/mapview', function(req, res, next) {
  	var context = {};

	GetCoords(res, context, complete);
    context.maprequest = "https://maps.googleapis.com/maps/api/js?&key=" + credentials.mapKey + "&callback=initMap";

    function complete() {
      	context.layout = 'mapLayout';
    	context.tasks = scheduleData.profiles[0].Schedule.tasks;
      	res.render('mapview', context);
    }

});

app.get('/update/:id', function(req, res){
	callbackCount = 0;
	var context = {};
	context.jsscripts = ["updatetask.js"];
	id = req.params.id;
	context = scheduleData.profiles[0].Schedule.tasks[id];
	context.id = id;
	context.layout = 'updateTaskLayout';
	res.render('update-task', context);
});

app.put('/tasks/:id', function(req, res){
	var context = {};
	scheduleData.profiles[0].Schedule.tasks[id].name = req.body.name;
	scheduleData.profiles[0].Schedule.tasks[id].date = req.body.date;
	scheduleData.profiles[0].Schedule.tasks[id].time = req.body.time;
	scheduleData.profiles[0].Schedule.tasks[id].Location.address = req.body.address;
	scheduleData.profiles[0].Schedule.tasks[id].Location.city = req.body.city;
	scheduleData.profiles[0].Schedule.tasks[id].Location.state = req.body.state;

  context.results = scheduleData.profiles[0].Schedule.tasks;
  res.send(null);
});

app.get('/updateprofile', function(req, res){
        callbackCount = 0;
        var context = {};
        context = scheduleData.profiles[0];
        context.layout = 'updateProfileLayout';
        res.render('update-profile', context);
});

app.get('/signup', function(req, res){
        callbackCount = 0;
        var context = {};
        context = {};
        context.layout = 'createProfileLayout';
        res.render('create-profile', context);
});

app.put('/profiles', function(req, res){
        var context = {};
        scheduleData.profiles[0].name = req.body.name;
        scheduleData.profiles[0].phoneNum = req.body.phone;
        scheduleData.profiles[0].homeLocation.address = req.body.addressH;
        scheduleData.profiles[0].homeLocation.city = req.body.cityH;
        scheduleData.profiles[0].homeLocation.state = req.body.stateH;
        scheduleData.profiles[0].workLocation.address = req.body.addressW;
        scheduleData.profiles[0].workLocation.city = req.body.cityW;
        scheduleData.profiles[0].workLocation.state = req.body.stateW;
        scheduleData.profiles[0].email = req.body.email;
  context.results = scheduleData.profiles[0];
  res.send(null);
});


app.put('/delete/:id', function(req, res){
	id = req.params.id;
	callbackCount = 0;
	var context = {};
	scheduleData.profiles[0].Schedule.tasks.splice(id, 1);
	context.results = scheduleData.profiles[0].Schedule.tasks[id];
	context.id = req.params.id;
	res.send(null);
});


app.get('/calendarview', function(req, res){
        callbackCount = 0;
        var context = {};
        context = scheduleData.profiles[0]
        res.render('calendarview', context);
});

app.post('/calendarview', function(req, res){
        callbackCount = 0;
        var context = {};
    	context.tasks = scheduleData.profiles[0].Schedule.tasks;
	context.month = req.body.month;
	res.send(context);
});


app.use(function(req,res) {
  	res.status(404);
  	res.render('404');
});

app.use(function(err, req, res, next) {
  	console.error(err.stack);
  	res.type('plain/text');
  	res.status(500);
  	res.render('500');
});

app.listen(app.get('port'), function() {
  	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
