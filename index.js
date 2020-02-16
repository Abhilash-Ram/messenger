const Express = require('express');
const app = new Express();

const server = require('http').createServer(app);
var path = require('path');
const dir = path.join(__dirname, 'images');

const PORT = 5000;
const io = require('socket.io')(server, {
  path: '/test',
  serveClient: false,
  // below are engine.IO options
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

io.on('connection', function (socket) {
  console.log('a user connected', socket);
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('private message', function (from, msg) {
    console.log('I received a private message by ', from, ' saying ', msg);
  });

  socket.on('disconnect', function () {
    console.log('disconnect');
    io.emit('user disconnected');
  });
  socket.on('message', function () {
    console.log('message');
  });
})

app.use('/images', Express.static(path.join(__dirname, 'images')));
app.use('/node_modules', Express.static(path.join(__dirname, 'node_modules')));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(PORT, () => {
  console.log(`Server is listening on Port ${PORT}`);
});