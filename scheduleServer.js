/*************************************************************
** File Name: scheduleServer.js
** Author: Group 30
** Course: CS361
** Description: This is the javascript file that runs the server
**   side of the scheduling application. It serves pages to the
**   client.
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
var testData = require('./testDataCreation.js');
var mapHelpers = require('./mapHelpers.js');

app.use(session({
  secret: "thisisapassword1",
  resave: false,
  saveUninitialized: false
          }));;
session.loggedIn = -1;

const path = require('path');

// Starting program
var scheduleData = [];

scheduleData = testData.CreateTestData();
var accountsCount = 1; //test creates one profile accessed at 0
//testData.PrintTestData(scheduleData);



function IsInsideBlackout(date, startDate, endDate) {
  var date = date.split("-");
  if (startDate == null || endDate == null) {
    return 0;
  }
    var start = startDate.split("-");
    var end = endDate.split("-");

    if (Number(date[0]) > Number(start[0]) && Number(date[0]) < Number(end[0])) {
      return 1;
    } else if (Number(date[0]) == Number(start[0]) || Number(date[0]) == Number(end[0])) {
      if (Number(date[1]) > Number(start[1]) && Number(date[1]) < Number(end[1])) {
        return 1;
      } else if (Number(date[1]) == Number(start[1]) && Number(date[1]) < Number(end[1])) {
        if (Number(date[2]) > Number(start[2])) {
          return 1;
        }
      } else if (Number(date[1]) > Number(start[1]) && Number(date[1]) == Number(end[1])) {
        if (Number(date[2]) < Number(end[2])) {
          return 1;
        }
      } else if (Number(date[1]) == Number(start[1]) && Number(date[1]) == Number(end[1])) {
        if (Number(date[2]) > Number(start[2]) && Number(date[2]) < Number(end[2])) {
          return 1;
        }
      }
    }

    return 0;
}

function GetCoords(res, context, complete, arr) {
  var addresses = [];
  var lats = [];
  var lngs = [];

  arr = mapHelpers.BubbleSortDates(arr);

  arr.forEach( function(e) {
    addresses.push(mapHelpers.CoordinateFormatAddress(e));
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

/* Homepage handling*/
//for login
app.get('/',function(req,res){
  session.loggedIn = -1; //log out anyone who was previously logged in
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
  for (var i = 0; i < accountsCount; i++) {
    if (params[0].value===scheduleData.profiles[i].email && params[1].value===scheduleData.profiles[i].pword) {
      session.loggedIn = i;
      console.log("got here");
      res.redirect("/listview");
      return;
    }
    else {
      console.log('trying next');
    }
  }
  // did not find a match
  res.render('loginError', context); //render error page if unsuccessful login
});

app.get("/logOut", function(req, res){
  if (session.loggedIn) {
    session.loggedIn = -1;
  }
  res.redirect("/");
});

//Add scheduled task
app.get('/listview', function(req, res, next) {
  	var context = {};

    context.results = scheduleData.profiles[session.loggedIn].Schedule.tasks;
    context.layout = 'listLayout';
    if (req.session.listWarning) {
    	context.warning = req.session.listWarning;
    	req.session.listWarning = null;
    } else {
    	context.warning = null;
    }
    res.render('listview', context);
});

app.put('/listview', function(req, res){
  var context = {};
  var isBlackout = IsInsideBlackout(req.body.date,
   scheduleData.profiles[session.loggedIn].Schedule.blackoutStart, scheduleData.profiles[session.loggedIn].Schedule.blackoutEnd);

	var date = [];

  if (isBlackout) {
  	req.session.listWarning = "Task date entered was in the blackout period. Task date has been moved."
  	var date = scheduleData.profiles[session.loggedIn].Schedule.blackoutEnd.split("-")
  	date[1] = Number(date[1]) + 1;
  	if (Number(date[1]) > 12) {
  		date[1] = "01";
  		date[0] = Number(date[0]) + 1;
  	} else {
  		if (date[1] < 10) {
  			date[1] = "0" + date[1];
  		}
  	}
  	req.body.date = date[0] + "-" + date[1] + "-" + date[2];
  }

  newTask = new dataDef.Task(req.body.name, req.body.date, req.body.time,
      req.body.address, req.body.city, req.body.state, req.body.recurring);
  scheduleData.profiles[session.loggedIn].Schedule.tasks.push(newTask);
  res.send(null);
});

app.get('/mapview', function(req, res, next) {
  	var context = {};

	  GetCoords(res, context, complete, scheduleData.profiles[session.loggedIn].Schedule.tasks);
    context.maprequest = "https://maps.googleapis.com/maps/api/js?&key=" + credentials.mapKey + "&callback=initMap";

    function complete() {
      	context.layout = 'mapLayout';
    	context.tasks = scheduleData.profiles[session.loggedIn].Schedule.tasks;
      	res.render('mapview', context);
    }

});

app.get('/update/:id', function(req, res){
	callbackCount = 0;
	var context = {};
	context.jsscripts = ["updatetask.js"];
	id = req.params.id;
	context = scheduleData.profiles[session.loggedIn].Schedule.tasks[id];
	context.id = id;
	context.layout = 'updateTaskLayout';
	res.render('update-task', context);
});

app.put('/tasks/:id', function(req, res){
	var context = {};

	var isBlackout = IsInsideBlackout(req.body.olddate,
   scheduleData.profiles[session.loggedIn].Schedule.blackoutStart, scheduleData.profiles[session.loggedIn].Schedule.blackoutEnd);

	if (isBlackout) {
		isBlackout = 0;
	} else {
		isBlackout = IsInsideBlackout(req.body.date,
   		 scheduleData.profiles[session.loggedIn].Schedule.blackoutStart, scheduleData.profiles[session.loggedIn].Schedule.blackoutEnd);
	}

	var date = [];

  if (isBlackout) {
  	req.session.listWarning = "Updated task date entered was in the blackout period. Task date has not changed."
  	req.body.date = req.body.olddate;
  }

	scheduleData.profiles[session.loggedIn].Schedule.tasks[id].name = req.body.name;
	scheduleData.profiles[session.loggedIn].Schedule.tasks[id].date = req.body.date;
	scheduleData.profiles[session.loggedIn].Schedule.tasks[id].time = req.body.time;
	scheduleData.profiles[session.loggedIn].Schedule.tasks[id].Location.address = req.body.address;
	scheduleData.profiles[session.loggedIn].Schedule.tasks[id].Location.city = req.body.city;
	scheduleData.profiles[session.loggedIn].Schedule.tasks[id].Location.state = req.body.state;

  context.results = scheduleData.profiles[session.loggedIn].Schedule.tasks;
  res.send(null);
});

app.get('/updateprofile', function(req, res){
        callbackCount = 0;
        var context = {};
        context = scheduleData.profiles[session.loggedIn];
        context.layout = 'updateProfileLayout';
        res.render('update-profile', context);
});

app.put('/updateprofile', function(req, res) {
  var context = {};
  scheduleData.profiles[session.loggedIn].name = req.body.name;
  scheduleData.profiles[session.loggedIn].pword = req.body.pword;
  scheduleData.profiles[session.loggedIn].phoneNum = req.body.phone;
  scheduleData.profiles[session.loggedIn].homeLocation.address = req.body.addressH;
  scheduleData.profiles[session.loggedIn].homeLocation.city = req.body.cityH;
  scheduleData.profiles[session.loggedIn].homeLocation.state = req.body.stateH;
  scheduleData.profiles[session.loggedIn].workLocation.address = req.body.addressW;
  scheduleData.profiles[session.loggedIn].workLocation.city = req.body.cityW;
  scheduleData.profiles[session.loggedIn].workLocation.state = req.body.stateW;
  scheduleData.profiles[session.loggedIn].email = req.body.email;
  context.results = scheduleData.profiles[session.loggedIn];
  res.send(null);
});

app.get('/signup', function(req, res){
        callbackCount = 0;
        var context = {};
        context = {};
        context.layout = 'createProfileLayout';
        res.render('create-profile', context);
});

app.post('/signup', function (req, res) {
  console.log(req.body);
  var tasks = [];
  scheduleData.profiles.push( new dataDef.Profile(req.body.name, req.body.pword, tasks, req.body.phone, req.body.addressH,
    req.body.cityH, req.body.stateH, req.body.addressW, req.body.cityW, req.body.stateW, req.body.email) );
  console.log(scheduleData);
  accountsCount++;
  res.redirect('/');
});

app.put('/profiles', function(req, res){
        var context = {};
        scheduleData.profiles[session.loggedIn].name = req.body.name;
        scheduleData.profiles[session.loggedIn].pword = req.body.pword;
        scheduleData.profiles[session.loggedIn].phoneNum = req.body.phone;
        scheduleData.profiles[session.loggedIn].homeLocation.address = req.body.addressH;
        scheduleData.profiles[session.loggedIn].homeLocation.city = req.body.cityH;
        scheduleData.profiles[session.loggedIn].homeLocation.state = req.body.stateH;
        scheduleData.profiles[session.loggedIn].workLocation.address = req.body.addressW;
        scheduleData.profiles[session.loggedIn].workLocation.city = req.body.cityW;
        scheduleData.profiles[session.loggedIn].workLocation.state = req.body.stateW;
        scheduleData.profiles[session.loggedIn].email = req.body.email;
  context.results = scheduleData.profiles[session.loggedIn];
  res.send(null);
});

app.put('/new-password', function(req, res){
        var context = {};
        scheduleData.profiles[session.loggedIn].pword = req.body.pword;
  context.results = scheduleData.profiles[session.loggedIn];
  res.send(null);
});

app.put('/delete/:id', function(req, res){
	id = req.params.id;
	callbackCount = 0;
	var context = {};
	scheduleData.profiles[session.loggedIn].Schedule.tasks.splice(id, 1);
	context.results = scheduleData.profiles[session.loggedIn].Schedule.tasks[id];
	context.id = req.params.id;
	res.send(null);
});

app.get('/calendarview', function(req, res){
        callbackCount = 0;
        var context = {};
        context = scheduleData.profiles[session.loggedIn]
        res.render('calendarview', context);
});

app.post('/calendarview', function(req, res){
        callbackCount = 0;
        var context = {};
    	context.tasks = scheduleData.profiles[session.loggedIn].Schedule.tasks;
	context.month = req.body.month;
	res.send(context);
});

app.get('/add-blackout', function(req, res){
        var context = {};
        context.layout = 'addBlackoutLayout';
        res.render('addblackout', context);
});

app.put('/add-blackout', function(req, res){
  var context = {};
  scheduleData.profiles[session.loggedIn].Schedule.blackoutStart = req.body.startdate;
  scheduleData.profiles[session.loggedIn].Schedule.blackoutEnd = req.body.enddate;
  res.send(null);
});

app.get('/clear-calendar', function(req, res){
        var context = {};
        context.layout = 'clearCalendarLayout';
        res.render('clearcalendar', context);
});

app.put('/clear-calendar', function(req, res){
	var context = {};
  var start = req.body.clearStart;
	var end = req.body.clearEnd;
	var length = scheduleData.profiles[session.loggedIn].Schedule.tasks.length;

	var i = 0;

	while (i < length) {
		var task = scheduleData.profiles[session.loggedIn].Schedule.tasks[i];
		var date = task.date;
    // console.log("Task date");
    // console.log(date);
    // console.log(start);
		if (date != null) {
			if (start == date || end == date || (start <= date && end >= date)) {
				scheduleData.profiles[session.loggedIn].Schedule.tasks.splice(i, 1);
				i = i - 1;
				length = length - 1;
			}
		}
		i = i + 1;
	}

	res.send(null);
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
