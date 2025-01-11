const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Sample data generation (same as before)
function generateRecords(N) {
    const assets = ['Gold', 'Silver', 'Oil', 'Bitcoin', 'Ethereum', 'Apple', 'Tesla'];
    const types = ['Buy', 'Sell'];
    const records = [];
    for (let i = 0; i < N; i++) {
        records.push({
            id: i + 1,
            assetName: assets[Math.floor(Math.random() * assets.length)],
            price: (Math.random() * 1000 + 100).toFixed(2), // Random price between 100 and 1100
            lastUpdate: new Date().toISOString(),
            type: types[Math.floor(Math.random() * types.length)]
        });
    }
    return records;
}


let currentBatch = 0;
const BATCH_SIZE = 10;

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('requestRecords', ({ numRecords, batchSize }) => {
    const records = generateRecords(numRecords);  // Generate records based on N
    const totalBatches = Math.ceil(numRecords / batchSize);

    function sendBatch() {
      const batch = records.slice(currentBatch * batchSize, (currentBatch + 1) * batchSize);

      // Simulate price changes
      batch.forEach((record) => {
        record.price = (Math.random() * 1000).toFixed(2);
        record.lastUpdate = new Date().toISOString();
      });

      const startTime = Date.now();
      socket.emit('liveData', { records: batch });
      const endTime = Date.now();
      const delay = endTime - startTime;

      socket.emit('batchStats', {
        delay,
        batchNumber: currentBatch + 1,
        totalBatches,
      });

      currentBatch++;
      if (currentBatch < totalBatches) {
        setTimeout(sendBatch, 100);
      } else {
        socket.emit('complete');
      }
    }

    sendBatch();
  });

  socket.on('requestRangeRecords', ({ startRow, endRow, batchSize }) => {
    const records = generateRecords(endRow - startRow); // Generate records for the requested range

    // Simulate price changes
    records.forEach((record) => {
      record.price = (Math.random() * 1000).toFixed(2);
      record.lastUpdate = new Date().toISOString();
    });

    socket.emit('liveData', { records });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
