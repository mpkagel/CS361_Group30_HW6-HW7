/*************************************************************
** File Name: scheduleServer.js
** Author: Group 30
** Course: CS361
** Description: This is the javascript file that ????????????
*************************************************************/
var express = require('express');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var request = require('request');

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.set('port', 5047);
app.use(express.static('public'));
//var credentials = require('./credentials.js');
var dataDef = require('./dataDefinition.js');
var testData = require('./testDataCreation.js')

// Starting program
var scheduleData = [];

scheduleData = testData.CreateTestData();
//testData.PrintTestData(scheduleData);

app.get('/', function(req, res, next) {
  	var context = {};
    //context.maprequest = "https://maps.googleapis.com/maps/api/js?&key=" + credentials.mapKey + "&callback=initMap";

    context.results = scheduleData.profiles[0].Schedule.tasks;
    res.render('home', context);
}); 

app.post('/', function(req, res) {
  var context = {};
  if (req.body['Add Item']) {
    newTask = new dataDef.Task(req.body.name, req.body.date, req.body.time,
    	req.body.address, req.body.city, req.body.state, req.body.recurring);   
    scheduleData.profiles[0].Schedule.tasks.push(newTask);
    context.results = scheduleData.profiles[0].Schedule.tasks;
    res.render('home', context);

  }
});

app.get('/update/:id', function(req, res){
	callbackCount = 0;
	var context = {};
	context.jsscripts = ["updatetask.js"];
	console.log(req.params.id);
	id = req.params.id; 
	context = scheduleData.profiles[0].Schedule.tasks[id]; 
	context.id = id; 
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

app.put('/delete/:id', function(req, res){

	id = req.params.id;
	callbackCount = 0;
	var context = {};
	scheduleData.profiles[0].Schedule.tasks.splice(id, 1); 
	context = scheduleData.profiles[0].Schedule.tasks[id]; 
	context.id = req.params.id; 
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
