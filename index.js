require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Services related APIs
    const servicesCollection = client.db('rate-ease').collection('services');

    app.get('/services', (req, res) => {
      servicesCollection.find().toArray()
        .then(result => res.send(result))
        .catch(error => res.status(500).send({ error: 'Error retrieving services.' }));
    });

    app.get('/featured-services', (req, res) => {
      servicesCollection.find().limit(6).toArray()
        .then(result => res.send(result))
        .catch(error => res.status(500).send({ error: 'Error retrieving featured services.' }));
    });

    app.get('/services/:id', (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      servicesCollection.findOne(query)
        .then(result => res.send(result))
        .catch(error => res.status(500).send({ error: 'Error retrieving the service.' }));
    });

    app.post('/add-service', (req, res) => {
      const service = req.body;
      servicesCollection.insertOne(service)
        .then(result => res.send(result))
        .catch(error => res.status(500).send({ error: 'Error adding service.' }));
    });

    app.get('/my-services', (req, res) => {
      const email = req.query.email;
      const query = { user_email: email };
      servicesCollection.find(query).toArray()
        .then(result => res.send(result))
        .catch(error => res.status(500).send({ error: 'Error retrieving user services.' }));
    });

    app.get('/my-services/:id', (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      servicesCollection.findOne(query)
        .then(result => res.send(result))
        .catch(error => res.status(500).send({ error: 'Error retrieving the service.' }));
    });

    app.put('/my-services/:id', (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedService = req.body;
      const service = {
        $set: {
          company_name: updatedService.company_name,
          company_logo: updatedService.company_logo,
          service_name: updatedService.service_name,
          service_description: updatedService.service_description,
          service_category: updatedService.service_category,
          website: updatedService.website
        }
      };
      servicesCollection.updateOne(filter, service, options)
        .then(result => res.send(result))
        .catch(error => res.status(500).send({ error: 'Error updating service.' }));
    });

    app.delete('/my-services/:id', (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      servicesCollection.deleteOne(query)
        .then(result => res.send(result))
        .catch(error => res.status(500).send({ error: 'Error deleting service.' }));
    });

    //Reviews related APIs
    const reviewsCollection = client.db('rate-ease').collection('reviews');

    app.post('/reviews', (req, res) => {
      const userReview = req.body;
      reviewsCollection.insertOne(userReview)
        .then(result => res.send(result))
        .catch(error => res.status(500).send({ error: 'Error posting review.' }));
    });

    app.get('/my-reviews', (req, res) => {
      const userEmail = req.query.email;
      const query = { email: userEmail };
      reviewsCollection.find(query).toArray()
        .then(result => {
          const promises = result.map((review) => {
            const query1 = { _id: new ObjectId(review.service_id) };
            return servicesCollection.findOne(query1)
              .then(service => {
                if (service) {
                  review.company_name = service.company_name;
                  review.company_logo = service.company_logo;
                  review.service_name = service.service_name;
                }
                return review;
              });
          });
          Promise.all(promises).then(updatedReviews => {
            res.send(updatedReviews);
          });
        })
        .catch(error => res.status(500).send({ error: 'Error retrieving user reviews.' }));
    });

    app.get('/reviews/:id', (req, res) => {
      const id = req.params.id;
      const query = { service_id: id };
      reviewsCollection.find(query).toArray()
        .then(result => res.send(result))
        .catch(error => res.status(500).send({ error: 'Error retrieving reviews.' }));
    });

    app.get('/my-reviews/:id', (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      reviewsCollection.findOne(query)
        .then(result => res.send(result))
        .catch(error => res.status(500).send({ error: 'Error retrieving the review.' }));
    });

    app.put('/my-reviews/:id', (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedReview = req.body;
      const review = {
        $set: {
          rating: updatedReview.rating,
          review: updatedReview.review
        }
      };
      reviewsCollection.updateOne(filter, review, options)
        .then(result => res.send(result))
        .catch(error => res.status(500).send({ error: 'Error updating review.' }));
    });

    app.delete('/my-reviews/:id', (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      reviewsCollection.deleteOne(query)
        .then(result => res.send(result))
        .catch(error => res.status(500).send({ error: 'Error deleting review.' }));
    });

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