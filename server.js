const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

const MIN_BOOK_COUNT = 10;
const MAX_BOOK_COUNT = 20;

const MIN_TRADE_COUNT = 1;
const MAX_TRADE_COUNT = 10;

const products = [
    'Palm Oil', 'Rubber', 'Wool', 'Amber', 'Copper', 'Lead', 'Zinc', 'Tin',
    'Aluminium', 'Aluminium Alloy', 'Nickel', 'Cobalt', 'Molybdenum',
    'Recycled Steel', 'Corn', 'Oats', 'Rough Rice', 'Soybeans', 'Rapeseed',
    'Soybean Meal', 'Soybean Oil', 'Wheat', 'Milk', 'Coca', 'Coffee C',
    'Cotton No.2', 'Sugar No.11', 'Sugar No.14',
];

const portfolios = ['Aggressive', 'Defensive', 'Income', 'Speculative', 'Hybrid'];

let nextBookId = 62472;
let nextTradeId = 0; //24287;

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createBookName() {
    nextBookId++;
    return 'GL-' + nextBookId;
}

function createTradeId() {
    nextTradeId++;
    return nextTradeId;
}

function createTradeRecord(product, portfolio, book) {
    const current = Math.floor(Math.random() * 100000) + 100;
    const previous = current + Math.floor(Math.random() * 10000) - 2000;

    return {
        product: product,
        portfolio: portfolio,
        book: book,
        trade: createTradeId(),
        submitterID: randomBetween(10, 1000),
        submitterDealID: randomBetween(10, 1000),
        dealType: Math.random() < 0.2 ? 'Physical' : 'Financial',
        bidFlag: Math.random() < 0.5 ? 'Buy' : 'Sell',
        current: current,
        previous: previous,
        pl1: randomBetween(100, 1000),
        pl2: randomBetween(100, 1000),
        gainDx: randomBetween(100, 1000),
        sxPx: randomBetween(100, 1000),
        _99Out: randomBetween(100, 1000),
    };
}

function generateData(N) {
    const data = [];
    for (const product of products) {
        for (const portfolio of portfolios) {
            const bookCount = randomBetween(MIN_BOOK_COUNT, MAX_BOOK_COUNT);
            for (let i = 0; i < bookCount; i++) {
                const book = createBookName();
                const tradeCount = randomBetween(MIN_TRADE_COUNT, MAX_TRADE_COUNT);
                for (let j = 0; j < tradeCount; j++) {
                    data.push(createTradeRecord(product, portfolio, book));
                }
            }
        }
    }
    return data;
}

io.on("connection", (socket) => {
    console.log("Client connected");
    socket.on('requestRecords', ({ numRecords }) => {
        // Send initial data
        const initialData = generateData(numRecords);
        // socket.emit('initial', { records: initialData });
        socket.emit('initial', { data: initialData });

        // Simulate real-time updates
        setInterval(() => {
            const updates = [];
            for (let i = 0; i < 20000; i++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const portfolio = portfolios[Math.floor(Math.random() * portfolios.length)];
                const book = createBookName();
                updates.push(createTradeRecord(product, portfolio, book));
            }
            socket.emit('update', {data: updates });
        }, 1000);

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
