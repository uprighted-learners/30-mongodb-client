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

// run query function
async function runQuery() {
    try {
        let db = await connectDb();
        let collection = await db.collection("inventory");
        console.log("Connected to MongoDB");
        const results = await collection.find(
            {
                status: "A",
                $or: [
                    { qty: { $lt: 30 } },
                    { "size.h": { $gt: 10 } }
                ]
            }
        )
        // console.log(results);
        await results.forEach(doc => console.log(doc));
        return collection;
    } catch (error) {
        console.log(error);
    }
}

// runQuery();

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

// GET - /api/inventory - get all inventory items
app.get('/api/inventory', async (req, res) => {
    try {
        let db = await connectDb();
        let collection = await db.collection("inventory");
        let results = [];
        let inventoryList = await collection.find({});
        await inventoryList.forEach(inventoryObj => {
            results.push(inventoryObj);
        })
        res.json(results);
    } catch (error) {
        console.log(error);
    }
});

// GET - /api/inventory/:id - get an inventory item by ID
app.get('/api/inventory/:id', async (req, res) => {
    const db = await connectDb();
    const inventory = db.collection("inventory");
    const id = req.params.id;
    try {
        const item = await inventory.findOne({ _id: new ObjectId(id) });
        if (item) {
            res.status(200).json(item);
        } else {
            res.status(404).json({ message: "Item not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - /api/inventory - create a new inventory item
app.post('/api/inventory', async (req, res) => {
    const db = await connectDb();
    const inventory = db.collection("inventory");
    const newItem = req.body;
    try {
        const result = await inventory.insertOne(newItem);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - /api/inventory/:id - update an inventory item by ID
app.put('/api/inventory/:id', async (req, res) => {
    const db = await connectDb();
    const inventory = db.collection("inventory");
    const id = req.params.id;
    const item = req.body;
    try {
        const result = await inventory.updateOne(
            { _id: new ObjectId(id) },
            { $set: item }
        );
        if (result.matchedCount === 1) {
            res.status(200).json({ message: "Item updated" });
        } else {
            res.status(404).json({ message: "Item not found" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE - /api/inventory/:id - delete an inventory item by ID
app.delete('/api/inventory/:id', async (req, res) => {
    const db = await connectDb();
    const inventory = db.collection("inventory");
    const id = req.params.id;
    try {
        const result = await inventory.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
            res.status(200).json({ message: "Item deleted" });
        } else {
            res.status(404).json({ message: "Item not found" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
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