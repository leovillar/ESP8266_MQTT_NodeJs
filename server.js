var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var mqtt = require('mqtt');
var io = require('socket.io').listen(5001);
var client  = mqtt.connect('mqtt://iot.eclipse.org:1883');

app.use(express.static(path.join(__dirname, 'public')));

//Enable to cors to angular app GET request with http library.
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
 
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

//Routes
var routes = {};
routes.switches = require('./route/switches.js');

//Get all published switches
app.get('/switches', routes.switches.list);

io.sockets.on('connection', function (socket) {
  socket.on('subscribe', function (data) {
    console.log('Subscribing to '+data.topic);
    socket.join(data.topic);
    client.subscribe(data.topic);
  });

  socket.on('publish', function (data) {
    console.log('Publish to '+data.message);
    var options = {qos: 0, retain:true};
    client.publish(data.topic, data.message, options);
  });  
});
 
client.on('message', function (topic, message) {
  console.log(topic+'='+message);
  io.sockets.in(topic).emit('mqtt',{'topic': String(topic),
    'message':String(message) });  
});
 
server.listen(3000);
console.log('Server escuchando en puerto 3000');
