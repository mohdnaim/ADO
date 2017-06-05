var socket = io();

$("#changedoorsubmit").click(function() { socket.emit('get ledstate', document.getElementById("id_door").value); });

$("#led-link").click(function() { //$("#led-link").on('click', function(e) {
	var str = document.getElementById("led-link").value; //var innerHtml = document.getElementById("led-link").innerText;
	var var1 = 0;
	if(str == "Open")
		var1 = 1;
	else if(str == "Close")
		var1 = 0;
    socket.emit('toogle led', {var1:str, var2:document.getElementById("id_door").value});
});

$("#sendpassword").click(function() { socket.emit('sendpassword', {password1: $('#newpassword1').val(), password2: $('#newpassword2').val()}); });

$("#adduser").click(function() { 
	socket.emit('adduser', {username: $('#newusername').val(), password: $('#newpassword').val()});
	document.getElementById("adduser").disabled = true;
});

$("#deleteuser").click(function() {
	var e = document.getElementById("userlist");
	var str = e.options[e.selectedIndex].value;
	socket.emit('delete user', str);
});

$("#saveduration").click(function() {
	if(document.getElementById('checkboxG5').checked == true) {
		var v1 = document.getElementById('ex6SliderVal').innerHTML;
		var v2 = v1.replace(/[^0-9]/g, '');
		var v3 = parseInt(v2);
		socket.emit('setAutoClose', v3);
	}
	else
		socket.emit('setAutoClose', 0);
});

$("#submit").click(function(){
    $.post("/login",{username:$("#username").val(),pass:$("#password").val()},function(data) {        
        if(data === 'correct')
            window.location.href="/client";
        else if(data === 'wrong')
			window.location.href="/wrong";
    });
});

function onpageload() {
	document.getElementById("led-link").disabled = true;
	socket.emit('get status', 0);
	socket.emit('get autoclose', 0);
	socket.emit('get doors', 0);
	socket.emit('get userlist', 0);
	var opts = {
		  lines: 13 // The number of lines to draw
		, length: 28 // The length of each line
		, width: 14 // The line thickness
		, radius: 42 // The radius of the inner circle
		, scale: 1 // Scales overall size of the spinner
		, corners: 1 // Corner roundness (0..1)
		, color: '#000' // #rgb or #rrggbb or array of colors
		, opacity: 0.25 // Opacity of the lines
		, rotate: 0 // The rotation offset
		, direction: 1 // 1: clockwise, -1: counterclockwise
		, speed: 1 // Rounds per second
		, trail: 60 // Afterglow percentage
		, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
		, zIndex: 2e9 // The z-index (defaults to 2000000000)
		, className: 'spinner' // The CSS class to assign to the spinner
		, top: '50%' // Top position relative to parent
		, left: '50%' // Left position relative to parent
		, shadow: false // Whether to render a shadow
		, hwaccel: false // Whether to use hardware acceleration
		, position: 'absolute' // Element positioning
	}
	var target = document.getElementById('jurgita');
	var spinner = undefined;
    $("#submit").click(function() {
		spinner = new Spinner(opts).spin(target);
        username=$("#username").val();
        pass=$("#password").val();
        $.post("/login",{username:username,pass:pass},function(data){        
            if(data === 'correct') {
				window.location.href="/client";
            } else if(data === 'wrong') {
				document.getElementById('postlogin').innerHTML = '<p style="color:red">Wrong username and password</p>';
				spinner.stop();
			}
        });
    });
}

function waitMilliSeconds(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
