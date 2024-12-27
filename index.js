const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.300zx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Services related APIs
    const servicesCollection = client.db('rate-ease').collection('services');

    app.get('/services', async(req, res) => {
      const cursor = servicesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/featured-services', async(req, res) => {
      const cursor = servicesCollection.find().limit(6);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/services/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await servicesCollection.findOne(query);
      res.send(result);
    })

    app.post('/add-service', async(req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    })

    app.get('/my-services', async(req, res) => {
      const email = req.query.email;
      const query = {user_email: email};
      const cursor = servicesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    //Reviews related APIs
    const reviewsCollection = client.db('rate-ease').collection('reviews');

    app.post('/reviews', async(req, res) => {
      const userReview = req.body;
      const result = await reviewsCollection.insertOne(userReview);
      res.send(result);
    })

    app.get('/my-reviews', async(req, res) => {
      const userEmail = req.query.email;
      const query = {email: userEmail};
      const cursor = reviewsCollection.find(query);
      const result = await cursor.toArray();

      for(const review of result){
        const query1 = {_id: new ObjectId(review.service_id)};
        const service = await servicesCollection.findOne(query1);
        if(service){
          review.company_name = service.company_name;
          review.company_logo = service.company_logo;
          review.service_name = service.service_name;
        }
      }
      res.send(result);
    })

    app.get('/reviews/:id', async(req, res) => {
      const id = req.params.id;
      const query = {service_id: id};
      const cursor = reviewsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('RateEase server is active.');
})

app.listen(port, () => {
    console.log(`Server active at port: ${port}`);
})