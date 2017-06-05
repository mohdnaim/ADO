var socket = io();

var email,pass;

socket.on('result', function(msg) {
	windows.alert("test");
	alert("test2");
	$('#email').val('');
});

$("#submit").click(function() {
	email=$("#email").val();
    pass=$("#password").val();
 
	socket.emit('verify', {email: email, pass:pass});
});
