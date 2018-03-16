module.exports.CoordinateFormatAddress = function(task) {
  addressUnf = task.Location;
  addressForm = task.Location.address.split(" ").join("+");
  addressForm += ",+" + task.Location.city.split(" ").join("+");
  addressForm += ",+" + task.Location.state.split(" ").join("+");
  return addressForm;
}

module.exports.BubbleSortDates = function(arr) {
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

      if (Number(date1[0]) > Number(date2[0])) { // year
        task = arr[j];
        arr[j] = arr[j - 1];
        arr[j - 1] = task;
      } else if (Number(date1[0]) == Number(date2[0]) && Number(date1[1]) > Number(date2[1])) { // month
        task = arr[j];
        arr[j] = arr[j - 1];
        arr[j - 1] = task;
      } else if (Number(date1[1]) == Number(date2[1]) && Number(date1[2]) > Number(date2[2])) { // day
        task = arr[j];
        arr[j] = arr[j - 1];
        arr[j - 1] = task;
      } else if (Number(date1[2]) == Number(date2[2]) && Number(time1[0]) > Number(time2[0])) { // hour
        task = arr[j];
        arr[j] = arr[j - 1];
        arr[j - 1] = task;
      } else if (Number(time1[0]) == Number(time2[0]) && Number(time1[1]) > Number(time2[1])) { // min
        task = arr[j];
        arr[j] = arr[j - 1];
        arr[j - 1] = task;
      }
    }
  }

  return arr;
}




