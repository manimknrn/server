const express = require("express");
const { WebSocketServer } = require("ws");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let clients = [];

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

function generateData() {
    // const data = [];
    // for (let i = 0; i < products.length; i++) {
    //     const product = products[i];
    //     for (let j = 0; j < portfolios.length; j++) {
    //         const portfolio = portfolios[j];
    //         const bookCount = randomBetween(MIN_BOOK_COUNT, MAX_BOOK_COUNT);

    //         for (let k = 0; k < bookCount; k++) {
    //             const book = createBookName();
    //             const tradeCount = randomBetween(MIN_TRADE_COUNT, MAX_TRADE_COUNT);

    //             for (let l = 0; l < tradeCount; l++) {
    //                 const trade = createTradeRecord(product, portfolio, book);
    //                 data.push(trade);
    //             }
    //         }
    //     }
    // }
    // return data;

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


const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
    console.log("Client connected");

    // setInterval(() => {
    //   // Generate mock data updates
    //   const data = Array.from({ length: 10 }, (_, i) => ({
    //     trade: 24288 + 1, // Unique trade ID
    //     current: Math.floor(Math.random() * 100000) + 100,
    //   }));

    //   ws.send(JSON.stringify(data)); // Send updates as JSON
    // }, 500);

    // Simulate sending updates every second
    // setInterval(() => {
    //     const data = generateData();
    //     const updates = data.slice(0, 20); // Send only a few updates at a time
    //     ws.send(JSON.stringify(updates));
    // }, 1000);

    // Send initial data
    const initialData = generateData();
    ws.send(JSON.stringify({ type: 'initial', data: initialData }));

    // Simulate real-time updates
    setInterval(() => {
        const updates = [];
        for (let i = 0; i < 20000; i++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const portfolio = portfolios[Math.floor(Math.random() * portfolios.length)];
            const book = createBookName();
            updates.push(createTradeRecord(product, portfolio, book));
        }
        ws.send(JSON.stringify({ type: 'update', data: updates }));
    }, 1000);


});


app.listen(port, () => {
    console.log(`HTTP server running on http://localhost:${port}`);
});
