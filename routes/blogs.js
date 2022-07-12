var express = require("express");
var router = express.Router();
const { blogsDB } = require("../mongo");
const { serverCheckBlogIsValid } = require("../utils/validation");

router.get("/hello-blogs", (req, res) => {
  res.json({ message: "Hello from express!" });
});

router.get("/all-blogs", async (req, res) => {
  try {
    const collection = await blogsDB().collection("blogs50");
    const limit = Number(req.query.limit);
    const skip = Number(req.query.limit) * (Number(req.query.page) - 1);
    const sortField = req.query.sortField;
    // if sort field is equal to "ASC", then sequential (1), if not, sequential in reverse order (-1).
    const sortOrder = req.query.sortOrder === "ASC" ? 1 : -1;
    const filterField = req.query.filterField;
    const filterValue = req.query.filterValue;

    let filterObj = {};
    if (filterField && filterValue) {
      filterObj = { [filterField]: filterValue };
    }
    let sortObj = {};
    if (sortField && sortOrder) {
      sortObj = { [sortField]: sortOrder };
    }

    // const posts = await collection.find({}).toArray();
    const posts = await collection
      .find(filterObj)
      .sort(sortObj)
      .limit(limit)
      .skip(skip)
      .toArray();
    res.json({ message: posts });
  } catch (error) {
    res.status(500).send("error fetching posts " + error);
  }
});

router.post("/blog-submit", async (req, res, next) => {
  try {
    // const collection = await blogsDB().collection("blogs50");
    // const sortedBlogArray = await collection.find({}).sort({ id: 1 }).toArray();
    // const lastBlog = sortedBlogArray[sortedBlogArray.length - 1];

    const blogIsValid = serverCheckBlogIsValid(req.body);

    if (!blogIsValid) {
      res.status(400).json({
        message:
          "To submit a blog you must include Title, Author, Category, and Text.",
        success: false,
      });
      return;
    }

    const collection = await blogsDB().collection("blogs50");
    const sortedBlogArray = await collection.find({}).sort({ id: 1 }).toArray();
    const lastBlog = sortedBlogArray[sortedBlogArray.length - 1];

    console.log(req.body);
    const title = req.body.title;
    const text = req.body.text;
    const author = req.body.author;
    const category = req.body.category;

    const blogPost = {
      title: title,
      text: text,
      author: author,
      category: category,
      createdAt: new Date(),
      id: Number(lastBlog.id + 1),
      lastModified: new Date(),
    };

    await collection.insertOne(blogPost);
    res.status(200).json({ message: "Post has been submitted", success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error posting blog." + error, success: false });
  }
});

module.exports = router;
