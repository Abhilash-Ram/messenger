const Express = require('express');
const app = new Express();

const server = require('http').createServer(app);
var path = require('path');
const dir = path.join(__dirname, 'images');

const PORT = 5000;

var users = {}

const io = require('socket.io')(server, {
  serveClient: false,
  // below are engine.IO options
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
  "force new connection": true,
  reconnection: true,
  reconnectionDelay: 2000,                  //starts with 2 secs delay, then 4, 6, 8, until 60 where it stays forever until it reconnects
  reconnectionDelayMax: 60000,             //1 minute maximum delay between connections
  reconnectionAttempts: "Infinity",         //to prevent dead clients, having the user to having to manually reconnect after a server restart.
  timeout: 10000,                           //before connect_error and connect_timeout are emitted.
  transports: ["websocket"]
});

io.on('connection', function (socket) {
  socket.emit('status', {
    message: `Socket connection established`,
    users: Object.keys(users)
  });

  socket.on('chat message', function (data) {
    if (users[data.to]) {
      users[data.to].emit('chat message', data);
    } else {
      socket.emit('message', {
        type: "text",
        message: "User is not in online"
      });
    }
  });

  socket.on('message', function (data) {
    var payload = {
      type: 'text',
      message: "Welcome"
    }
    if (users[data.username]) {
      payload.message = `Welcome Back ${data.username}`;
    }
    users[data.username] = socket;
    socket.emit('message', payload);
  });

  socket.on('private message', function (from, msg) {
    console.log('I received a private message by ', from, ' saying ', msg);
  });

  socket.on('disconnect', function (reason) {
    console.log(`disconnect`, reason);
    if (reason === 'io server disconnect') {
      // the disconnection was initiated by the server, you need to reconnect manually
      socket.connect();
    } else {
      socket.emit('user disconnected');
    }
  });

});

app.use('/images', Express.static(path.join(__dirname, 'images')));
app.use('/node_modules', Express.static(path.join(__dirname, 'node_modules')));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(PORT, () => {
  console.log(`Server is listening on Port ${PORT}`);
});