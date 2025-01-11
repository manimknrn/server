const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Create the Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200", // Allow connections from this origin
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

// Enable CORS for all routes
app.use(cors({
  origin: "http://localhost:4200", // Your Angular client origin
  methods: ["GET", "POST"]
}));

// Sample data generation (same as before)
function generateRecords(N) {
  const records = [];
  for (let i = 0; i < N; i++) {
    records.push({
      id: i + 1,
      assetName: `Asset-${i + 1}`,
      price: (Math.random() * 1000).toFixed(2),
      lastUpdate: new Date().toISOString(),
      type: i % 2 === 0 ? 'buy' : 'sell',
    });
  }
  return records;
}

let currentBatch = 0;
const BATCH_SIZE = 10;

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('requestRecords', (N) => {
    const records = generateRecords(N);
    const totalBatches = Math.ceil(N / BATCH_SIZE);

    function sendBatch() {
      const batch = records.slice(currentBatch * BATCH_SIZE, (currentBatch + 1) * BATCH_SIZE);
      batch.forEach((record) => {
        record.price = (Math.random() * 1000).toFixed(2); // Simulate price change
        record.lastUpdate = new Date().toISOString();
      });

      const startTime = Date.now();
      socket.emit('liveData', batch);
      const endTime = Date.now();
      const delay = endTime - startTime;

      socket.emit('batchStats', { delay, batchNumber: currentBatch + 1, totalBatches });

      currentBatch++;
      if (currentBatch < totalBatches) {
        setTimeout(sendBatch, 100);
      } else {
        socket.emit('complete');
      }
    }

    sendBatch();
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
