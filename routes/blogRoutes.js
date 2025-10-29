const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("All Blog Posts");
});
router.get("/:id", (req, res) => res.send(`Post ${req.params.id}`));

module.exports = router;
