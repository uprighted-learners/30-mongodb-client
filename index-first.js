// import dependencies
const express = require('express');
require('dotenv').config();
const { MongoClient } = require('mongodb');

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

// POST - /api/create - create a new user
app.post('/api/create', async (req, res) => {
    let user = req.body;
    let userColl = await dbConnect();
    await userColl.insertOne(user);
    client.close();
    res.send(user);
});

// GET - /api/userdata - get all users
app.get('/api/userdata', async (req, res) => {
    let userColl = await dbConnect();
    let results = [];

    let userList = await userColl.find({});

    await userList.forEach(userObj => {
        results.push(userObj);
    })

    res.json(results);
});

// GET - /api/health - tells us if server is alive
app.get('/api/health', (req, res) => {
    res.send('OK');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});