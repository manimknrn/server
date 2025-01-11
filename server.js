const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// REST API endpoint
app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from the Node.js server!' });
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A client connected');
  setInterval(() => {
    socket.emit('data', { timestamp: new Date() });
  }, 3000);
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
