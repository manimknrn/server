const express = require("express");
const { WebSocketServer } = require("ws");
const cors = require("cors");

const app = express();
const port = 3000;

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

function generateData(count) {
    const data = [];
    let generatedCount = 0;
    for (const product of products) {
        for (const portfolio of portfolios) {
            const bookCount = randomBetween(MIN_BOOK_COUNT, MAX_BOOK_COUNT);
            for (let i = 0; i < bookCount; i++) {
                const book = createBookName();
                const tradeCount = randomBetween(MIN_TRADE_COUNT, MAX_TRADE_COUNT);
                for (let j = 0; j < tradeCount; j++) {
                    data.push(createTradeRecord(product, portfolio, book));
                    generatedCount++;

                    // Stop once the count is reached
                    if (generatedCount >= count) {
                        return data;
                    }
                }
            }
        }
    }
    return data;
}


const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
    console.log("Client connected");

    let intervalId;

    ws.on('message', (message) => {
        const payload = JSON.parse(message);

        // Send initial data based on the requested number of records
        if (payload.type === 'set-record-count') {
            const { count } = payload;
            const initialData = generateData(count);
            ws.send(JSON.stringify({ type: 'initial', data: initialData }));

            // Simulate real-time updates
            let updateCount = 0; // Track the number of updates sent

            intervalId = setInterval(() => {
                const updates = [];
                for (let i = 0; i < count; i++) {
                    const product = products[Math.floor(Math.random() * products.length)];
                    const portfolio = portfolios[Math.floor(Math.random() * portfolios.length)];
                    const book = createBookName();
                    updates.push(createTradeRecord(product, portfolio, book));
                }

                // Send the update count and data
                updateCount += updates.length;
                ws.send(JSON.stringify({ type: 'update', data: updates, updateCount: updateCount }));
            }, 1000);
        }

        if (payload.type === 'disconnect') {
            console.log("Client disconnected");
            ws.close();  // Close the WebSocket connection
            clearInterval(intervalId);
        }
    });

    // Handle the connection closure
    ws.on('close', () => {
        console.log('Connection closed');
        clearInterval(intervalId);
    });

    // ws.on('disconnect', () => {
    //     clearInterval();
    //     clearTimeout();
    //     console.log('user disconnected');
    // });
});


app.listen(port, () => {
    console.log(`HTTP server running on http://localhost:${port}`);
});