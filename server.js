const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Utility function to generate random trade data
const generateTradeData = (N) => {
  const assets = ['Gold', 'Silver', 'Oil', 'Bitcoin', 'Ethereum', 'Apple', 'Tesla'];
  const types = ['Buy', 'Sell'];
  const data = [];
  for (let i = 0; i < N; i++) {
    data.push({
      id: i + 1,
      assetName: assets[Math.floor(Math.random() * assets.length)],
      price: (Math.random() * 1000 + 100).toFixed(2), // Random price between 100 and 1100
      lastUpdate: new Date().toISOString(),
      type: types[Math.floor(Math.random() * types.length)],
    });
  }
  return data;
};

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A client connected');

  // Listen for 'requestRecords' event from the client
  socket.on('requestRecords', (N) => {
    console.log(`Client requested ${N} records`);

    const data = generateTradeData(N); // Generate the initial data
    let emitCount = 0; // Track how many times data has been emitted

    // Emit data at intervals and close connection after N emissions
    const intervalId = setInterval(() => {
      if (emitCount >= N) {
        clearInterval(intervalId); // Stop the interval
        socket.disconnect(); // Close the WebSocket connection
        console.log(`Closed WebSocket after emitting ${N} updates`);
        return;
      }

      // Update the prices dynamically for the existing data
      const updatedData = data.map((record) => ({
        ...record,
        price: (parseFloat(record.price) + (Math.random() - 0.5) * 10).toFixed(2), // Random price change
        lastUpdate: new Date().toISOString(),
      }));

      // Emit the updated data
      socket.emit('liveData', updatedData);
      emitCount++;
      console.log(`Emitted update ${emitCount} of ${N}`);
    }, 2000); // Send updates every 2 seconds
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
