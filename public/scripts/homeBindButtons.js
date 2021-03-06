document.addEventListener('DOMContentLoaded', function() {
	bindUpdDel();  
	bindMapCalButton();
	bindLogoutButton();
	warningTimer();
});

function bindUpdDel() {
	var buttons = document.getElementsByClassName('TaskModButton');

	i = 0; 
	while (i < buttons.length){
	(function(i){
		if (i % 2 == 0) {
			buttons[i].addEventListener("click", function(event){	
				id = i; 
				id = id / 2; 
				deleteTask(id); 
			}); 
		}

		else{
		buttons[i].addEventListener("click", function(event){
			id = i; 
			console.log(id);
			if (id == 1) {
				id = 0; 
			}
			else {
				id = id / 2;	
				id = Math.floor(id); 
			}
			document.location.href = "/update/" + id; 
			}); 
		}
		})(i); 
		i = i + 1; 
	}
}

function bindMapCalButton() {
  var button = document.getElementById('MapView');
  button.addEventListener('click', function(event) {
    window.location.href = '/mapview';
    event.preventDefault();
  });

  var calButton = document.getElementById('CalendarView'); 
  calButton.addEventListener('click', function(event) {
    window.location.href = '/calendarview';
    event.preventDefault(); 
  }); 
}

function bindLogoutButton() {
  var button = document.getElementById('LogOut');
  button.addEventListener('click', function(event) {
    window.location.href = '/logOut';
    event.preventDefault();
  });
}

function warningTimer() { // Warning only remains for specified time.
  setTimeout( function() {
    var header = document.getElementById('warning');
    if (header) {
       var parent = header.parentNode;
       parent.removeChild(header);
    }
  }, 4500);
}