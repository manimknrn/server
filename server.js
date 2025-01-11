const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

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
        socket.emit('tradeUpdates', { timestamp: new Date() });
    }, 3000);
    socket.on('disconnect', () => {
        console.log('A client disconnected');
    });
});

let records = Array.from({ length: 20000 }, (_, index) => ({
    id: index + 1,
    assetName: `Asset ${index + 1}`,
    price: 10 * index, // Price between 0-1000
    lastUpdate: new Date().toISOString(),
    type: index % 2 === 0 ? 'Stock ' + (index + 1) : 'Bond ' + (index + 1), // Alternate between Stock and Bond
}));
// API to fetch all records
app.get('/api/trades', (req, res) => {
    res.json(records);
});

let updateRecords = [
    {
        "assetName": "assetName 1",
        "price": 199990,
        "lastUpdate": 1736500416,
        "type": "type 1",
        "id": 1
    },
    {
        "assetName": "assetName 2",
        "price": 199980,
        "lastUpdate": 1736500356,
        "type": "type 2",
        "id": 2
    },
    {
        "assetName": "assetName 2",
        "price": 199980,
        "lastUpdate": 1736500356,
        "type": "type 2",
        "id": 6
    }
]
// API to fetch all records
app.get('/api/tradeUpdates', (req, res) => {
    res.json(updateRecords);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
