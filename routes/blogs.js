var express = require("express");
const { blogsDB } = require("../mongo");
var router = express.Router();

router.get("/hello-blogs", (req, res) => {
  res.json({ message: "Hello from express!" });
});

router.get("/all-blogs", async (req, res) => {
  try {
    const collection = await blogsDB().collection("blogs50");
    const posts = await collection.find({}).toArray();
    res.send({ message: posts });
  } catch (error) {
    res.status(500).send("error fetching posts " + error);
  }
});

module.exports = router;
