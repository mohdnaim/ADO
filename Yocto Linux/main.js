console.log('\nStarting Automatic Door Opener system ... by Mohd Naim bin Inche Ibrahim');

// variables
var mraa = require('mraa');
var Tail = require('always-tail'); // to 'tail' file in shell
var exec = require('child_process').exec; // to execute shell command
var five = require('johnny-five');
var servo; // digital pin 3
var lcd;
var Galileo = require("galileo-io");
var board = new five.Board({ io: new Galileo() });
// LED
var doorLED = new mraa.Gpio(13); // LED on digital pin 13 reflects the door; light on = open
doorLED.dir(mraa.DIR_OUT); //set the gpio direction to output
doorLED.write(0);
// initialize Linux Yocto
var setupserialport = exec('sh /home/root/setupserialport.sh', function(error, stdout, stderr) {});
// get Wi-Fi IP address
var IP = "";
function getIP() {
	var child = exec('sh /home/root/getWIFIIP.sh', function(error, stdout, stderr) { IP = trimSpaces(stdout); });
	//console.log(IP);
}
getIP();
// Date variables
var g_lastDateToggleDoor = new Date(); // save the last time the door is toggled

// variables
var ledState = true; // boolean to hold the state of doorLED
var g_secondsBetweenToggle = 5; // number of seconds to wait between opening and closing the door
function readAutoClose() {
	var child = exec('cat /home/root/autoclose.cfg', function(error, stdout, stderr) {
		if (error) { //console.log('readAutoClose error'); return 0; //console.log(error);
		} else {
			g_secondsBetweenToggle = trimSpaces(stdout);
			if(g_secondsBetweenToggle >= 5) { //console.log('readAutoClose 1'); return 1;
			}
			else
				g_secondsBetweenToggle = 0;
		}
	});
}
var g_iAutoClose = 0; g_iAutoClose = readAutoClose();

function setAutoClose(param) {
	if(param == 0)
		g_iAutoClose = 0;
	else
		g_iAutoClose = 1;
	if (param < 0)
		param = 0;
	else if(param > 0 && param < 5)
		param = 5;
	var str = 'echo ' + param + ' > /home/root/autoclose.cfg';
	var child = exec(str, function(error, stdout, stderr) {
		//if (error) { //console.log(error);
		//} else {}
	});
}
var express = require('express');
var app = express();
var path = require('path');
var session = require('express-session');
var bodyParser = require('body-parser');
var fsRead = require('fs'); // for file reading
var fsWrite = require('fs'); // for file writing
var g_jsonObjects; // store the JSON JavaScript object converted from XML
var xml2js = require('xml2js');
var xml2jsParser = new xml2js.Parser();
var https = require('https');
var app = require('express')();
var options = {
   key  : fsRead.readFileSync(path.join(__dirname + '/client', 'server.key')), //'server.key'),
   cert : fsRead.readFileSync(path.join(__dirname + '/client', 'server.crt')) //'server.crt')
};
var https = https.createServer(options, app);
var io = require('socket.io')(https);
// 'express' settings
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(session({
    secret: 'ssshhhhh',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
var sess;
app.get('/',function(req,res) { // Join all arguments together and normalize the resulting path.
    sess = req.session;
	sess.users = '';
    //Session set when user Request our app via URL
    if(sess.username) { // if session exist, do some action
        res.redirect('/client');
    } else {
        res.render('index.html');
    }
});

var g_sUsers = '';

app.post('/login',function(req,res) {
	var extractedusername = req.body.username, 
	    extractedPassword = req.body.pass;
	fsRead.readFile(__dirname + '/user.xml', function(err, data) {		
		xml2jsParser.parseString(data, function (err, result) {
			var jsonString = JSON.stringify(result);
			g_jsonObjects = JSON.parse(jsonString);
			
			if(Object.keys(g_jsonObjects).length > 0) { // if we actually have data
				// reset
				var sUsers = '';
				
				for(var i=0; i<g_jsonObjects.root.user.length; i++) {
					// saving a list of non-admin username
					if(parseInt(g_jsonObjects.root.user[i].isadmin) == 0) {
						var s1 = g_jsonObjects.root.user[i].username.toString();
						var s2 = s1.concat(' '); // whitespace as delimiter
						//console.log('s2 = ' + s2);
						sUsers = sUsers.concat(s2);
					}
					
					if(g_jsonObjects.root.user[i].username == extractedusername && g_jsonObjects.root.user[i].password == extractedPassword) {	
						sess = req.session;
						sess.username = req.body.username;
						
						var isadmin = parseInt(g_jsonObjects.root.user[i].isadmin);
						if(isadmin == 1)
							sess.isadmin = 1;
						else
							sess.isadmin = 0;
						
						//sess.iddoorselected = -1;
						res.end('correct');
						
						//var date = new Date();
						//var log = date.toString() + " : " + sess.username + " logged in\n";
						//fsWrite.appendFile(__dirname + '/system.log', log, function (err) {});
						
						//break; // have to comment this since we want a list of username
					}
				}
				// not found so,
				res.end('wrong');
			}
			g_sUsers = sUsers;
		});
	});
});
app.get('/client', function(req, res) { 
    sess = req.session;
    if(sess.username) {
        res.sendFile(path.join(__dirname + '/client', 'index.html'));
    } else {
        res.write('<h1>Please login first.</h1>');
        res.end('<a href="/">Login</a>');
    }
});
app.get('/logout',function(req,res) {
	if(sess.username) {
		//var date = new Date();
		//var log = date.toString() + " : " + sess.username + " logged out\n";
		//fsWrite.appendFile(__dirname + '/system.log', log, function (err) {});
	}
    req.session.destroy(function(err) {
        if(err) { //console.log(err);
        } else
            res.redirect('/');
    });
});
// Allow use of files in client folder
app.use(express.static(__dirname + '/client'));
app.use('/client', express.static(__dirname + '/client'));

var bBoardReady = false;
board.on("ready", function() {
	servo = new five.Servo(3);
    lcd = new five.LCD({
        pins: [12, 11, 6, 7, 8, 9], // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
        rows: 2,
        cols: 16
    });
	bBoardReady = true;
	
	lcd.clear(); lcd.cursor(0,0);
	if(doorLED.read() == 0) {
		lcd.print("DOOR CLOSED");
	}
	else {
		lcd.print("DOOR OPENED");
	}
	
	//getIP(); this never works
	//if(IP != "") {
	//	lcd.cursor(1,0);
	//	lcd.print(IP);
	//}
	var child = exec('echo "" > /a.txt', function(error, stdout, stderr) {	}); // clear the Bluetooth data on system start
	
	console.log("System running OK ...");
	
    //g_lastDateToggleDoor = new Date(); // time now
    this.repl.inject({
        lcd: lcd, // originally: lcd: lcd
		servo: servo
    });
});
https.listen(3000, function() {
  console.log('Web server Active listening on https://*:3000');
});

//Socket.io Event handlers
io.on('connection', function(socket) {
    // copyright
});

// PIR motion sensor
var g_lastTimeSensed = new Date(); // save the last time the PIR sensor detects motion
var sensorLED = new mraa.Gpio(5); // LED that represents PIR motion sensor attached to digital pin 5
sensorLED.dir(mraa.DIR_OUT); //set the gpio direction to output
sensorLED.write(0); // initialized to OFF
var sensorLEDstatus = false;
var grove_motion = require('jsupm_biss0001');
var IRsensor = new grove_motion.BISS0001(10); // PIR motion sensor attached to digital pin 10

// some functions definition
function waitMilliSeconds(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds)
			break;
	}
}
function trimSpaces (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

// tail /a.txt (written by Arduino sketch) to read data from bluetooth devices
var filename = "/a.txt";
if (!fsWrite.existsSync(filename))
	fsWrite.writeFileSync(filename, "");
var tail = new Tail(filename, '\n');
var g_lastTimeReceivedBT = new Date();
var g_nowTimeReceivedBT;
tail.on('line', function(data) {
    var data2 = data.replace(/\n$/, "")
	//console.log("got line:", data);
	
	g_nowTimeReceivedBT = undefined;
	g_nowTimeReceivedBT = new Date();
	var receivedTimeDifference = g_nowTimeReceivedBT.getTime() - g_lastTimeReceivedBT.getTime();
	g_lastTimeReceivedBT = g_nowTimeReceivedBT;
	var seconds = Math.floor((receivedTimeDifference) / (1000));
	if(seconds >= 5 && data2 != "LIDL") {
		if(data2 == "JURGITA") {
			var param = 1;
			if(toggleLED(param, 0) == -1) { // 0 means not doorid=0 but it's from bluetooth (door id = 1)
				var child = exec('echo " JURGITA" >> /dev/ttyS0', function(error, stdout, stderr) {});
				//console.log("BT sends OPEN while it's already opened so send OPEN to BT");
			}
		} else if(data2 == "DARYA") {
			var param = 0;
			if(toggleLED(param, 0) == -1){ // 0 means not doorid=0 but it's from bluetooth (door id = 1)
				var child = exec('echo " DARYA" >> /dev/ttyS0', function(error, stdout, stderr) {});
				//console.log("BT sends CLOSE while it's already closed so send CLOSE to BT");
			}
		}
	}
	if(data2 == "LIDL") { //console.log("bluetooth asks for LED state");       
		var iledstate = parseInt(doorLED.read());
		if(iledstate == 0) {
			var child = exec('echo " LIDL0" >> /dev/ttyS0', function(error, stdout, stderr) {});
		} else if(iledstate == 1) {
			var child = exec('echo " LIDL1" >> /dev/ttyS0', function(error, stdout, stderr) {});
		}
	}
});
//tail.on('error', function(data) {
	//console.log("error:", data);
//});
tail.watch();

function toggleLED(param, doorid) { // param=1 to open, 0 to close. doorid=0 means from bluetooth, 1,2,3,4 and so on means from wifi
	// returns:
	// -2 : sender's request for door other than door ID 1 is false request
	// -1 : sender's current door status is actually opposite
	// 0 : too fast to toggle the door. must be > 5 seconds between last toggle
	// 1 : successfully toggle the door
	
	ledState = doorLED.read();
	if(param == ledState)
		return -1;
	
	if(doorid == 0) { // from bluetooth, so proceed with door ID = 1
	}
	else if(doorid != 1) { // if request to toggle other than door ID = 1, return error because only 1 door is available for now
		return -2;
	}

	var nowDateToggleDoor = new Date();
	var toggleTimeDifference = nowDateToggleDoor.getTime() - g_lastDateToggleDoor.getTime();
	var seconds = Math.floor((toggleTimeDifference) / (1000));
	//console.log("seconds: " + seconds);
	if(seconds >= 5) {
		g_lastDateToggleDoor = new Date();
		if(ledState == 0) {
			doorLED.write(1);
			//console.log("write 1");
			ledState = 1;
			lcd.clear(); lcd.cursor(0,0); lcd.print("DOOR OPENED"); lcd.cursor(1,0); lcd.print(IP);
			var child = exec('echo " JURGITA" >> /dev/ttyS0', function(error, stdout, stderr) {});
			servo.max();
		}
		else {
			doorLED.write(0);
			//console.log("write 0");
			ledState = 0;
			lcd.clear(); lcd.cursor(0,0); lcd.print("DOOR CLOSED"); lcd.cursor(1,0); lcd.print(IP);
			var child = exec('echo " DARYA" >> /dev/ttyS0', function(error, stdout, stderr) {});
			servo.min();
		}
		io.emit('set ledstate', {var1:ledState, var2:1}); //io.emit('toogle led', ledState);
		return 1;
	} else {
		//console.log("too fast to toggle the door .. < " + g_secondsBetweenToggle + " seconds (g_secondsBetweenToggle)");
		return 0;
	}
}

setInterval(function() {
	if(IRsensor.value()) { // if PIR motion sensor senses
		g_lastTimeSensed = undefined;
		g_lastTimeSensed = new Date();
		if(sensorLEDstatus == false) {
			sensorLED.write(1);
			sensorLEDstatus = true;
		}
    } else { // PIR motion sensor doesn't sense any motion
		if(sensorLEDstatus == true) { // if LED status is on, check whether we need to turn it off
			//console.log('no motion sense but LED sensor is on');
			var timeNow = new Date();
			var timeDifference = timeNow.getTime() - g_lastTimeSensed.getTime();
			var seconds = Math.floor((timeDifference) / (1000));
			if(seconds > 5) { // wait at least 5 seconds to toggle PIR LED
				sensorLED.write(0);
				sensorLEDstatus = false;
			}
		}
		else if(sensorLEDstatus == false && doorLED.read() == 1) { // no sense, door open ... checking to auto-close door
			//console.log('no motion sense, door opened');
			var timeNow = new Date();
			var timeDifference = timeNow.getTime() - g_lastDateToggleDoor.getTime();
			var seconds = Math.floor((timeDifference) / (1000));
			if(g_secondsBetweenToggle > 0 && seconds >= g_secondsBetweenToggle) { // if g_secondsBetweenToggle already past, then close the door
				//console.log('g_secondsBetweenToggle is past, trying to close the door');
				if(toggleLED(0, 1) == 1) { 
					sensorLED.write(0);
					sensorLEDstatus = false;
				}
			}
		} // else... PIR motion doesn't sense and door is closed.. do nothing
	}
}, 2000); // repeat every 2s

var checkIP = setInterval(function() {
	getIP();
    if(IP != "") {
		//console.log("Wi-Fi connected");
        //clearInterval(checkIP);
		lcd.cursor(1,0);
		lcd.print(IP);
    }
	else {
		//clearInterval(checkIP);
		//console.log("stopped checking Wi-Fi IP");
	}
}, 20000); // interval set at 20 seconds or 1/6 minute

function deleteUser(sUserToDel) {
	var jsObjects, xmlString = '';
	var bdone = false;
	
	fsRead.readFile(__dirname + '/user.xml', function(err, data) {		
		xml2jsParser.parseString(data, function (err, result) {
			jsObjects = result; //JSON.parse(jsonString);
			if(Object.keys(jsObjects).length > 0) { // if we actually have data
				for(var i=0; i<jsObjects.root.user.length; i++) {
					if(parseInt(jsObjects.root.user[i].isadmin) == 0) {
						if(jsObjects.root.user[i].username == sUserToDel) {
							delete jsObjects.root.user[i];
							io.emit('user deleted', sUserToDel);
							break;
						}
					}
				}
			}
		});
		
		g_jsonObjects = jsObjects;
		var builder = new xml2js.Builder();
		xmlString = builder.buildObject(g_jsonObjects);
		bdone = true;
	});
	
	var naim = setInterval(function() {
		if(bdone) {
			fsWrite.writeFile(__dirname + '/user.xml', xmlString, function(err) {});
			clearInterval(naim);
		}
	}, 200); // repeat every 0.2 second
}

function addUser(sUsername, sPassword) {
	var jsObjects, xmlString = '';
	var bdone = false;
	var isexisted = 0;
	
	fsRead.readFile(__dirname + '/user.xml', function(err, data) {		
		xml2jsParser.parseString(data, function (err, result) {
			jsObjects = result; //JSON.parse(jsonString);
			
			if(Object.keys(jsObjects).length > 0) { // if we actually have data
				for(var i=0; i<jsObjects.root.user.length; i++) {
					if(parseInt(jsObjects.root.user[i].isadmin) == 0) {
						if(jsObjects.root.user[i].username == sUsername) {
							isexisted = 1;
							io.emit('user exists', sUsername);
							break;
						}
					}
				}
			}
			
			if(isexisted == 0) {
				var newid = jsObjects.root.user.length + 1;
				var newobj = { $: { id: newid }, name: sUsername, username: sUsername, password: sPassword, isadmin: 0};
				jsObjects.root.user.splice(newid, 0, newobj);
				io.emit('user added', sUsername);
			}
		});
		
		if(isexisted == 0) {
			g_jsonObjects = jsObjects;
			var builder = new xml2js.Builder();
			xmlString = builder.buildObject(g_jsonObjects);
			bdone = true;
		}
	});
	
	var naim = setInterval(function() {
		if(bdone) {
			fsWrite.writeFile(__dirname + '/user.xml', xmlString, function(err) {});
			clearInterval(naim);
		}
	}, 200); // repeat every 0.2 second
}
