const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
let allRecords = [];

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


io.on('connection', (socket) => {
    console.log('Client connected');
  
    // Generate records based on user input
    socket.on('generateData', ({ totalRecords }) => {
      console.log(`Generating ${totalRecords} records...`);
      allRecords = generateRecords(totalRecords);
    });
  
    // Handle scroll-based data fetch
    socket.on('getBatch', ({ startIndex, batchSize }) => {
      const batch = allRecords.slice(startIndex, startIndex + batchSize);
      socket.emit('batchData', { records: batch });
    });
  
    // Periodic updates for loaded records (filtered by id % 4 === 0)
    const interval = setInterval(() => {
      if (!allRecords.length) return;
  
      const updatedRecords = allRecords
        .filter((record) => record.id % 4 === 0)
        .slice(0, 5); // Pick 5 filtered records
  
      updatedRecords.forEach((record) => {
        record.price = (Math.random() * 1000).toFixed(2);
        record.lastUpdate = new Date().toISOString();
      });
  
      socket.emit('liveUpdates', { records: updatedRecords });
    }, 2000);
  
    // Handle disconnection
    socket.on('disconnect', () => {
      clearInterval(interval);
      console.log('Client disconnected');
    });
  });

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
