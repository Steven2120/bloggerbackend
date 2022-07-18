var express = require("express");
var router = express.Router();
const { blogsDB } = require("../mongo");
const { serverCheckBlogIsValid } = require("../utils/validation");

router.get("/blog-list", async (req, res, next) => {
  try {
    const collection = await blogsDB().collection("blogs50");
    const blogs50 = await collection
      .find({})
      .sort({ id: -1 })
      .project({
        // 1 = includes, 0 = excludes
        title: 1,
        author: 1,
        createdAt: 1,
        lastModified: 1,
        text: 1,
        id: 1,
      })
      .toArray();
    res.status(200).json({ message: blogs50, success: true });
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts.", success: false });
  }
});

router.put("/edit-blog", async (req, res) => {
  try {
    const updateBlogIsValid = serverCheckBlogIsValid(req.body);
    if (!updateBlogIsValid) {
      res
        .status(400)
        .json({ message: "Blog update is not valid", success: false });
      return;
    }

    const newPostData = req.body;
    const date = new Date();
    const updateBlog = { ...newPostData, lastModified: date };
    const collection = await blogsDB().collection("blogs50");

    await collection.updateOne(
      { id: newPostData.id },
      { $set: { ...updateBlog } }
    );
    res.status(200).json({ message: "Blog update success", success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating blog" + error, success: false });
  }
});

router.delete("/delete-blog/:blogId", async (req, res) => {
  try {
    const blogId = Number(req.params.blogId);
    const collection = await blogsDB().collection("blogs50");
    const blogToDelete = await collection.deleteOne({ id: blogId });
    if (blogToDelete.deletedCount === 1) {
      res.json({ message: "Successfully deleted", success: true }).status(200);
    } else {
      res.json({ message: "Delete unsuccessful", success: false }).status(204);
    }
  } catch (error) {
    res.status(500).json({ message: "Error" + error, success: false });
  }
});

module.exports = router;
