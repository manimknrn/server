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
let nextId = 1; // Global counter for sequential IDs

// Generate records with sequential IDs
function generateRecords(N) {
    const assets = ['Gold', 'Silver', 'Oil', 'Bitcoin', 'Ethereum', 'Apple', 'Tesla'];
    const types = ['Buy', 'Sell'];
    const records = [];

    for (let i = 0; i < N; i++) {
        records.push({
            id: nextId++, // Increment global ID
            assetName: assets[Math.floor(Math.random() * assets.length)],
            price: (Math.random() * 1000 + 100).toFixed(2), // Random price between 100 and 1100
            lastUpdate: new Date().toISOString(),
            type: types[Math.floor(Math.random() * types.length)],
        });
    }

    return records;
}

io.on('connection', (socket) => {
    console.log('Client connected');
    let interval = null;

    // Generate records based on user input
    socket.on('generateData', ({ totalRecords }) => {
        console.log(`Generating ${totalRecords} records...`);
        nextId = 1; // Reset `nextId` to start IDs from 1
        allRecords = generateRecords(totalRecords);
        socket.emit('dataGenerated', { message: `${totalRecords} records generated successfully.` });
    });

    // Handle scroll-based data fetch
    socket.on('getBatch', ({ startIndex, batchSize }) => {
        const batch = allRecords.slice(startIndex, startIndex + batchSize);
        socket.emit('batchData', { records: batch });
    });

    // Periodic updates for loaded records
    socket.on('startLiveUpdates', () => {
        if (interval) clearInterval(interval); // Ensure no duplicate intervals

        interval = setInterval(() => {
            if (!allRecords.length) return;

            const updatedRecords = allRecords
                .filter((record) => record.id % 4 === 0) // Filter records by `id % 4 === 0`
                // .slice(0, 5); // Pick 5 filtered records

            updatedRecords.forEach((record) => {
                record.price = (Math.random() * 1000).toFixed(2); // Update price
                record.lastUpdate = new Date().toISOString(); // Update timestamp
            });

            socket.emit('liveUpdates', { records: updatedRecords });
        }, 2000);
    });

    // Handle stopping live updates
    socket.on('stopLiveUpdates', () => {
        if (interval) {
            clearInterval(interval);
            interval = null;
            console.log('Live updates stopped.');
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        if (interval) {
            clearInterval(interval);
        }
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
