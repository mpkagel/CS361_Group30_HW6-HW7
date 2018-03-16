module.exports.CreateTestData = function() {
  var dataDef = require('./dataDefinition.js')

  var arr = [];

  tasks = [
    new dataDef.Task("Get paint supplies", "2018-03-22", "13:00",
        "10913 Olson Dr", "Rancho Cordova", "CA", 0),
    new dataDef.Task("Get groceries", "2018-03-22", "14:00",
    	"270 Palladio Pkwy", "Folsom", "CA", 0),
    new dataDef.Task("Work", null, null,
    	"10425 Norden Ave", "Mather", "CA", 1),
    new dataDef.Task("Go to Gym", null, null,
    	"700 Oak Ave Pkwy", "Folsom", "CA", 1),
    new dataDef.Task("Feed goats", null, null,
    	"300 Leckenby Way", "Folsom", "CA", 1),
    new dataDef.Task("Repair fence", "2018-03-22", "16:00",
    	"2675 E Bidwell St", "Folsom", "CA", 0),
    new dataDef.Task("Plant sunflowers", "2018-03-22", "17:00",
    	"1224 Souza Way", "Folsom", "CA", 0),
    new dataDef.Task("Build log cabin", "2018-03-22", "19:00",
    	"5041 Debron Ct", "Pollock Pines", "CA", 0),
    new dataDef.Task("Paint mind-shattering landscape", "2018-03-26", "21:50",
    	"973 Palmer Circle", "Folsom", "CA", 0),
    new dataDef.Task("Become one with nature", "2018-04-03", "2:00",
    	"1953 N Upper Truckee Road", "South Lake Tahoe", "CA", 0),
    new dataDef.Task("Go to hardware store", "2018-03-22", "1:00",
    	"9500 Greenback Ln", "Folsom", "CA", 0),
    new dataDef.Task("Go to animal farm supply", "2018-05-03", "5:30",
    	"2780 E Bidwell St", "Folsom", "CA", 0),
    new dataDef.Task("Go to dentist", "2018-05-03", "18:45",
    	"1016 Riley St", "Folsom", "CA", 0),
    new dataDef.Task("Doctor checkup", "2018-03-22", "13:30",
    	"1840 Sierra Gardens Dr", "Roseville", "CA", 0)
  ];

  arr.profiles = [
    new dataDef.Profile("Bob Ross", "aTY*ta", tasks, "2736197735", "2200 Goldblum Way", "Roseville", "CA", "190 Barley St", "Roseville", "CA", "rossb@gmail.com")

  ];


  return arr;
}


module.exports.PrintTestData = function(arr) {
  console.log("Now printing profile info");
  arr.profiles.forEach ( function(e) {
    console.log(e);
    console.log(e.Schedule);
    e.Schedule.tasks.forEach( function(e) {
      console.log(e);
    });
  });

}
