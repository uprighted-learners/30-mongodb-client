// import dependencies
const express = require('express');
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

// init express app
const app = express();

// parse json body
app.use(express.json());

// declare a port
const PORT = process.env.PORT || 8080;

// declare a mongo uri
const mongoURI = process.env.MONGO_URI;

// init mongodb client
let client = new MongoClient(mongoURI);

// function to connect to DB
async function connectDb() {
    try {
        await client.connect();
        return client.db("test");
    } catch (error) {
        console.log(error);
    }
}

// run query
async function runQuery() {
    try {
        let db = await connectDb();
        let collection = await db.collection("inventory");
        console.log("Connected to MongoDB");
        return collection;
    } catch (error) {
        console.log(error);
    }
}

async function seedDatabase() {
    try {
        const db = await connectDb();
        const inventory = await db.collection("inventory");
        const seedData = [
            { item: "journal", qty: 25, size: { h: 14, w: 21, uom: "cm" }, status: "A" },
            { item: "notebook", qty: 50, size: { h: 8.5, w: 11, uom: "in" }, status: "A" },
            { item: "paper", qty: 100, size: { h: 8.5, w: 11, uom: "in" }, status: "D" },
            { item: "planner", qty: 75, size: { h: 22.85, w: 30, uom: "cm" }, status: "D" },
            { item: "postcard", qty: 45, size: { h: 10, w: 15.25, uom: "cm" }, status: "A" }
        ]
        await inventory.insertMany(seedData);
        console.log("Database seeded");
    } catch (error) {
        console.log(error);
    }
}

// GET - /api/seed - seed the database
app.get('/api/seed', async (req, res) => {
    try {
        await seedDatabase();
        res.send('Database seeded');
    } catch (error) {
        console.log(error);
    }
});


// GET - /api/health - tells us if server is alive
app.get('/api/health', (req, res) => {
    res.send('OK');
});

// DELETE - /api/deleteAll - delete all records in the "inventory" collection
app.delete('/api/deleteAll', async (req, res) => {
    try {
        let db = await connectDb();
        let collection = await db.collection("inventory");
        await collection.deleteMany({});
        res.send('All records deleted');
    } catch (error) {
        console.log(error);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});