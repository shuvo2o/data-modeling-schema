const express = require('express')
const cors = require('cors');
const app = express()
const { ObjectId } = require('mongodb');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 3000

// middleware
app.use(express.json())
app.use(cors());


// connect to mongodb
const uri = process.env.MONGODB_URL;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        // create db and collection
        const db = client.db("data-modeling-schema");
        const usersCollection = db.collection("users");
        const productsCollection = db.collection("products");

        // basic indexing
        usersCollection.createIndex({ name:1, email:1}, {unique:true}) 
        usersCollection.createIndex({ createdAt:-1})
        // productsCollection.createIndex({ description:"text"}) 
        
        // add product
        productsCollection.insertOne({
            name: "Product 1",
            category: "Cat1",
            price:200,
            description:"This is product 1",
            tags:["smartphone", "electronics", "mobile"]
        })

        app.post("/add-user", async (req, res) => {
            try {
                const user = req.body;
                const result = await usersCollection.insertOne(user);
                res.json({
                    message: "User added successfully",
                    user
                });
            } catch (error) {
                res.status(500).send({ message: "Failed to add user", error: error.message });
            }

        })

        // get users with index
        app.get("/users", async (req, res)=>{
            const {email,name} = req.query;
            const users = await usersCollection.find().sort({createdAt: 1}).toArray();
            res.send(users);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //   await client.close();
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Data Modeling and Schema Server is running")
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})