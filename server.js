const io = require('socket.io')(3000); // Assuming your server is running on port 3000

// Simulate data generation
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
const BATCH_SIZE = 10; // Update 10 records at a time

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('requestRecords', (N) => {
    const records = generateRecords(N); // Generate records
    const totalBatches = Math.ceil(N / BATCH_SIZE);

    function sendBatch() {
      const batch = records.slice(currentBatch * BATCH_SIZE, (currentBatch + 1) * BATCH_SIZE);

      // Simulate price change for these 10 records
      batch.forEach((record) => {
        record.price = (Math.random() * 1000).toFixed(2); // Random price for demo purposes
        record.lastUpdate = new Date().toISOString(); // Update lastUpdate field
      });

      const startTime = Date.now();

      socket.emit('liveData', batch); // Emit batch of 10 records with updated prices

      const endTime = Date.now();
      const delay = endTime - startTime; // Calculate the delay

      // Emit delay stats
      socket.emit('batchStats', { delay, batchNumber: currentBatch + 1, totalBatches });

      currentBatch++;
      if (currentBatch < totalBatches) {
        setTimeout(sendBatch, 100); // Slight delay between batches
      } else {
        socket.emit('complete'); // Notify client that data is complete
      }
    }

    sendBatch();
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
