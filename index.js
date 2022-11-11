const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

const fileUpload = require("express-fileupload");
const ObjectID = require("mongodb").ObjectId;

const fs = require("fs-extra");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

console.log(process.env.DB_USER);
 
//middle wares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sa2k7xp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`


const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



app.get("/", (req, res) => {
  res.send("Hello from underWorld!");
  
});

client.connect((err) => {
  const reviewCollection = client.db("cleaner").collection("reviews");
  const serviceCollection = client.db('cleaner').collection('service');


  //get servic data

  app.get('/service',async(req,res) =>{
    const query = {};
    const cursor = serviceCollection.find(query);
    const services = await cursor.toArray();
    res.send(services);
  })

  app.get('/clnServices',async(req,res) =>{
    const query = {};
    const cursor = serviceCollection.find(query);
    const services = await cursor.limit(3).toArray();
    res.send(services);
  })

  //post


  app.post("/addServices", (req, res) => {
    const balance = req.body.balance;
    const title = req.body.title;
    const about = req.body.about;
    const picture = req.body.picture;

    serviceCollection.insertOne({ balance, title, about, picture }).then((result) => {
        res.send(result.insertedCount > 0);
        
      });
    
  });

    // Load single data
    app.get("/clnService/:id", async(req, res) => {
      const id = req.params.id; 
      const query = {_id: ObjectID(id)};
      const clnServices = await serviceCollection.findOne(query);
      res.send(clnServices);
         
    });
  
  // Add service to databaseName
  app.post("/addService", (req, res) => {
    const file = req.files.image;
    const name = req.body.name;
    const price = req.body.price;
    const filePath = `${__dirname}/services/${file.name}`;
    const newImage = file.data;
    const convertImg = newImage.toString("base64");

    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(convertImg, "base64"),
    };

    serviceCollection.insertOne({ name, price, image }).then((result) => {
      res.send(result.insertedCount > 0);
    });

  });




  // Review
  app.get("/reviews", (req, res) => {
    reviewCollection.find({}).sort( { "create_at": -1 } ).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // Add review
  app.post("/addReview", (req, res) => {
    const file = req.files.image;
    const name = req.body.name;
    const review = req.body.review;
    const create_at = Date.now();
    const filePath = `${__dirname}/services/${file.name}`;

    const newImage = file.data;
    const convertImg = newImage.toString("base64");

    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(convertImg, "base64"),
    };

    reviewCollection.insertOne({ name, review, image,create_at }).then((result) => {
      res.send(result.insertedCount > 0);

    });

  });

  // Review Delete
  app.delete("/review/:id", (req, res) => {
    const id = ObjectID(req.params.id);

    reviewCollection.findOneAndDelete({ _id: id }).then((documents) => {
      res.send('Review Deleted');
      console.log("Review deleted successfully");
    });
  });

  // Load single review
  app.get("/review/:id", async(req, res) => {
    const id = req.params.id;
    const query = {_id: ObjectID(id)};
    const review = await reviewCollection.findOne(query);
    res.send(review);
  });

  // Load single review
  app.put("/update/review/:id", async(req, res) => {
    const id = req.params.id;
    const file = req.files.image;
    const name = req.body.name;
    // const review = req.body.review;
    const query = {_id: ObjectID(id)};
    const review = await reviewCollection.updateOne({_id: ObjectID(id)},{
      $set: {
        name: name
      }
    });
    res.send(review);
  });

  console.log({ err });
  console.log("Db connected");
  // perform actions on the collection object
  // client.close();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})

module.exports =app;