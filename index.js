// import dependencies
const express = require('express');
require('dotenv').config();
const { MongoClient } = require('mongodb');

// init express app
const app = express();

// declare a port
const PORT = process.env.PORT || 8080;
const mongoURI = process.env.MONGO_URI;

let client = new MongoClient(mongoURI);

// connect to mongodb
async function dbConnect() {
    try {
        await client.connect();
        let db = await client.db("test");
        let collection = await db.collection("users");
        console.log("Connected to MongoDB");
        return collection;
    } catch (error) {
        console.log(error);
    }
}

dbConnect();

app.get('/api/health', (req, res) => {
    res.send('OK');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});