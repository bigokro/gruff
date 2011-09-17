var app = require('express').createServer()
, io = require('socket.io').listen(app);

var port = process.env.NODE_ENV == 'production' ? 80 : 7080;

app.listen(port);

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
	console.log(data);
    });
});
