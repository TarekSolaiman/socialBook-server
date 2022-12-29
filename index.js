const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Social book server is running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bnj1mvk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  const allpostDB = client.db("socialBook").collection("allPosts");
  const commentDB = client.db("socialBook").collection("comments");
  const userDB = client.db("socialBook").collection("users");
  try {
    // Make a user
    app.post("/user", async (req, res) => {
      const userData = req.body;
      const email = { email: userData.email };
      console.log(userData, email);
      const isUser = await userDB.findOne(email);
      if (isUser) {
        res.send({ message: "Exesting User" });
      }
      const result = await userDB.insertOne(userData);
      res.send(result);
    });

    // Read user by email
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userDB.findOne(query);
      res.send(result);
    });

    // Edit about with id
    app.patch("/user/:id", async (req, res) => {
      const id = req.params.id;
      const editData = req.body;
      console.log(editData);
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          name: editData.name,
          address: editData.address,
          university: editData.university,
        },
      };
      const result = await userDB.updateOne(query, updateDoc);
      res.send(result);
    });

    // Make comment
    app.post("/makeComment", async (req, res) => {
      const query = req.body;
      const result = await commentDB.insertOne(query);
      res.send(result);
    });

    // Read all comment by id
    app.get("/allComment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { postId: id };
      const result = await commentDB.find(query).toArray();
      res.send(result);
    });

    // Make post
    app.post("/makePost", async (req, res) => {
      const query = req.body;
      console.log(query);
      const result = await allpostDB.insertOne(query);
      res.send(result);
    });

    // Read all post
    app.get("/allpost", async (req, res) => {
      const query = {};
      const result = await allpostDB.find(query).toArray();
      res.send(result);
    });

    // Read one post by id
    app.get("/onepost/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await allpostDB.findOne(query);
      res.send(result);
    });

    // like post
    app.patch("/onepost/:id", async (req, res) => {
      const id = req.params.id;
      const likeNo = req.query.likeNo;
      console.log(id, likeNo);
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          like: likeNo,
        },
      };
      const result = await allpostDB.updateOne(query, updateDoc);

      res.send(result);
    });
  } finally {
  }
}

run().catch((e) => console.log(e.message));

app.listen(port, () => console.log(`Social book running on ${port}`));
